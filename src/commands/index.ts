export * from './birthdays';
export * from './list';
export * from './next';
export * from './add';
export * from './remove';
export * from './help';
export * from './magic';

export const allCommands = [
  {
    command: 'aniversarios',
    description:
      'Mostra a lista completa de aniversários ordenados do mais próximo para o mais distante',
  },
  {
    command: 'idades',
    description:
      'Mostra a lista completa de idades ordenadas por data de nascimento',
  },
  {
    command: 'proximo',
    description: 'Mostra o próximo aniversário',
  },
  {
    command: 'add',
    description: 'Adiciona novo aniversariante.',
  },
  {
    command: 'remove',
    description: 'Remove um aniversariante.',
  },
  {
    command: 'birthdaybot',
    description: 'Interface conversacional futurista.',
  },
];
