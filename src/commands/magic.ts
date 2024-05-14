import { MyContext } from '../bot';
import { DateTime } from 'luxon';
import { sanitizeName, isGroup } from '../utils';
import { getGender } from '../genderize';
import { addRecord, removeRecord } from '../dynamodb';
import { t } from 'i18next';
import { getFunctionCall } from '../openai';
import { nextCommand } from './next';
import { birthdaysCommand } from './birthdays';
import { listCommand } from './list';

export const magicCommand = async (ctx: MyContext) => {
  // if we're sending commands from a group, will get the id from the message
  if (!isGroup(ctx.chat)) {
    return await ctx.reply(t('errors.needGroup'));
  }

  const intChatId = ctx.chat?.id;

  if (!intChatId || isNaN(intChatId)) {
    return await ctx.reply(`Invalid Chat ID, got ${intChatId}`);
  }

  if (!ctx.match) {
    console.warn('Empty message? Got', ctx.match);
    return await ctx.reply(t('inputNeeded'));
  }

  const functionCalls = await getFunctionCall(ctx.match.toString());

  console.log('Magic response', functionCalls);

  if (!functionCalls?.length) {
    return await ctx.reply(t('errors.notUnderstood'));
  }

  for (let functionCall of functionCalls) {
    const fn = functionCall.function.name;
    const fnArgs = JSON.parse(functionCall.function.arguments || '{}');

    if (fn === 'add_birthday') {
      // Adding a new birthday
      const { day, month, year, name } = fnArgs;

      if (!day || !month) {
        await ctx.reply(t('errors.validation.dateMissing'));
        continue;
      }

      if (!year) {
        await ctx.reply(t('errors.validation.yearMissing'));
        continue;
      }

      if (!name) {
        await ctx.reply(t('errors.validation.nameMissing'));
        continue;
      }

      console.log('Adding', year, month, day, name);
      const parsedDate = DateTime.fromISO(`${year}-${month}-${day}`);

      if (!parsedDate.isValid) {
        await ctx.reply(t('errors.validation.dateInvalid'));
        continue;
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

      await ctx.reply(t('commands.add.success', record));
    } else if (fn === 'remove_birthday') {
      // Removing an existing birthday
      const { name } = fnArgs;

      if (!name) {
        await ctx.reply(t('errors.validation.nameMissing'));
        continue;
      }

      try {
        const record = {
          name: sanitizeName(name),
          chatId: intChatId,
        };

        console.log(`Removing record: ${JSON.stringify(record, null, 2)}`);

        const removedRecord = await removeRecord(record);

        await ctx.reply(
          t('commands.remove.success', {
            name: removedRecord.name,
            date: removedRecord.date,
          })
        );
      } catch (error) {
        return ctx.reply(t('commands.remove.notFound', { error }));
      }
    } else if (fn === 'get_upcoming_birthday') {
      ctx.chatId = intChatId;
      await nextCommand(ctx);
    } else if (fn === 'list_upcoming_birthdays') {
      ctx.chatId = intChatId;
      await birthdaysCommand(ctx);
    } else if (fn === 'show_ages') {
      ctx.chatId = intChatId;
      await listCommand(ctx);
    } else {
      await ctx.reply(t('errors.notUnderstood'));
    }
  }
};
