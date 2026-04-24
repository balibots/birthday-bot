import { t } from 'i18next';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import { BirthdayListEntry, BirthdayRecord } from './types';
import { daysToBirthday, escapeForMarkdownV2, getAge } from './utils';

export function formatDate(
  date: string,
  locale: string,
  format?: DateTimeFormatOptions
): string {
  const dateJS = new Date(date);

  const options: DateTimeFormatOptions = format ?? {
    month: 'short',
    day: '2-digit',
  };

  return dateJS.toLocaleDateString(locale, { ...options });
}

export function birthdayLine(
  record: BirthdayListEntry,
  locale: string
): string {
  const days = daysToBirthday(record.date);
  return escapeForMarkdownV2(
    `\`${formatDate(record.date, locale)}\` — ${record.name} — ${
      days
        ? days > 1
          ? `${days} ${t('words.days')}`
          : `${days} ${t('words.day')}`
        : t('words.today')
    }`
  );
}

export function birthdayLineForMiniapp(
  record: BirthdayRecord & { groupName?: string },
  locale: string
): string {
  const days = daysToBirthday(record.date);
  const hasYear = record.year != null;
  const age = hasYear ? getAge(record.date) : null;

  const ageStr = age != null ? ` (${age})` : '';
  return `${formatDate(record.date, locale)} - ${record.name}${ageStr} - from ${
    record.groupName
  }`;
}

export function ageLine(record: BirthdayListEntry, locale: string): string {
  const hasYear = record.year != null;

  if (hasYear) {
    const age = getAge(record.date);
    const date = formatDate(record.date, locale, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    return escapeForMarkdownV2(
      `\`${date}\` — ${record.name}, ${age >= 0 ? Math.floor(age) : t('unborn')}`
    );
  } else {
    const date = formatDate(record.date, locale, {
      month: 'short',
      day: '2-digit',
    });
    return escapeForMarkdownV2(
      `\`${date}\` — ${record.name}`
    );
  }
}

export function nextBirthday(
  record: BirthdayListEntry,
  locale: string
): string {
  const hasYear = record.year != null;
  const diff = daysToBirthday(record.date);
  const day = formatDate(record.date, locale, {
    month: 'long',
    day: 'numeric',
  });

  const differenceToBirthday = DateTime.now()
    .setLocale(locale)
    .plus({ days: diff })
    .toRelative();

  const daysToBirthdayStr =
    diff === 0
      ? t('words.today')
      : diff === 1
      ? t('words.tomorrow')
      : differenceToBirthday;

  if (hasYear) {
    const age = getAge(record.date);
    const nextAge = Math.floor(age) + (diff === 0 ? 0 : 1);
    return escapeForMarkdownV2(
      t('commands.birthdays.sentence', {
        name: record.name,
        count: nextAge,
        day,
        daysToBirthdayStr,
      })
    );
  } else {
    return escapeForMarkdownV2(
      t('commands.birthdays.sentenceNoAge', {
        name: record.name,
        day,
        daysToBirthdayStr,
      })
    );
  }
}
