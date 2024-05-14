import { MyContext } from '../bot';
import { getRecordsByChatId } from '../dynamodb';
import { ageLine } from '../interface';
import { sortAbsoluteDate } from '../utils';
import { t } from 'i18next';

export const listCommand = async (ctx: MyContext) => {
  const birthdays = (await getRecordsByChatId(ctx.chatId)).sort(
    sortAbsoluteDate
  );

  if (birthdays.length === 0) {
    await ctx.reply(t('errors.empty'));
  } else {
    try {
      await ctx.reply(birthdays.map(ageLine).join('\n'), {
        parse_mode: 'MarkdownV2',
      });
    } catch (e) {
      console.error(e);
    }
  }
};
