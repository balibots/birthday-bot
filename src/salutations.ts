import { t } from 'i18next';
import { BirthdayListEntry } from './types';
import { getAge, getPronoun } from './utils';

// Picks a random message from the messages array and replaces the placeholders with the actual
// values. Uses generic (no-age) messages when birth year is unknown.
export default function generateSalutation(record: BirthdayListEntry) {
  const hasYear = record.year != null;
  const messageKey = hasYear ? 'messages' : 'messagesNoAge';
  const messages: string[] = t(messageKey, { returnObjects: true });
  const rndIndex = Math.floor(Math.random() * messages.length);

  const replacements = {
    name: record.name,
    age: hasYear ? getAge(record.date) : undefined,
    pronoun: getPronoun(record.gender),
    pronounUp: getPronoun(record.gender).toUpperCase(),
  };

  return t(`${messageKey}.${rndIndex}`, replacements);
}
