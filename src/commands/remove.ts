import { CommandContext } from 'grammy';
import { DateTime } from 'luxon';
import { MyContext } from '../bot';
import { removeRecord } from '../dynamodb';
import { isGroup, sanitizeName } from '../utils';
import { t } from 'i18next';

export const removeCommand = async (ctx: CommandContext<MyContext>) => {
  let [name, chatId] = ctx.match?.split(',').map((parts) => parts.trim()) || [];

  let intChatId = parseInt(chatId);

  // if we're sending commands from a group, will get the id from the message
  if (isGroup(ctx.chat)) {
    intChatId = ctx.chat.id;
  }

  if (!name) {
    if (isGroup(ctx.chat)) {
      return ctx.reply(t('commands.remove.missingName'), {
        parse_mode: 'Markdown',
      });
    } else {
      return ctx.reply(t('commands.remove.missingGroup'), {
        parse_mode: 'Markdown',
      });
    }
  }

  // limits add commands to group admins
  try {
    const chatMember = await ctx.api.getChatMember(intChatId, ctx.from!.id);
    if (!['administrator', 'creator'].includes(chatMember.status)) {
      return ctx.reply(t('errors.notAdmin'));
    }
  } catch (error) {
    return ctx.reply(
      t('commands.remove.error', { error: (error as Error).message })
    );
  }

  try {
    const record = {
      name: sanitizeName(name),
      date: DateTime.fromISO(date).toFormat('yyyy-MM-dd'),
      chatId: intChatId,
    };

    console.log(`Removing record: ${JSON.stringify(record, null, 2)}`);

    await removeRecord(record);
    return ctx.reply(t('commands.remove.success', { name, date }));
  } catch (error) {
    return ctx.reply(t('commands.remove.notFound', { error }));
  }
};
