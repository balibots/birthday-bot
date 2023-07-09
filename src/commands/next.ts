import { MyContext } from '../bot';
import { getRecord, getRecordsByChatId } from '../dynamodb';
import { nextBirthday } from '../interface';
import { sortClosestDate } from '../utils';

export const nextCommand = async (ctx: MyContext) => {
  const birthdays = await getRecordsByChatId(ctx.chatId);
  const next = birthdays.sort(sortClosestDate)[0];

  if (!next) {
    return ctx.reply('No birthdays yet');
  }

  const nextRecord = await getRecord(next);

  if (!nextRecord) {
    return ctx.reply('Error getting data');
  }

  return ctx.reply(nextBirthday(nextRecord), { parse_mode: 'Markdown' });
};
