import i18next from 'i18next';
import { Context, NextFunction } from 'grammy';
import { isGroup } from '../utils';
import { getConfigForGroup } from '../config';
import { MyContext } from '../bot';
import { DEFAULT_LANGUAGE } from '../i18n';

export default async function setLanguage(
  ctx: MyContext,
  next: NextFunction
): Promise<void> {
  const chatId = ctx.chat?.id;

  if (!chatId) {
    ctx.config = { language: DEFAULT_LANGUAGE };
  } else {
    const config = await getConfigForGroup(chatId);
    if (config && config.language) {
      console.log('Config setting language to', config.language);
      await i18next.changeLanguage(config.language);
      ctx.config = { language: config.language };
    } else {
      // no language set, will set to default langauge (english at this point)
      await i18next.changeLanguage(DEFAULT_LANGUAGE);
      ctx.config = { language: DEFAULT_LANGUAGE };
    }
  }

  await next();
}
