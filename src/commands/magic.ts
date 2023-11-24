import { MyContext } from '../bot';
import OpenAI from 'openai';
import { DateTime } from 'luxon';
import { sanitizeName } from '../utils';
import { getGender } from '../genderize';
import { addRecord, removeRecord } from '../dynamodb';
import { t } from 'i18next';

const openai = new OpenAI();

export const magicCommand = async (ctx: MyContext) => {
  // if we're sending commands from a group, will get the id from the message
  const intChatId = ctx.chat?.id;

  if (!intChatId || isNaN(intChatId)) {
    return await ctx.reply(`Invalid Chat ID, got ${intChatId}`);
  }

  if (!ctx.match) {
    console.warn('Empty message? Got', ctx.match);
    return await ctx.reply(t('inputNeeded'));
  }

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: ctx.match.toString() }],
    tools: [
      {
        type: 'function',
        function: {
          name: 'add_birthday',
          description: 'Adds a new birthday to the calendar',
          parameters: {
            type: 'object',
            properties: {
              day: {
                type: 'string',
                description:
                  'The day of the month the birthday falls on (01-31)',
              },
              month: {
                type: 'string',
                description: 'The month the birthday falls on (01-12)',
              },
              year: {
                type: 'number',
                description: 'The year they were born',
              },
              name: {
                type: 'string',
                description:
                  "The name of the person whose birthday we're adding",
              },
            },
            required: ['day', 'month', 'year', 'name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'remove_birthday',
          description: 'Removes an existing birthday from the calendar',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description:
                  "The name of the person whose birthday we're removing",
              },
            },
            required: ['name'],
          },
        },
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  if (
    chatCompletion.choices[0]?.message?.tool_calls &&
    chatCompletion.choices[0]?.message?.tool_calls.length
  ) {
    const call = chatCompletion.choices[0]?.message?.tool_calls[0];

    if (call.function.name === 'add_birthday') {
      // Adding a new birthday
      const { day, month, year, name } = JSON.parse(
        call.function.arguments || '{}'
      );

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
    } else if (call.function.name === 'remove_birthday') {
      // Removing an existing birthday
      const { day, month, year, name } = JSON.parse(
        call.function.arguments || '{}'
      );

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
    } else {
      await ctx.reply(t('errors.notUnderstood'));
    }
  } else {
    await ctx.reply(t('errors.notUnderstood'));
  }
};
