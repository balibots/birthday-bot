import { MyContext } from '../bot';
import { DateTime } from 'luxon';
import { sanitizeName, isGroup, parseDate } from '../utils';
import { getGender } from '../genderize';
import { addRecord, removeRecord, getRecord } from '../postgres';
import { t } from 'i18next';
import { FunctionCallResult, getFunctionCall } from '../openai';
import { nextCommand } from './next';
import { birthdaysCommand } from './birthdays';
import { listCommand } from './list';
import { setConfigForGroup } from '../config';

export const magicCommand = async (ctx: MyContext) => {
  if (!ctx.parsedChatId) {
    return ctx.reply(t('errors.invalidChatId', { chatId: ctx.parsedChatId }));
  }

  if (!ctx.match) {
    console.warn('Empty message? Got', ctx.match);
    return await ctx.reply(t('inputNeeded'));
  }

  const functionCalls = await getFunctionCall(ctx.match.toString());

  console.log('Magic response', functionCalls);

  if (!functionCalls.length) {
    return await ctx.reply(t('errors.notUnderstood'));
  }

  let i = 0;
  for (let functionCall of functionCalls) {
    i++;
    await processFunctionCall(functionCall, ctx, ctx.parsedChatId);

    if (i >= 4) return; // protects against spam by only running up to 4 instructions
  }
};

async function processFunctionCall(
  functionCall: FunctionCallResult,
  ctx: MyContext,
  intChatId: number
) {
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
  } else if (functionCall.function === 'modify_birthday') {
    // Removing an existing birthday
    const { name, day, month, year } = functionCall.args;

    if (!name) {
      return await ctx.reply(t('errors.validation.nameMissing'));
    }

    try {
      const record = {
        name: sanitizeName(name),
        chatId: intChatId,
      };

      let recordToChange = await getRecord(record);

      if (!recordToChange) {
        return await ctx.reply(t('commands.modify.errorNotFound'));
      }

      console.log(
        `Modifying record: ${JSON.stringify(
          record,
          null,
          2
        )} with args year: ${year} month: ${month} day: ${day}`
      );

      const newDate = parseDate(
        `${year || recordToChange.year}-${month || recordToChange.month}-${
          day || recordToChange.day
        }`
      );

      if (!newDate.isValid) {
        return await ctx.reply(t('commands.modify.errorInvalidDate'));
      }

      const newRecord = {
        ...recordToChange,
        date: newDate.toFormat('yyyy-MM-dd'),
        day: newDate.day,
        month: newDate.month,
        year: newDate.year,
      };

      const removedRecord = await removeRecord(record);
      await addRecord(newRecord);

      return ctx.reply(
        t('commands.modify.success', {
          name: newRecord.name,
          date: newRecord.date,
        })
      );
    } catch (error) {
      return ctx.reply(t('commands.modify.errorNotFound', { error }));
    }
  } else if (functionCall.function === 'get_upcoming_birthday') {
    ctx.parsedChatId = intChatId;
    return await nextCommand(ctx);
  } else if (functionCall.function === 'show_all_birthdays_by_date') {
    ctx.parsedChatId = intChatId;
    return await birthdaysCommand(ctx);
  } else if (functionCall.function === 'show_ages') {
    ctx.parsedChatId = intChatId;
    return await listCommand(ctx);
  } else if (functionCall.function === 'set_language') {
    const { language } = functionCall.args;
    try {
      await setConfigForGroup(intChatId, { language });
      return ctx.reply(t('commands.config.saved'));
    } catch {
      return ctx.reply(t('commands.config.languageError', { language }), {
        parse_mode: 'Markdown',
      });
    }
  } else if (functionCall.function === 'set_notification_hour') {
    const { hour } = functionCall.args;
    try {
      await setConfigForGroup(intChatId, { notificationHour: hour });
      return ctx.reply(t('commands.config.saved'));
    } catch (e) {
      console.error(e);
      return ctx.reply(t('commands.config.errorParsingHour'));
    }
  } else {
    await ctx.reply(t('errors.notUnderstood'));
  }
}
