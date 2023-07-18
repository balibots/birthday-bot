import { MyContext } from '../bot';
import { t } from 'i18next';

export const helpCommand = async (ctx: MyContext) => {
  return ctx.reply(t('helpMessage'), { parse_mode: 'Markdown' });
};
