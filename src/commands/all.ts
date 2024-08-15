import { CommandContext } from 'grammy';
import { isGroup } from '../utils';
import { t } from 'i18next';
import { getRecordsByChatId } from '../postgres';
import { birthdayLine } from '../interface';
import { sortClosestDate } from '../utils';
import { MyContext } from '../bot';
import { getGroupChats } from '../postgres';

const BOT_NAME = process.env.IS_DEV
  ? '@testing_mini_apps_bot'
  : '@BaliBirthdayBot';

export const allBirthdaysCommand = async (ctx: CommandContext<MyContext>) => {
  return await ctx.reply(t('commands.all.intro'), {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: t('commands.all.buttonText'),
            url: `https://t.me/${BOT_NAME}?startapp`,
          },
        ],
      ],
    },
  });
};

/*
     old implementation - did this inline

  if (isGroup(ctx.chat) || !ctx.msg.from?.id) {
    return await ctx.reply(t('errors.needPvt'));
  }

  const groups = await getGroupChats();
  let response = [t('commands.all.intro')];

  for (let group of groups) {
    let userInfo;

    try {
      userInfo = await ctx.api.getChatMember(group.id, ctx.msg.from.id);
      if (['left', 'kicked'].includes(userInfo.status)) {
        throw new Error();
      }
    } catch (e) {
      // this continue is very important otherwise this executes anyway!
      continue;
    }

    const birthdays = (await getRecordsByChatId(group.id)).sort(
      sortClosestDate
    );

    response.push(`
🎂 *${group.name}* (${Math.abs(Number(group.id))})

${birthdays.map((b) => birthdayLine(b, ctx.config.language)).join('\n')}
`);
  }

  // no groups
  if (response.length === 1) {
    response = [t('commands.all.empty')];
  }

 */
