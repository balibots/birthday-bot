import { MyContext } from '../bot';
import { getRecordsByChatId } from '../postgres';
import { birthdayLine } from '../interface';
import { sortClosestDate } from '../utils';
import { t } from 'i18next';

export const birthdaysCommand = async (ctx: MyContext) => {
  const birthdays = (await getRecordsByChatId(ctx.chatId)).sort(
    sortClosestDate
  );

  if (birthdays.length === 0) {
    await ctx.reply(t('errors.empty'));
  } else {
    try {
      await ctx.reply(birthdays.map(birthdayLine).join('\n'), {
        parse_mode: 'Markdown',
      });
    } catch (e) {
      console.error(e);
    }
  }
};
