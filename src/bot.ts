import express from 'express';
import { Bot, Context, webhookCallback } from 'grammy';
import { DateTime } from 'luxon';
import {
  birthdaysCommand,
  listCommand,
  nextCommand,
  addCommand,
  removeCommand,
  allCommands,
} from './commands';
import { addRecord, getRecordsByDayAndMonth } from './dynamodb';
import { set } from './cache';
import { withChatId } from './middlewares';
import generateSalutation from './salutations';
import './i18n';

import apiRoutes from './api';

export type MyContext = Context & { chatId: number };
const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN);

// Bot Commands:
bot.command(['aniversarios', 'birthdays'], withChatId, birthdaysCommand);
bot.command(['list', 'idades'], withChatId, listCommand);
bot.command(['proximo', 'next'], withChatId, nextCommand);
bot.command(['debug'], async (ctx) => {
  console.log(JSON.stringify(ctx, null, 2));
});

// Admin commands:
// /add name, date
// /add name, date, chatId (for private chats)
bot.command('add', addCommand);
bot.command('remove', removeCommand);

// Triggers
bot.on('message:new_chat_members:me', async (ctx) => {
  console.log(ctx, ctx.chat);
  if ('title' in ctx.chat) {
    ctx.reply(`Howdy ${ctx.chat.title}! (id: ${ctx.chat.id})`);
    await set(`chatIds:${ctx.chat.title}`, String(ctx.chat.id));
  }
});

// Command reference
bot.api.setMyCommands(allCommands);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', apiRoutes);

app.post('/trigger', async (req, res) => {
  console.log('Triggering birthday alerts at', new Date());
  const today = DateTime.now();
  const birthdays = await getRecordsByDayAndMonth({
    day: today.day,
    month: today.month,
  });

  console.info(`Notifying ${birthdays.length} users today`);

  birthdays.forEach((birthday) => {
    const formattedMsg = generateSalutation(birthday);
    console.info(
      `Sending message to group ${birthday.chatId} about ${birthday.name}`
    );

    bot.api.sendMessage(birthday.chatId, formattedMsg, {
      parse_mode: 'Markdown',
    });
  });

  res.json({ birthdays });
});

const server = app.listen(PORT, async () => {
  console.log('HTTP server started');

  // Start the bot
  if (process.env.NODE_ENV === 'production') {
    // Using Webhook in production
    app.use(webhookCallback(bot, 'express'));
  } else {
    // Use Long Polling for development
    bot.start();
  }

  console.log(`Bot listening on port ${PORT}`);
});
