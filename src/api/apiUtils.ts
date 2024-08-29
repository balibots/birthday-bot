import crypto from 'node:crypto';
import { birthdayLineForMiniapp } from '../interface';
import { getGroupChats, getRecordsByChatId, GroupInfo } from '../postgres';
import { isMemberOfGroup, sortClosestDate } from '../utils';
import { BirthdayRecord } from '../types';
import { Api } from 'grammy';

const api = new Api(process.env.TELEGRAM_TOKEN, {
  environment: (process.env.BOT_ENV as 'prod' | 'test' | undefined) || 'prod',
});

export function getTokenForUserCalendar(userId: number) {
  return crypto
    .createHmac('sha256', process.env.TELEGRAM_TOKEN)
    .update(String(userId))
    .digest('hex');
}

export function isValidUserCalendarToken(userId: number, token: string) {
  return getTokenForUserCalendar(userId) === token;
}

interface BirthdaysList {
  groupName: string;
  groupId: number;
  birthdays: (BirthdayRecord & {
    formattedLine: string;
    groupName: string;
    groupId: number;
    dedupGroupNames?: string[];
  })[];
}

export async function getAllBirthdaysForUserByGroup(userId: number) {
  const groups = await getGroupChats();

  const requests = groups.map(
    async (group: GroupInfo): Promise<BirthdaysList | null> => {
      if (!(await isMemberOfGroup(userId, group.id, api))) {
        return null;
      }

      const birthdays = (await getRecordsByChatId(group.id)).sort(
        sortClosestDate
      );

      return {
        groupName: group.name,
        groupId: Math.abs(Number(group.id)),
        birthdays: birthdays.map((b: any) => {
          b.groupName = group.name;
          b.groupId = Math.abs(Number(group.id));
          b.formattedLine = birthdayLineForMiniapp(b, 'en');
          return b;
        }),
      };
    }
  );

  const response = (await Promise.all(requests)).filter(
    (a) => !!a
  ) as BirthdaysList[];

  return response;
}
