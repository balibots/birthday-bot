import { CommandContext } from 'grammy';
import { DateTime } from 'luxon';
import { MyContext } from '../bot';
import { getConfigForGroup } from '../config';
import { addRecord } from '../dynamodb';
import { getGender } from '../genderize';
import { isGroup, sanitizeName } from '../utils';

export const addCommand = async (ctx: CommandContext<MyContext>) => {
  let [name, date, chatId] = ctx.match?.split(',').map((s) => s.trim()) || [];

  let intChatId = Number(chatId);

  // if we're sending commands from a group, will get the id from the message
  if (isGroup(ctx.chat)) {
    intChatId = ctx.chat.id;
  }

  if (isNaN(intChatId) || !intChatId) {
    return ctx.reply(`Invalid Chat ID, got ${chatId}`);
  }

  if (!name || !date) {
    if (isGroup(ctx.chat)) {
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
    const groupConfig = await getConfigForGroup(intChatId);

    if (groupConfig && groupConfig.restrictedToAdmins) {
      const chatMember = await ctx.api.getChatMember(intChatId, ctx.from!.id);
      if (!['administrator', 'creator'].includes(chatMember.status)) {
        return ctx.reply(
          'Apenas administratores do grupo podem adicionar e remover aniversariantes!'
        );
      }
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
};
