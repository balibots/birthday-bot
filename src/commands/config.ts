import { CommandContext } from 'grammy';
import { MyContext } from '../bot';
import { isGroup, sanitizeName } from '../utils';
import i18next, { t } from 'i18next';
import { getConfigForGroup, setConfigForGroup } from '../config';
import { ChatCompletion } from 'openai/resources';
import type { ChatConfig } from '../config';
import { DEFAULT_MAX_VERSION } from 'tls';
import { DEFAULT_LANGUAGE } from '../i18n';

// disalowing resetting the masterId
const ALLOWED_CONFIG: Partial<Record<keyof ChatConfig, keyof ChatConfig>> = {
  restrictedToAdmins: 'restrictedToAdmins',
  notificationHour: 'notificationHour',
  language: 'language',
};

export const configCommand = async (ctx: CommandContext<MyContext>) => {
  const payload = ctx.match.split(',').map((s) => s.trim()) || [];
  const command = payload[0];
  const arg = payload[1];

  if (!isGroup(ctx.chat)) {
    return await ctx.reply(t('errors.needGroup'));
  }

  const chatId = ctx.parsedChatId;

  if (!command || parseInt(command) === chatId) {
    // getting the config
    try {
      const groupConfig = await getConfigForGroup(chatId);
      if (groupConfig) {
        return ctx.reply(
          t('configMessage', {
            restrictedToAdmins: groupConfig.restrictedToAdmins || false,
            notificationHour: groupConfig.notificationHour || 8,
            language: groupConfig.language || DEFAULT_LANGUAGE,
          }),
          {
            parse_mode: 'MarkdownV2',
          }
        );
      } else {
        return ctx.reply(t('commands.config.error'));
      }
    } catch (error) {
      return ctx.reply(
        t('commands.config.error', { error: (error as Error).message })
      );
    }
  } else {
    // setting the config

    // setting config is restricted to admins
    const chatMember = await ctx.api.getChatMember(chatId, ctx.from!.id);
    if (!['administrator', 'creator'].includes(chatMember.status)) {
      return ctx.reply(t('errors.notAdmin'));
    }

    // whitelist config keys
    if (!Object.keys(ALLOWED_CONFIG).includes(command)) {
      return ctx.reply(t('commands.config.notfound'));
    }

    // TODO could be a switch statement, could refactor this a bit
    if (command === ALLOWED_CONFIG.restrictedToAdmins) {
      let boolArg = Boolean(arg === 'false' ? false : arg);
      await setConfigForGroup(chatId, { restrictedToAdmins: boolArg });
      return ctx.reply(t('commands.config.saved'));
    } else if (command === ALLOWED_CONFIG.notificationHour) {
      let numArg = parseInt(arg);

      try {
        await setConfigForGroup(chatId, { notificationHour: numArg });
        return ctx.reply(t('commands.config.saved'));
      } catch (e) {
        console.error(e);
        return ctx.reply(
          t('commands.config.errorParsingHour', {
            error: 'Could not parse the provided hour',
          })
        );
      }
    } else if (command === ALLOWED_CONFIG.language) {
      // TODO maybe check against array of allowed languages in the future
      try {
        await setConfigForGroup(chatId, { language: arg });
        await i18next.changeLanguage(arg);
        return ctx.reply(t('commands.config.saved'));
      } catch {
        return ctx.reply(
          t('commands.config.languageError', { language: arg }),
          {
            parse_mode: 'Markdown',
          }
        );
      }
    }
  }
};
