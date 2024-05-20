import { CommandContext } from 'grammy';
import { MyContext } from '../bot';
import { getConfigForGroup } from '../config';
import { addRecord } from '../postgres';
import { getGender } from '../genderize';
import { isGroup, parseDate, sanitizeName } from '../utils';
import { t } from 'i18next';

export const addCommand = async (ctx: CommandContext<MyContext>) => {
  let [name, date, chatId] = ctx.match?.split(',').map((s) => s.trim()) || [];

  let intChatId = Number(chatId);

  // if we're sending commands from a group, will get the id from the message
  if (isGroup(ctx.chat)) {
    intChatId = ctx.chat.id;
  }

  if (isNaN(intChatId) || !intChatId) {
    return ctx.reply(t('errors.invalidChatId', { chatId: intChatId }));
  }

  if (!name || !date) {
    if (isGroup(ctx.chat)) {
      return ctx.reply(t('commands.add.missingData'), {
        parse_mode: 'MarkdownV2',
      });
    } else {
      return ctx.reply(t('commands.add.missingDataWithGroupId'), {
        parse_mode: 'MarkdownV2',
      });
    }
  }

  // limits add commands to group admins
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

  const parsedDate = parseDate(date);

  if (!parsedDate.isValid) {
    return ctx.reply(t('commands.add.errorParsingDate'), {
      parse_mode: 'MarkdownV2',
    });
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
    t('commands.add.success', {
      name: record.name,
      date: record.date,
    })
  );
};
