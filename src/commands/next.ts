import { MyContext } from '../bot';
import { getRecord, getRecordsByChatId } from '../postgres';
import { nextBirthday } from '../interface';
import { sortClosestDate } from '../utils';
import { t } from 'i18next';

export const nextCommand = async (ctx: MyContext) => {
  const birthdays = await getRecordsByChatId(ctx.chatId);
  const next = birthdays.sort(sortClosestDate)[0];

  if (!next) {
    return await ctx.reply(t('errors.empty'));
  }

  // TODO is this needed??? we should already have the record
  const nextRecord = await getRecord(next);

  if (!nextRecord) {
    return await ctx.reply(t('errors.internalServerNoMessage'));
  }

  return ctx.reply(nextBirthday(nextRecord), { parse_mode: 'Markdown' });
};
