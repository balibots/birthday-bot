export * from './birthdays';
export * from './list';
export * from './next';
export * from './add';
export * from './remove';
export * from './help';
export * from './magic';
export * from './all';
export * from './start';
export * from './config';

export const allCommands = [
  {
    command: 'birthdays',
    description:
      'Show the list of all the birthdays sorted by the nearest date.',
  },
  {
    command: 'ages',
    description: "Show everyone's ages (use with caution!).",
  },
  {
    command: 'next',
    description: 'Show who the next upcoming birthday person will be.',
  },
  {
    command: 'add',
    description: 'Add a new birthday.',
  },
  {
    command: 'remove',
    description: 'Remove an existing birthday.',
  },
  {
    command: 'config',
    description: "Check (or change) the bot's configuration.",
  },
  {
    command: 'birthdaybot',
    description:
      'A futuristic conversational interface - tell the bot what to do in natural language.',
  },
  {
    command: 'help',
    description: 'Show all the commands available and how to use them.',
  },
  {
    command: 'calendar',
    description: 'Shows the BirthdayBot miniapp with all the birthdays!',
  },
];
