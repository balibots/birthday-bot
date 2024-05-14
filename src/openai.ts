import OpenAI from 'openai';
import { ChatCompletionMessageToolCall } from 'openai/resources';

const openai = new OpenAI();

type FunctionCallResult = null | {
  function: string;
  args: any;
};

export async function getFunctionCall(
  message: string
): Promise<ChatCompletionMessageToolCall[]> {
  const chatCompletion = await openai.chat.completions.create({
    //model: 'gpt-3.5-turbo',
    model: 'gpt-4',
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
          name: 'list_upcoming_birthdays',
          description:
            'Gets all birthdays, sorted by date, the next one first.',
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
    ],
  });

  console.log(JSON.stringify(chatCompletion, null, 2));

  try {
    if (
      chatCompletion.choices[0]?.message?.tool_calls &&
      chatCompletion.choices[0]?.message?.tool_calls.length
    ) {
      return chatCompletion.choices[0]?.message?.tool_calls;
    }
  } catch (e) {
    console.error(e);
  }

  return [];
}
