import { DateTime } from 'luxon';

export type Gender = 'male' | 'female' | null;

export interface BirthdayRecord {
  id?: number;
  name: string;
  date: string;
  month: number;
  day: number;
  chatId: number;
  tgId?: number; // telegram id - UNUSED
  gender: Gender;
}

// What we get from the database, not every field is useful after getting a record,
// so we pick only the ones we need
export type BirthdayListEntry = Pick<
  BirthdayRecord,
  'id' | 'name' | 'date' | 'gender' | 'chatId' | 'tgId'
>;
