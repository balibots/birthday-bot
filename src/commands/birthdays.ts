import { MyContext } from '../bot';
import { getRecordsByChatId } from '../postgres';
import { birthdayLine } from '../interface';
import { sortClosestDate } from '../utils';
import { t } from 'i18next';

export const birthdaysCommand = async (ctx: MyContext) => {
  if (!ctx.parsedChatId) {
    return ctx.reply(t('errors.invalidChatId', { chatId: ctx.parsedChatId }));
  }

  const birthdays = (await getRecordsByChatId(ctx.parsedChatId)).sort(
    sortClosestDate
  );

  if (birthdays.length === 0) {
    try {
      await ctx.reply(t('errors.empty'));
    } catch (e) {
      console.error(e);
    }
  } else {
    try {
      await ctx.reply(
        birthdays.map((b) => birthdayLine(b, ctx.config.language)).join('\n'),
        {
          parse_mode: 'MarkdownV2',
        }
      );
    } catch (e) {
      console.error(e);
    }
  }
};
