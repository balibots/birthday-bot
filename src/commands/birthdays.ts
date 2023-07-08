import { MyContext } from '../bot';
import { getRecordsByChatId } from '../dynamodb';
import { birthdayLine } from '../interface';
import { sortClosestDate } from '../utils';

export const birthdaysCommand = async (ctx: MyContext) => {
  const birthdays = (await getRecordsByChatId(ctx.chatId)).sort(
    sortClosestDate
  );

  if (birthdays.length === 0) {
    return ctx.reply('No birthdays yet');
  } else {
    return ctx.reply(birthdays.map(birthdayLine).join('\n'), {
      parse_mode: 'Markdown',
    });
  }
};
