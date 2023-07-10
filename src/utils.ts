import { CommandContext } from 'grammy';
import { Chat } from 'grammy/types';
import { DateTime, Interval } from 'luxon';
import { MyContext } from './bot';
import { BirthdayListEntry, Gender } from './types';

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

const capitalizeFirstChar = (text: string) =>
  text.charAt(0).toUpperCase() + text.substring(1);

// Simple sanitization, we might need to add something more complex in the future
export const sanitizeName = (name: string): string => {
  const sanitized = capitalizeFirstChar(name.trim().toLowerCase());

  return sanitized;
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
