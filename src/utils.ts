import { Api, RawApi } from 'grammy';
import { Chat } from 'grammy/types';
import { DateTime, Interval } from 'luxon';
import { BirthdayListEntry, BirthdayRecord, Gender } from './types';
import { titleCase } from 'title-case';
import { getGender } from './genderize';

export function getAge(date: string): number {
  const computedAge = DateTime.fromISO(date).diffNow('years').years * -1;
  return Math.floor(computedAge);
}

export const sortClosestDate = (a: BirthdayListEntry, b: BirthdayListEntry) => {
  const dt = DateTime.now().startOf('day');

  let dateA = DateTime.fromISO(a.date).set({ year: dt.year });
  if (dt > dateA) dateA = dateA.set({ year: dt.year + 1 });

  let dateB = DateTime.fromISO(b.date).set({ year: dt.year });
  if (dt > dateB) dateB = dateB.set({ year: dt.year + 1 });

  const ia = Interval.fromDateTimes(dt, dateA);
  const ib = Interval.fromDateTimes(dt, dateB);
  return ia.length() - ib.length();
};

export const sortAbsoluteDate = (
  a: BirthdayListEntry,
  b: BirthdayListEntry
) => {
  // Normalize to same year so sorting is by month/day only,
  // avoiding placeholder years (e.g. 1904) from skewing the order.
  let dateA = DateTime.fromISO(a.date).set({ year: 2000 });
  let dateB = DateTime.fromISO(b.date).set({ year: 2000 });
  return dateA > dateB ? 1 : dateA < dateB ? -1 : 0;
};

export const daysToBirthday = (strdate: string) => {
  const dt = DateTime.now().startOf('day');

  let bdate = DateTime.fromISO(strdate).set({ year: dt.year });
  if (dt > bdate) bdate = bdate.set({ year: dt.year + 1 });

  return Math.ceil(Interval.fromDateTimes(dt, bdate).length('days'));
};

export const isBirthdayToday = (strdate: string) => {
  const days = daysToBirthday(strdate);
  return days === 0;
};

// Simple sanitization, we might need to add something more complex in the future
export const sanitizeName = (name: string): string => {
  if (name[0] === '"' || name[0] === '“') {
    // literal mode, dont mess with capitalization
    return name
      .replace(/"|“|”/g, '') // remove all quotes
      .replace(/\s{2,}/g, ' ') // replace multiple spaces with a single one
      .trim();
  } else {
    return titleCase(name.toLowerCase())
      .replace(/\s{2,}/g, ' ') // replace multiple spaces with a single one
      .replace(/'\w/, (word) => word.toUpperCase()) // capitalize words after apostrophes
      .trim();
  }
};

export const getPronoun = (gender: Gender): string => {
  switch (gender) {
    case 'male':
      return 'o';
    case 'female':
      return 'a';
    default:
      return 'o/a';
  }
};

export const isGroup = (
  chat: Chat | undefined
): chat is Chat.GroupChat | Chat.SupergroupChat => {
  if (!chat) return false;
  return (
    chat.type === 'group' ||
    chat.type === 'supergroup' ||
    chat.type === 'channel'
  );
};

export const buildRecord = async (
  name: string,
  date: string,
  chatId: number,
  year?: number
): Promise<BirthdayRecord> => {
  if (!name || !date || !chatId || isNaN(chatId)) {
    throw new Error('Invalid params');
  }
  const parsedDate = DateTime.fromISO(date);

  if (!parsedDate.isValid) {
    throw new Error('Invalid date');
  }

  const sanitized = sanitizeName(name);
  const gender = await getGender(sanitized);

  return {
    name: sanitized,
    date: parsedDate.toFormat('yyyy-MM-dd'),
    month: parsedDate.month,
    day: parsedDate.day,
    year,
    gender,
    chatId: chatId,
  };
};

export interface ParsedDate {
  date: DateTime;
  hasYear: boolean;
}

export const parseDate = (dateStr: string): ParsedDate => {
  // Only try ISO parsing if the string looks like it has a year (4+ digit prefix)
  // to avoid ambiguity with short strings like "12-30" being parsed as times
  if (/^\d{4}/.test(dateStr)) {
    const isoDate = DateTime.fromISO(dateStr);
    if (isoDate.isValid) return { date: isoDate, hasYear: true };
  }

  const formatsWithYear = [
    'dd-MM-yyyy',
    'd-M-yyyy',
    'dd/MM/yyyy',
    'd/M/yyyy',
    'yyyy-M-d',
  ];

  for (let format of formatsWithYear) {
    const date = DateTime.fromFormat(dateStr, format);
    if (date.isValid) return { date, hasYear: true };
  }

  // Try formats without year (day-month first, as it's the more natural format)
  const formatsWithoutYear = [
    'dd-MM',
    'd-M',
    'dd/MM',
    'd/M',
    'MM-dd',
    'M-d',
    'MM/dd',
    'M/d',
  ];

  for (let format of formatsWithoutYear) {
    const date = DateTime.fromFormat(dateStr, format);
    if (date.isValid) return { date, hasYear: false };
  }

  // returning an invalid date if we cant parse it
  return { date: DateTime.invalid('unparsable'), hasYear: true };
};

export async function isMemberOfGroup(
  userId: number,
  groupId: number,
  api: Api<RawApi>
) {
  try {
    const userInfo = await api.getChatMember(groupId, userId);
    if (['left', 'kicked'].includes(userInfo.status)) {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    return false;
  }
}

export function escapeForMarkdownV2(str: string) {
  return str
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}
