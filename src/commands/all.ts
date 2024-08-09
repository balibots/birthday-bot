import { CommandContext } from 'grammy';
import { isGroup } from '../utils';
import { t } from 'i18next';
import { getRecordsByChatId } from '../postgres';
import { birthdayLine } from '../interface';
import { sortClosestDate } from '../utils';
import { MyContext } from '../bot';
import { getGroupChats } from '../postgres';

export const allBirthdaysCommand = async (ctx: CommandContext<MyContext>) => {
  if (isGroup(ctx.chat)) {
    return await ctx.reply(t('errors.needPvt'));
  }

  const groups = await getGroupChats();
  let response = [];

  for (let group of groups) {
    try {
      const userInfo = await ctx.api.getChatMember(group.id, ctx.from!.id);
    } catch (e) {
      // this continue is very important otherwise this executes anyway!
      continue;
    }

    const birthdays = (await getRecordsByChatId(group.id)).sort(
      sortClosestDate
    );

    response.push(`
*Group*: ${group.name}

${birthdays.map((b) => birthdayLine(b, ctx.config.language)).join('\n')}

`);
  }

  return await ctx.reply(response.join('\n'), { parse_mode: 'Markdown' });
};
