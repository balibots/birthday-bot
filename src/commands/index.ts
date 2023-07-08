export * from './birthdays';
export * from './list';
export * from './next';
export * from './add';
export * from './remove';

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
    description:
      'Adiciona novo aniversariante. Limitado a Admins do grupo para evitar abusos de confiança.',
  },
  {
    command: 'remove',
    description:
      'Remove um aniversariante. Limitado a Admins do grupo para evitar abusos de confiança.',
  },
];
