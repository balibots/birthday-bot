import { MyContext } from '../bot';
import { DateTime } from 'luxon';
import { sanitizeName, isGroup } from '../utils';
import { getGender } from '../genderize';
import { addRecord, removeRecord } from '../postgres';
import { t } from 'i18next';
import { getFunctionCall } from '../openai';
import { nextCommand } from './next';
import { birthdaysCommand } from './birthdays';
import { listCommand } from './list';
import { setConfigForGroup } from '../config';

export const magicCommand = async (ctx: MyContext) => {
  // if we're sending commands from a group, will get the id from the message
  if (!isGroup(ctx.chat)) {
    return await ctx.reply(t('errors.needGroup'));
  }

  const intChatId = ctx.chat?.id;

  if (!intChatId || isNaN(intChatId)) {
    return ctx.reply(t('errors.invalidChatId', { chatId: intChatId }));
  }

  if (!ctx.match) {
    console.warn('Empty message? Got', ctx.match);
    return await ctx.reply(t('inputNeeded'));
  }

  const functionCall = await getFunctionCall(ctx.match.toString());

  console.log('Magic response', functionCall);

  if (functionCall) {
    if (functionCall.function === 'add_birthday') {
      // Adding a new birthday
      const { day, month, year, name } = functionCall.args;

      if (!day || !month) {
        return await ctx.reply(t('errors.validation.dateMissing'));
      }

      if (!year) {
        return await ctx.reply(t('errors.validation.yearMissing'));
      }

      if (!name) {
        return await ctx.reply(t('errors.validation.nameMissing'));
      }

      console.log('Adding', year, month, day, name);
      const parsedDate = DateTime.fromISO(`${year}-${month}-${day}`);

      if (!parsedDate.isValid) {
        return await ctx.reply(t('errors.validation.dateInvalid'));
      }

      const sanitized = sanitizeName(name);
      const gender = await getGender(sanitized);

      const params = {
        name: sanitized,
        date: parsedDate.toFormat('yyyy-MM-dd'),
        month: parsedDate.month,
        day: parsedDate.day,
        gender,
        chatId: intChatId,
      };

      const record = await addRecord(params);

      return await ctx.reply(t('commands.add.success', record));
    } else if (functionCall.function === 'remove_birthday') {
      // Removing an existing birthday
      const { name } = functionCall.args;

      if (!name) {
        return await ctx.reply(t('errors.validation.nameMissing'));
      }

      try {
        const record = {
          name: sanitizeName(name),
          chatId: intChatId,
        };

        console.log(`Removing record: ${JSON.stringify(record, null, 2)}`);

        const removedRecord = await removeRecord(record);

        return ctx.reply(
          t('commands.remove.success', {
            name: removedRecord.name,
            date: removedRecord.date,
          })
        );
      } catch (error) {
        return ctx.reply(t('commands.remove.notFound', { error }));
      }
    } else if (functionCall.function === 'get_upcoming_birthday') {
      ctx.chatId = intChatId;
      return await nextCommand(ctx);
    } else if (functionCall.function === 'show_all_birthdays_by_date') {
      ctx.chatId = intChatId;
      return await birthdaysCommand(ctx);
    } else if (functionCall.function === 'show_ages') {
      ctx.chatId = intChatId;
      return await listCommand(ctx);
    } else if (functionCall.function === 'set_config') {
      const { key, value } = functionCall.args;
      await setConfigForGroup(intChatId, { [key]: value });
      return ctx.reply(t('commands.config.saved'));
    } else {
      await ctx.reply(t('errors.notUnderstood'));
    }
  } else {
    await ctx.reply(t('errors.notUnderstood'));
  }
};
