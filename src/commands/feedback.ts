import { MyContext } from '../bot';
import { t } from 'i18next';
import { isGroup } from '../utils';
import { set } from '../cache';

const FEEDBACK_GROUP_ID = process.env.IS_DEV ? '-5098456086' : '-1002209806645';

export const feedbackCommand = async (ctx: MyContext) => {
  const text = ctx.match;

  if (!text) {
    const msg = await ctx.reply(
      'Please let us know your feedback by replying to this message:',
      {
        reply_markup: { force_reply: true, selective: true },
      }
    );

    set(`msg:${msg.message_id}`, 'FEEDBACK');

    return;
  }

  sendFeedback(ctx);
};

export async function sendFeedback(ctx: MyContext) {
  // match for after the command, text for when it's via force reply
  const text = ctx.match || ctx.message?.text;

  const msg = `⚠️ *FEEDBACK*: ${text}

  From: ${ctx.message?.from.first_name} ${ctx.message?.from.last_name} (${
    ctx.message?.from.username || ctx.message?.from.id
  })
  On: ${ctx.message?.chat.title || ctx.message?.chat.type} (${
    ctx.message?.chat.id
  })`;

  try {
    return await ctx.api.sendMessage(FEEDBACK_GROUP_ID, msg, {
      parse_mode: 'Markdown',
    });
  } catch (e) {
    console.error(e);
  }
}
