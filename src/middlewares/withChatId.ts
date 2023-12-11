import { MiddlewareFn } from 'grammy';
import { MyContext } from '../bot';
import { isGroup } from '../utils';
import { t } from 'i18next';

export const withChatId: MiddlewareFn<MyContext> = async (ctx, next) => {
  let chatId: number;

  if (isGroup(ctx.chat)) {
    chatId = ctx.chat.id;
  } else {
    // on a private 1:1, need to supply chatId on the message
    chatId = parseInt(typeof ctx.match === 'string' ? ctx.match : '');

    if (!ctx.match) {
      return await ctx.reply(t('errors.missingChatId'));
    }
    if (isNaN(chatId)) {
      return await ctx.reply(t('errors.invalidChatId', { chatId: ctx.match }));
    }
  }

  ctx.chatId = chatId;

  await next();
};
