import { MiddlewareFn } from 'grammy';
import { MyContext } from '../bot';
import { isGroup } from '../utils';

export const withChatId: MiddlewareFn<MyContext> = async (ctx, next) => {
  let chatId: number;

  if (isGroup(ctx.chat)) {
    chatId = ctx.chat.id;
  } else {
    // on a private 1:1, need to supply chatId on the message
    const payload = typeof ctx.match === 'string' ? ctx.match : null;

    if (!payload) {
      return ctx.reply(`Need a Chat ID on a private chat.`);
    }

    // gets the last comma seperated token.
    // some commands take multiple tokens with a chatId at the end, some others
    // take no payload, only the chatId (on a private bot chat)
    const tokens = payload.split(',').map((s) => s.trim()) || [];
    chatId = parseInt(tokens.pop() || ''); // empty string and undefined will make parseInt return NaN

    if (isNaN(chatId)) {
      return ctx.reply(`Invalid Chat ID provided, got '${ctx.match}'.`);
    }
  }

  ctx.chatId = chatId;

  await next();
};
