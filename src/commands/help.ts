import { MyContext } from '../bot';
import { t } from 'i18next';
import { isGroup } from '../utils';

export const helpCommand = async (ctx: MyContext) => {
  const key = isGroup(ctx.chat) ? 'helpMessage' : 'helpMessageOnDm';
  return ctx.reply(t(key), { parse_mode: 'Markdown' });
};
