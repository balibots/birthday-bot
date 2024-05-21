import OpenAI from 'openai';

const openai = new OpenAI();

type FunctionCallResult = null | {
  function: string;
  args: any;
};

export async function getFunctionCall(
  message: string
): Promise<FunctionCallResult> {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: message }],
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
          description:
            'Returns the ages and birthdays of everyone on the list.',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'set_config',
          description: 'Changes the group configuration.',
          parameters: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                description: 'The configuration key to set.',
              },
              value: {
                type: 'string',
                description: 'The new value for the key provided.',
              },
            },
          },
        },
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  try {
    if (
      chatCompletion.choices[0]?.message?.tool_calls &&
      chatCompletion.choices[0]?.message?.tool_calls.length
    ) {
      const call = chatCompletion.choices[0]?.message?.tool_calls[0];
      return {
        function: call.function.name,
        args: JSON.parse(call.function.arguments || '{}'),
      };
    }
  } catch (e) {
    console.error(e);
  }

  return null;
}
