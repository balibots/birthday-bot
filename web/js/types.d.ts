import type { BirthdayListEntry } from '../../src/types';

export interface BirthdaysResponse {
  birthdays: GroupBirthdayInfo[];
}

export interface GroupBirthdayInfo {
  groupName: string;
  groupId: number;
  birthdays: BirthdayInfo[];
}

export type BirthdayInfo = BirthdayListEntry & { formattedLine: string };
