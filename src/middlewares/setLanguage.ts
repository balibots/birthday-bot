import i18next from 'i18next';
import { Context, NextFunction } from 'grammy';
import { isGroup } from '../utils';
import { getConfigForGroup } from '../config';

export default async function setLanguage(
  ctx: Context,
  next: NextFunction
): Promise<void> {
  if (isGroup(ctx.chat)) {
    const chatId = ctx.chat.id;
    const config = await getConfigForGroup(chatId);
    if (config && config.language) {
      console.log('Changing my language to', config.language);
      await i18next.changeLanguage(config.language);
    }
  }

  await next();
}
