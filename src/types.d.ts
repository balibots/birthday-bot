import { DateTime } from 'luxon';

export type Gender = 'male' | 'female' | null;

export interface BirthdayRecord {
  name: string;
  date: string;
  chatId: number;
  day: number;
  month: number;
  tgId?: number; // telegram id
  gender: Gender;
}

// What we get from the database, not every field is useful after getting a record,
// so we pick only the ones we need
export type BirthdayListEntry = Pick<
  BirthdayRecord,
  'name' | 'date' | 'gender' | 'chatId' | 'tgId'
>;
