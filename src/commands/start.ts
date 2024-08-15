import { MyContext } from '../bot';
import { t } from 'i18next';

export const startCommand = async (ctx: MyContext) => {
  return ctx.reply(t('startMessage'), { parse_mode: 'Markdown' });
};
