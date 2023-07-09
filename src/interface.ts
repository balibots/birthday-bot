import { DateTime, DateTimeFormatOptions } from 'luxon';
import { BirthdayListEntry } from './types';
import { daysToBirthday, getAge } from './utils';

// TODO: dynamically change later
const locale = 'pt';

export function formatDate(
  date: string,
  format?: DateTimeFormatOptions
): string {
  const dateJS = new Date(date);

  const options: DateTimeFormatOptions = format ?? {
    month: 'short',
    day: '2-digit',
  };

  return dateJS.toLocaleDateString(locale, { ...options });
}

export function birthdayLine(record: BirthdayListEntry): string {
  const days = daysToBirthday(record.date);
  return `\`${formatDate(record.date)}\` — ${record.name} — ${
    days ? (days > 1 ? `${days} dias` : `${days} dia`) : 'hoje 🎉'
  }`;
}

export function ageLine(record: BirthdayListEntry): string {
  const age = getAge(record.date);
  const date = formatDate(record.date, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  return `\`${date}\` — ${record.name}, ${Math.floor(age)}`;
}

export function nextBirthday(record: BirthdayListEntry): string {
  const age = getAge(record.date);
  const diff = daysToBirthday(record.date);
  const day = formatDate(record.date, { month: 'long', day: 'numeric' });

  const differenceToBirthday = DateTime.now()
    .startOf('day')
    .setLocale(locale)
    .plus({ days: diff })
    .toRelative();

  const nextAge = Math.floor(age) + (diff === 0 ? 0 : 1);
  const daysToBirthdayStr = diff > 0 ? differenceToBirthday : 'hoje 🎉';

  return `*${record.name}*, faz *${nextAge}* anos no dia ${day} (${daysToBirthdayStr})`;
}
