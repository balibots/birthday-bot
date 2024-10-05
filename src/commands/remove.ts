import { CommandContext } from 'grammy';
import { MyContext } from '../bot';
import { removeRecord } from '../postgres';
import { isGroup, sanitizeName } from '../utils';
import { t } from 'i18next';
import { getConfigForGroup } from '../config';
import { set } from '../cache';

export const removeCommand = async (ctx: CommandContext<MyContext>) => {
  if (!ctx.parsedChatId) {
    return ctx.reply(t('errors.invalidChatId', { chatId: ctx.parsedChatId }));
  }

  let [name] = ctx.match?.split(',').map((parts) => parts.trim()) || [];

  if (!name) {
    const msg = await ctx.reply(t('commands.remove.askForData'), {
      parse_mode: 'Markdown',
      reply_markup: { force_reply: true },
    });

    set(`msg:${msg.message_id}`, 'REMOVE');

    return;
  }

  await removeRecordFromMessage(ctx);
};

export async function removeRecordFromMessage(ctx: MyContext) {
  const text = ctx.match || ctx.message?.text;

  if (!text) {
    return ctx.reply(t('errors.couldNotGetMessageText'));
  }

  let [name] =
    text
      .toString()
      .split(',')
      .map((parts) => parts.trim()) || [];

  if (!name) {
    return await ctx.reply(t('commands.remove.missingName'), {
      parse_mode: 'Markdown',
    });
  }

  // limits add commands to group admins
  try {
    const groupConfig = await getConfigForGroup(ctx.parsedChatId);

    if (groupConfig && groupConfig.restrictedToAdmins) {
      const chatMember = await ctx.api.getChatMember(
        ctx.parsedChatId,
        ctx.from!.id
      );
      if (!['administrator', 'creator'].includes(chatMember.status)) {
        return ctx.reply(t('errors.notAdmin'));
      }
    }
  } catch (error) {
    return ctx.reply(t('commands.remove.error'));
  }

  try {
    const record = {
      name: sanitizeName(name),
      chatId: ctx.parsedChatId,
    };

    console.log(`Removing record: ${JSON.stringify(record, null, 2)}`);

    const removedRecord = await removeRecord(record);
    return ctx.reply(
      t('commands.remove.success', {
        name: removedRecord.name,
        date: removedRecord.date,
      })
    );
  } catch (error) {
    return ctx.reply(t('commands.remove.notFound'));
  }
}
