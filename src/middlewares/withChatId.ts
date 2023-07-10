import { MiddlewareFn } from 'grammy';
import { MyContext } from '../bot';
import { isGroup } from '../utils';

export const withChatId: MiddlewareFn<MyContext> = async (ctx, next) => {
  let chatId: number;

  if (isGroup(ctx.chat)) {
    chatId = ctx.chat.id;
  } else {
    // on a private 1:1, need to supply chatId on the message
    chatId = parseInt(typeof ctx.match === 'string' ? ctx.match : '');

    if (!ctx.match) {
      return ctx.reply(`Need a Chat ID on a private chat.`);
    }
    if (isNaN(chatId)) {
      return ctx.reply(`Invalid Chat ID provided, got '${ctx.match}'.`);
    }
  }

  ctx.chatId = chatId;

  await next();
};
