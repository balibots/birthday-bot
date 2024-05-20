import { CommandContext } from 'grammy';
import { MyContext } from '../bot';
import { isGroup, sanitizeName } from '../utils';
import { t } from 'i18next';
import { getConfigForGroup, setConfigForGroup } from '../config';
import { ChatCompletion } from 'openai/resources';
import type { ChatConfig } from '../config';

// disalowing resetting the masterId
const ALLOWED_CONFIG: Partial<Record<keyof ChatConfig, keyof ChatConfig>> = {
  restrictedToAdmins: 'restrictedToAdmins',
  notificationHour: 'notificationHour',
};

export const configCommand = async (ctx: CommandContext<MyContext>) => {
  // restrict to admins
  const chatMember = await ctx.api.getChatMember(ctx.chatId, ctx.from!.id);
  if (!['administrator', 'creator'].includes(chatMember.status)) {
    return ctx.reply(t('errors.notAdmin'));
  }

  const payload = ctx.match.split(',').map((s) => s.trim()) || [];
  const command = payload[0];
  const arg = payload[1];

  if (!command || parseInt(command) === ctx.chatId) {
    // getting the config
    try {
      const groupConfig = await getConfigForGroup(ctx.chatId);
      return ctx.reply(JSON.stringify(groupConfig));
    } catch (error) {
      return ctx.reply(
        t('commands.config.error', { error: (error as Error).message })
      );
    }
  }

  console.log(ALLOWED_CONFIG, command, ctx.match);

  if (!Object.keys(ALLOWED_CONFIG).includes(command)) {
    return ctx.reply(t('commands.config.notfound'));
  }

  if (command === ALLOWED_CONFIG.restrictedToAdmins) {
    let boolArg = Boolean(arg === 'false' ? false : arg);
    await setConfigForGroup(ctx.chatId, { restrictedToAdmins: boolArg });
    return ctx.reply(t('commands.config.saved'));
  } else if (command === ALLOWED_CONFIG.notificationHour) {
    let numArg = parseInt(arg);

    if (isNaN(numArg) || numArg < 0 || numArg > 23) {
      return ctx.reply(
        t('commands.config.errorParsingHour', {
          error: 'Could not parse the provided hour',
        })
      );
    }

    await setConfigForGroup(ctx.chatId, { notificationHour: numArg });
    return ctx.reply(t('commands.config.saved'));
  }
};
