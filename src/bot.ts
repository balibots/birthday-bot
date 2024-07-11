import express from 'express';
import { Bot, Context, GrammyError, HttpError, webhookCallback } from 'grammy';
import { DateTime } from 'luxon';
import {
  birthdaysCommand,
  listCommand,
  nextCommand,
  addCommand,
  removeCommand,
  helpCommand,
  magicCommand,
  configCommand,
  allCommands,
} from './commands';
import {
  addRecord,
  getRecordsByDayAndMonth,
  insertGroupChat,
} from './postgres';
import { set } from './cache';
import { setConfigForGroup } from './config';
import { withChatId } from './middlewares';
import generateSalutation from './salutations';
import { t } from 'i18next';
import './i18n';

import apiRoutes from './api';
import triggerEndpoint from './endpoints/trigger';
import setLanguage from './middlewares/setLanguage';

export type MyContext = Context & { chatId: number } & { config: CtxConfig };
interface CtxConfig {
  language: string;
}
const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN);

/** sorry everyone!! **/
// @ts-ignore
BigInt.prototype['toJSON'] = function () {
  return this.toString();
};
/** ---- ignore, proceed ---- **/

bot.use(setLanguage);

bot.command(['aniversarios', 'birthdays'], withChatId, birthdaysCommand);
bot.command(['idades', 'list', 'ages'], withChatId, listCommand);
bot.command(['proximo', 'next'], withChatId, nextCommand);
bot.command(['config'], withChatId, configCommand);
bot.command(['ajuda', 'help'], helpCommand);
bot.command(['debug'], async (ctx) => {
  console.log(JSON.stringify(ctx, null, 2));
});

// /add name, date
// /add name, date, chatId (for private chats)
bot.command('add', addCommand);
bot.command('remove', removeCommand);

bot.command('birthdaybot', magicCommand);

// Triggers
bot.on('message:new_chat_members:me', async (ctx) => {
  if ('title' in ctx.chat) {
    const msg = t('welcomeGroup', {
      chatId: ctx.chat.id,
      chatTitle: ctx.chat.title,
    });

    ctx.reply(msg, {
      parse_mode: 'Markdown',
    });

    await insertGroupChat({ id: ctx.chat.id, name: ctx.chat.title });

    const masterId = ctx.from.id;

    await setConfigForGroup(ctx.chat.id, { masterId, notificationHour: 8 });
  }
});

// Command reference
bot.api.setMyCommands(allCommands);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', apiRoutes);

app.post('/trigger', async (req, res) => {
  const birthdays = await triggerEndpoint({
    sendMessage: async (id: number, msg: string, opts?: any) =>
      await bot.api.sendMessage(id, msg, opts),
  });
  res.json({ birthdays });
});

// error handling
bot.catch(async (err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Error in request:', e);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }

  await ctx.reply(
    t('errors.internalError', { message: (e as any).description }),
    {
      parse_mode: 'Markdown',
    }
  );
});

// Start the bot
if (process.env.NODE_ENV === 'production') {
  // Using Webhook in production
  console.log('Using webhooks');
  app.use(webhookCallback(bot, 'express'));
} else {
  // Use Long Polling for development
  console.log('Using long polling');
  bot.start();
}

const server = app.listen(PORT, async () => {
  console.log('HTTP server started');
  console.log(`Bot listening on port ${PORT}`);
});
