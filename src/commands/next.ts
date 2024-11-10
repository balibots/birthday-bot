import { MyContext } from '../bot';
import { getRecord, getRecordsByChatId } from '../postgres';
import { nextBirthday } from '../interface';
import { sortClosestDate, isBirthdayToday } from '../utils';
import { t } from 'i18next';

export const nextCommand = async (ctx: MyContext) => {
  if (!ctx.parsedChatId) {
    return ctx.reply(t('errors.invalidChatId', { chatId: ctx.parsedChatId }));
  }

  const birthdays = await getRecordsByChatId(ctx.parsedChatId);
  const birthdaysSorted = birthdays.sort(sortClosestDate);

  if (!birthdaysSorted.length) {
    return await ctx.reply(t('errors.empty'));
  }

  /* disabled this behaviour as not 100% sure about it
  let i = 0;
  let next = birthdaysSorted[i];

  while (next && isBirthdayToday(next.date)) {
    // gets the first birthday that is not today
    next = birthdaysSorted[++i];
  }

  if (!next) {
    // manhoso, isto significa que todos fazem anos hoje o que e' um
    // grande edge case.
    next = birthdaysSorted[0];
  }
  */

  let next = birthdaysSorted[0];

  return ctx.reply(nextBirthday(next, ctx.config.language), {
    parse_mode: 'MarkdownV2',
  });
};
