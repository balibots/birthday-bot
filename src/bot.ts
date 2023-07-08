import express from 'express';
import {
  Bot,
  CommandContext,
  Context,
  MiddlewareFn,
  webhookCallback,
} from 'grammy';
import { ageLine, birthdayLine, nextBirthday } from './interface';
import {
  addRecord,
  getRecord,
  removeRecord,
  clearDB,
  getRecordsByChatId,
  getRecordsByDayAndMonth,
  getRecords,
} from './dynamodb';
import generateSalutation from './salutations';
import { sanitizeName, sortAbsoluteDate, sortClosestDate } from './utils';
import { DateTime } from 'luxon';
import { getGender } from './genderize';

type MyContext = Context & { chatId: number };
const bot = new Bot<MyContext>(process.env.TELEGRAM_TOKEN);

const withChatId: MiddlewareFn<MyContext> = async (ctx, next) => {
  let chatId: number;

  if (ctx.chat?.type === 'group') {
    chatId = ctx.chat.id;
  } else {
    // on a private 1:1, need to supply chatId on the message
    chatId = parseInt(typeof ctx.match === 'string' ? ctx.match : '');

    if (!ctx.match) {
      return ctx.reply(`Need a Chat ID on a private chat.`);
    }
    if (isNaN(chatId)) {
      return ctx.reply(`Invalid Chat ID provided, got '${ctx.match}'.`);
    }
  }

  ctx.chatId = chatId;

  await next();
};

bot.command(['aniversarios', 'birthdays'], withChatId, async (ctx) => {
  const birthdays = (await getRecordsByChatId(ctx.chatId)).sort(
    sortClosestDate
  );

  if (birthdays.length === 0) {
    return ctx.reply('No birthdays yet');
  } else {
    return ctx.reply(birthdays.map(birthdayLine).join('\n'), {
      parse_mode: 'Markdown',
    });
  }
});

bot.command(['list', 'idades'], withChatId, async (ctx) => {
  const birthdays = (await getRecordsByChatId(ctx.chatId)).sort(
    sortAbsoluteDate
  );

  if (birthdays.length === 0) {
    return ctx.reply('No birthdays yet');
  } else {
    return ctx.reply(birthdays.map(ageLine).join('\n'), {
      parse_mode: 'MarkdownV2',
    });
  }
});

bot.command(['proximo', 'next'], withChatId, async (ctx) => {
  const birthdays = await getRecordsByChatId(ctx.chatId);
  const next = birthdays.sort(sortClosestDate)[0];

  if (!next) {
    return ctx.reply('No birthdays yet');
  }

  const nextRecord = await getRecord(next);

  if (!nextRecord) {
    return ctx.reply('Error getting data');
  }

  return ctx.reply(nextBirthday(nextRecord), { parse_mode: 'MarkdownV2' });
});

bot.command(['debug'], async (ctx) => {
  console.log(JSON.stringify(ctx, null, 2));
});

bot.on('message:new_chat_members:me', async (ctx) => {
  if ('title' in ctx.chat) {
    ctx.reply(`Howdy ${ctx.chat.title}! (id: ${ctx.chat.id})`);
  }
});

// /add name, date
// /add name, date, chatId (for private chats)
bot.command('add', async (ctx) => {
  let [name, date, chatId] = ctx.match?.split(',').map((s) => s.trim()) || [];

  let intChatId = Number(chatId);

  // if we're sending commands from a group, will get the id from the message
  if (ctx.chat.type === 'group') intChatId = ctx.chat.id;

  if (isNaN(intChatId) || !intChatId) {
    return ctx.reply(`Invalid Chat ID, got ${chatId}`);
  }

  if (!name || !date) {
    if (ctx.chat.type === 'group') {
      return ctx.reply(
        'Please provide a name, a date in this format: `/add John, 1999-11-25`',
        {
          parse_mode: 'MarkdownV2',
        }
      );
    } else {
      return ctx.reply(
        'Please provide a name, a date and a chatId in this format: `/add John, 1999-11-25, -12345`',
        { parse_mode: 'MarkdownV2' }
      );
    }
  }

  // limits add commands to group admins
  try {
    const chatMember = await ctx.api.getChatMember(intChatId, ctx.from!.id);
    if (!['administrator', 'creator'].includes(chatMember.status)) {
      return ctx.reply(
        'Apenas administratores do grupo podem adicionar e remover aniversariantes!'
      );
    }
  } catch (e) {
    return ctx.reply('Group ID not found probably: ' + (e as Error).message);
  }

  const parsedDate = DateTime.fromISO(date);

  if (!parsedDate.isValid) {
    return ctx.reply(
      "Couldn't parse date, please provide a date in this format: `/add John, 1999-11-25`",
      { parse_mode: 'MarkdownV2' }
    );
  }

  const sanitized = sanitizeName(name);
  const gender = await getGender(sanitized);

  const params = {
    name: sanitized,
    date: parsedDate.toFormat('yyyy-MM-dd'),
    month: parsedDate.month,
    day: parsedDate.day,
    gender,
    chatId: intChatId,
  };

  const record = await addRecord(params);

  return ctx.reply(
    `Aniversariante adicionado: ${record.name} — ${record.date}`
  );
});

bot.command('remove', async (ctx) => {
  let [name, date, chatId] = ctx.match?.split(',').map((s) => s.trim()) || [];

  let intChatId = parseInt(chatId);

  // if we're sending commands from a group, will get the id from the message
  if (ctx.chat.type === 'group') intChatId = ctx.chat.id;

  if (isNaN(intChatId) || !intChatId) {
    return ctx.reply(`Invalid Chat ID, got ${chatId}`, {
      parse_mode: 'MarkdownV2',
    });
  }

  if (!name || !date) {
    if (ctx.chat.type === 'group') {
      return ctx.reply(
        'Please provide a name, a date in this format: `/add John, 1999-11-25`',
        {
          parse_mode: 'MarkdownV2',
        }
      );
    } else {
      return ctx.reply(
        'Please provide a name, a date and a chatId in this format: `/add John, 1999-11-25, -12345`',
        { parse_mode: 'MarkdownV2' }
      );
    }
  }

  // limits add commands to group admins
  try {
    const chatMember = await ctx.api.getChatMember(intChatId, ctx.from!.id);
    if (!['administrator', 'creator'].includes(chatMember.status)) {
      return ctx.reply(
        'Apenas administratores do grupo podem adicionar e remover aniversariantes!'
      );
    }
  } catch (e) {
    return ctx.reply('Group ID not found probably: ' + (e as Error).message);
  }

  try {
    const record = {
      name: sanitizeName(name),
      date: DateTime.fromISO(date).toFormat('yyyy-MM-dd'),
      chatId: intChatId,
    };

    console.log(`Removing record: ${JSON.stringify(record, null, 2)}`);

    await removeRecord(record);
    return ctx.reply(`Aniversariante removido: ${name} - ${date}`);
  } catch (e) {
    return ctx.reply(`Nao encontrei esse aniversariante (${e}).`);
  }
});

// Commands to be used in the live version. The other commands above are for development only.
let commands = [
  {
    command: 'aniversarios',
    description:
      'Mostra a lista completa de aniversários ordenados do mais próximo para o mais distante',
  },
  {
    command: 'idades',
    description:
      'Mostra a lista completa de idades ordenadas por data de nascimento',
  },
  {
    command: 'proximo',
    description: 'Mostra o próximo aniversário',
  },
  {
    command: 'add',
    description:
      'Adiciona novo aniversariante. Limitado a Admins do grupo para evitar abusos de confiança.',
  },
  {
    command: 'remove',
    description:
      'Remove um aniversariante. Limitado a Admins do grupo para evitar abusos de confiança.',
  },
];

bot.api.setMyCommands(commands);

const app = express();

// Use Webhooks for the production server
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot listening on port ${PORT}`);
});

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

app.get('/list/:chatId', async (req, res) => {
  const birthdays = await getRecordsByChatId(parseInt(req.params.chatId));

  res.json({ birthdays });
});

// Start the server
if (process.env.NODE_ENV === 'production') {
  console.log('Using Webhooks');
  app.use(webhookCallback(bot, 'express'));
} else {
  // Use Long Polling for development
  bot.start();
}
