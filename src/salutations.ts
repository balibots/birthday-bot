import i18next from 'i18next';
import { BirthdayListEntry } from './types';
import { getAge } from './interface';
import { getPronoun } from './utils';

i18next.init({
  lng: 'pt',
  debug: false,
  resources: {
    pt: {
      translation: {
        messages: [
          '🎂 O bebé de hoje é {{pronoun}} *{{name}}* que faz {{age}} anos! 🥳🎉 Parabéns {{name}} ❤️',
          '🎂 Hoje é o dia d{{pronoun}} *{{name}}* que celebra {{age}} anos! 🥳🎉 Muitos parabéns {{name}} ❤️',
          '🎂 Que dia épico! {{pronounUp}} *{{name}}* faz hoje {{age}} anos! 🥳🎉 Parabéns {{name}} ❤️',
          '🎂 {{pronounUp}} noss{{pronoun}} *{{name}}* faz hoje {{age}} anos! 🥳🎉 Parabéns {{name}} ❤️',
        ],
      },
    },
  },
});

// Picks a random message from the messages array and replaces the placeholders with the actual
// values.
export default function generateSalutation(record: BirthdayListEntry) {
  const messages: string[] = i18next.t('messages', { returnObjects: true });
  const rndIndex = Math.floor(Math.random() * messages.length);

  const replacements = {
    name: record.name,
    age: getAge(record.date),
    pronoun: getPronoun(record.gender),
    pronounUp: getPronoun(record.gender).toUpperCase(),
  };

  return i18next.t(`messages.${rndIndex}`, replacements);
}
