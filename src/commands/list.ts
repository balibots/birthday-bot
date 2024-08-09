import { MyContext } from '../bot';
import { getRecordsByChatId } from '../postgres';
import { ageLine } from '../interface';
import { sortAbsoluteDate } from '../utils';
import { t } from 'i18next';

export const listCommand = async (ctx: MyContext) => {
  const birthdays = (await getRecordsByChatId(ctx.parsedChatId)).sort(
    sortAbsoluteDate
  );

  if (birthdays.length === 0) {
    await ctx.reply(t('errors.empty'));
  } else {
    try {
      await ctx.reply(
        birthdays.map((b) => ageLine(b, ctx.config.language)).join('\n'),
        {
          parse_mode: 'MarkdownV2',
        }
      );
    } catch (e) {
      console.error(e);
    }
  }
};
