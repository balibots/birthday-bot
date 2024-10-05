import { MyContext } from '../bot';
import { t } from 'i18next';
import { isGroup } from '../utils';

export const startCommand = async (ctx: MyContext) => {
  const key = isGroup(ctx.chat) ? 'startMessage' : 'startMessageOnDm';
  return ctx.reply(t(key), { parse_mode: 'Markdown' });
};
