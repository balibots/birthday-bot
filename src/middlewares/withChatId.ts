import { MiddlewareFn } from 'grammy';
import { MyContext } from '../bot';
import { isGroup } from '../utils';
import { t } from 'i18next';

const SUPERADMIN_IDS: number[] = [];

/**
  Middleware that extracts the chat id to the context object in one of two ways:
   1. by getting the group chat id, if the message was sent to a group
   2. by getting the last comma seperated token from a private message
**/
export const withChatId: MiddlewareFn<MyContext> = async (ctx, next) => {
  let chatId: number;
  let userId = ctx.from.id;

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
    const last = tokens[tokens.length - 1];
    chatId = parseInt(last || ''); // empty string and undefined will make parseInt return NaN

    // convenience, accepts ids without the leading - (minus) for groups
    if (chatId > 0) chatId *= -1;

    if (isNaN(chatId)) {
      return await ctx.reply(t('errors.invalidChatId', { chatId: last }));
    }

    // validate if user is member of the group
    // TODO: maybe add exception for super admins like ricardo and me. can hardcode our users ids for now
    if (!SUPERADMIN_IDS.includes(userId)) {
      try {
        const chatMember = await ctx.api.getChatMember(chatId, userId);
        console.log(chatMember);
      } catch (e) {
        return await ctx.reply(t('errors.notGroupMember'));
      }
    }
  }

  ctx.chatId = chatId;
  await next();
};
