import { MyContext } from '../bot';
import { t } from 'i18next';

const FEEDBACK_GROUP_ID = process.env.IS_DEV ? '-5098456086' : '-2209806645';

export const feedbackCommand = async (ctx: MyContext) => {
  const text = ctx.match;

  const msg = `⚠️ *FEEDBACK*: ${text}

  From: ${ctx.message?.from.first_name} ${ctx.message?.from.last_name} (${
    ctx.message?.from.username || ctx.message?.from.id
  })
  On: ${ctx.message?.chat.title || ctx.message?.chat.type} (${
    ctx.message?.chat.id
  })`;
  return ctx.api.sendMessage(FEEDBACK_GROUP_ID, msg, {
    parse_mode: 'Markdown',
  });
};
