import OpenAI from 'openai';

const openai = new OpenAI();

export type FunctionCallResult = {
  function: string;
  args: any;
};

const prompt =
  "You are a Telegram bot that manages a list of birthdays. Based on the user's message, return one of more functions to call from the list of functions supplied.";

export async function getFunctionCall(
  message: string
): Promise<FunctionCallResult[]> {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: message },
    ],
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
      {
        type: 'function',
        function: {
          name: 'modify_birthday',
          description: 'Changes the birthday date for a given person',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description:
                  "The name of the person whose birthday we're removing",
              },
              day: {
                type: 'number',
                description: 'The new day to set for the birthday date.',
              },
              month: {
                type: 'number',
                description: 'The new month to set for the birthday month.',
              },
              year: {
                type: 'number',
                description: 'The new year to set for the birthday date.',
              },
            },
            required: ['name'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_upcoming_birthday',
          description: 'Returns the next birthday.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'show_all_birthdays_by_date',
          description: 'Gets all birthdays, sorted by the nearest one.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'show_ages',
          description: 'Returns the ages of everyone on the group.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'set_language',
          description: "Changes the group's language.",
          parameters: {
            type: 'object',
            properties: {
              language: {
                type: 'string',
                enum: ['en', 'pt', 'ko', 'es'],
                description:
                  'The new language to set. Options are en for English, pt for Portuguese, ko for Korean and es for Spanish.',
              },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'set_notification_hour',
          description:
            'Changes the hour the group is notified for new birthdays',
          parameters: {
            type: 'object',
            properties: {
              hour: {
                type: 'number',
                description:
                  'The new hour the group will be notified in 24h format (0-23)',
              },
            },
          },
        },
      },
    ],
    model: 'gpt-4o',
  });

  try {
    if (
      chatCompletion.choices[0]?.message?.tool_calls &&
      chatCompletion.choices[0]?.message?.tool_calls.length
    ) {
      return chatCompletion.choices[0]?.message?.tool_calls.map((call) => ({
        function: call.function.name,
        args: JSON.parse(call.function.arguments || '{}'),
      }));
    }
  } catch (e) {
    console.error(e);
  }

  return [];
}
