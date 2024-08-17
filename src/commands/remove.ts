import { CommandContext } from 'grammy';
import { MyContext } from '../bot';
import { removeRecord } from '../postgres';
import { isGroup, sanitizeName } from '../utils';
import { t } from 'i18next';
import { getConfigForGroup } from '../config';

export const removeCommand = async (ctx: CommandContext<MyContext>) => {
  if (!ctx.parsedChatId) {
    return ctx.reply(t('errors.invalidChatId', { chatId: ctx.parsedChatId }));
  }

  let [name] = ctx.match?.split(',').map((parts) => parts.trim()) || [];

  if (!name) {
    return ctx.reply(t('commands.remove.missingName'), {
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
};
