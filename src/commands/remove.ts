import { CommandContext } from 'grammy';
import { DateTime } from 'luxon';
import { MyContext } from '../bot';
import { removeRecord } from '../dynamodb';
import { sanitizeName } from '../utils';

export const removeCommand = async (ctx: CommandContext<MyContext>) => {
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
};
