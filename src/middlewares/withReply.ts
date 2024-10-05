import { MiddlewareFn } from 'grammy';
import { MyContext } from '../bot';
import { get } from '../cache';
import {
  addRecordFromMessage,
  removeRecordFromMessage,
  sendFeedback,
} from '../commands';

/**
  Middleware that handles replies.
  This is to handle responses to messages sent with force_reply. Currently experimental!
**/
export const withReply: MiddlewareFn<MyContext> = async (ctx, next) => {
  if (ctx.message?.reply_to_message) {
    const type = await get(`msg:${ctx.message.reply_to_message.message_id}`);

    switch (type) {
      case 'FEEDBACK': {
        sendFeedback(ctx);
        return;
      }
      case 'ADD': {
        addRecordFromMessage(ctx);
        return;
      }
      case 'REMOVE': {
        removeRecordFromMessage(ctx);
        return;
      }
    }
  }

  await next();
};
