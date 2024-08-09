import { CommandContext } from 'grammy';
import { MyContext } from '../bot';
import { removeRecord } from '../postgres';
import { isGroup, sanitizeName } from '../utils';
import { t } from 'i18next';
import { getConfigForGroup } from '../config';

export const removeCommand = async (ctx: CommandContext<MyContext>) => {
  let [name] = ctx.match?.split(',').map((parts) => parts.trim()) || [];

  let intChatId = ctx.chatId;

  if (!name) {
    return ctx.reply(t('commands.remove.missingName'), {
      parse_mode: 'Markdown',
    });
  }

  // limits add commands to group admins
  try {
    const groupConfig = await getConfigForGroup(intChatId);

    if (groupConfig && groupConfig.restrictedToAdmins) {
      const chatMember = await ctx.api.getChatMember(intChatId, ctx.from!.id);
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
      chatId: intChatId,
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
