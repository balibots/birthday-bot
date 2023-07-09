import { t } from 'i18next';
import { BirthdayListEntry } from './types';
import { getAge, getPronoun } from './utils';

// Picks a random message from the messages array and replaces the placeholders with the actual
// values.
export default function generateSalutation(record: BirthdayListEntry) {
  const messages: string[] = t('messages', { returnObjects: true });
  const rndIndex = Math.floor(Math.random() * messages.length);

  const replacements = {
    name: record.name,
    age: getAge(record.date),
    pronoun: getPronoun(record.gender),
    pronounUp: getPronoun(record.gender).toUpperCase(),
  };

  return t(`messages.${rndIndex}`, replacements);
}
