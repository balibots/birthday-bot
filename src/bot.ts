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
import {
  addRecord,
  getRecordsByChatId,
  getRecordsByDayAndMonth,
  removeAllByChatId,
} from './dynamodb';
import { connect, disconnect } from './cache';
import { getGender } from './genderize';
import { requireKey, withChatId } from './middlewares';
import generateSalutation from './salutations';
import { sanitizeName } from './utils';
import './i18n';

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
  if ('title' in ctx.chat) {
    ctx.reply(`Howdy ${ctx.chat.title}! (id: ${ctx.chat.id})`);
  }
});

// Command reference
bot.api.setMyCommands(allCommands);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/trigger', async (req, res) => {
  const today = DateTime.now();
  const birthdays = await getRecordsByDayAndMonth({
    day: today.day,
    month: today.month,
  });

  birthdays.forEach((birthday) => {
    const formattedMsg = generateSalutation(birthday);

    bot.api.sendMessage(birthday.chatId, formattedMsg, {
      parse_mode: 'Markdown',
    });
  });

  res.json({ birthdays });
});

app.get('/:chatId/list', requireKey, async (req, res) => {
  const birthdays = await getRecordsByChatId(parseInt(req.params.chatId));
  res.json({ birthdays });
});

app.post('/:chatId/import', requireKey, async (req, res) => {
  const birthdays = req.body.birthdays;

  if (!birthdays) {
    res.status(400).json({ error: 'Need a birthdays array' });
  }

  for (const b of birthdays) {
    const parsedDate = DateTime.fromISO(b.date);
    const sanitized = sanitizeName(b.name);
    const gender = await getGender(sanitized);

    const params = {
      name: sanitized,
      date: parsedDate.toFormat('yyyy-MM-dd'),
      month: parsedDate.month,
      day: parsedDate.day,
      gender,
      chatId: parseInt(req.params.chatId),
    };

    await addRecord(params);
  }

  res.json({ birthdays });
});

app.post('/:chatId/clear', requireKey, async (req, res) => {
  removeAllByChatId(parseInt(req.params.chatId));
  res.json({});
});

const server = app.listen(PORT, async () => {
  console.log('HTTP server started');
  await connect();

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

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await disconnect();
    console.log('HTTP server closed');
    process.exit(0);
  });
});
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    await disconnect();
    console.log('HTTP server closed');
    process.exit(0);
  });
});
