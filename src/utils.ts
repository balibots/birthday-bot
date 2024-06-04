import { CommandContext } from 'grammy';
import { Chat } from 'grammy/types';
import { DateTime, Interval } from 'luxon';
import { MyContext } from './bot';
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
  let dateA = DateTime.fromISO(a.date);
  let dateB = DateTime.fromISO(b.date);
  return dateA > dateB ? 1 : dateA === dateB ? 0 : -1;
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
  return titleCase(name.toLowerCase())
    .replace(/\s{2,}/g, ' ') // replace multiple spaces with a single one
    .replace(/'\w/, (word) => word.toUpperCase()) // capitalize words after apostrophes
    .trim();
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
  return chat.type === 'group' || chat.type === 'supergroup';
};

export const buildRecord = async (
  name: string,
  date: string,
  chatId: number
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
    gender,
    chatId: chatId,
  };
};

export const parseDate = (dateStr: string) => {
  const isoDate = DateTime.fromISO(dateStr);
  if (isoDate.isValid) return isoDate;

  const otherFormats = [
    'dd-MM-yyyy',
    'd-M-yyyy',
    'dd/MM/yyyy',
    'd/M/yyyy',
    'yyyy-M-d',
  ];

  for (let format of otherFormats) {
    const date = DateTime.fromFormat(dateStr, format);
    if (date.isValid) return date;
  }

  // returning an invalid date if we cant parse it
  return isoDate;
};
