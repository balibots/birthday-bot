import type { BirthdaBirthdayRecord } from '../../src/types';

export interface BirthdaysResponse {
  birthdays: GroupBirthdayInfo[];
}

export interface GroupBirthdayInfo {
  groupName: string;
  groupId: number;
  birthdays: BirthdayInfo[];
}

export type BirthdayInfo = BirthdayRecord & {
  formattedLine: string;
  groupName: string;
};

export type GrouppingMode = 'calendar' | 'group';
