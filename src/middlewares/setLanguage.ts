import i18next from 'i18next';
import { Context, NextFunction } from 'grammy';
import { isGroup } from '../utils';
import { getConfigForGroup } from '../config';
import { MyContext } from '../bot';

export default async function setLanguage(
  ctx: MyContext,
  next: NextFunction
): Promise<void> {
  if (isGroup(ctx.chat)) {
    const chatId = ctx.chat.id;
    const config = await getConfigForGroup(chatId);
    if (config && config.language) {
      console.log('Changing my language to', config.language);
      await i18next.changeLanguage(config.language);
    }
    ctx.config = { language: config?.language ?? 'en' };
  }

  await next();
}
