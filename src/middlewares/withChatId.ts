import { MiddlewareFn } from 'grammy';
import { MyContext } from '../bot';
import { isGroup } from '../utils';
import { t } from 'i18next';

/**
  Middleware that extracts the chat id to the context object in one of two ways:
   1. by getting the group chat id, if the message was sent to a group
   2. by getting the last comma seperated token from a private message
**/
export const withChatId: MiddlewareFn<MyContext> = async (ctx, next) => {
  let chatId: number;

  if (isGroup(ctx.chat)) {
    chatId = ctx.chat.id;
  } else {
    // on a private 1:1, need to supply chatId on the message
    const payload = typeof ctx.match === 'string' ? ctx.match : null;

    if (!payload) {
      return await ctx.reply(t('errors.missingChatId'));
    }

    // gets the last comma seperated token.
    // some commands take multiple tokens with a chatId at the end, some others
    // take no payload, only the chatId (on a private bot chat)
    const tokens = payload.split(',').map((s) => s.trim()) || [];
    chatId = parseInt(tokens.pop() || ''); // empty string and undefined will make parseInt return NaN

    if (isNaN(chatId)) {
      return await ctx.reply(t('errors.invalidChatId', { chatId: ctx.match }));
    }
  }

  ctx.chatId = chatId;
  await next();
};
