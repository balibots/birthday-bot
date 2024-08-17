import { CommandContext } from 'grammy';
import { MyContext } from '../bot';
import { getConfigForGroup } from '../config';
import { addRecord } from '../postgres';
import { getGender } from '../genderize';
import { isGroup, parseDate, sanitizeName } from '../utils';
import { t } from 'i18next';

export const addCommand = async (ctx: CommandContext<MyContext>) => {
  let [name, date] = ctx.match?.split(',').map((s) => s.trim()) || [];

  let intChatId = ctx.parsedChatId;

  if (!name || !date) {
    return ctx.reply(t('commands.add.missingData'), {
      parse_mode: 'Markdown',
    });
  }

  // limits add commands to group admins
  if (isGroup(ctx.chat)) {
    try {
      const groupConfig = await getConfigForGroup(intChatId);

      if (groupConfig && groupConfig.restrictedToAdmins) {
        const chatMember = await ctx.api.getChatMember(intChatId, ctx.from!.id);
        if (!['administrator', 'creator'].includes(chatMember.status)) {
          return ctx.reply(t('commands.add.restrictedToAdmins'));
        }
      }
    } catch (e) {
      return ctx.reply(
        t('errors.internalError', { message: (e as Error).message })
      );
    }
  }

  const parsedDate = parseDate(date);

  if (!parsedDate.isValid) {
    return ctx.reply(t('commands.add.errorParsingDate'), {
      parse_mode: 'Markdown',
    });
  }

  const sanitized = sanitizeName(name);
  const gender = await getGender(sanitized);

  let params = {
    name: sanitized,
    date: parsedDate.toFormat('yyyy-MM-dd'),
    month: parsedDate.month,
    day: parsedDate.day,
    gender,
    chatId: intChatId,
    chatName: !isGroup(ctx.chat) ? 'BirthdayBot DMs' : undefined,
  };

  try {
    const record = await addRecord(params);

    return ctx.reply(
      t('commands.add.success', {
        name: record.name,
        date: record.date,
      })
    );
  } catch (e) {
    console.error(e);
    return ctx.reply(t('commands.add.alreadyExists'));
  }
};
