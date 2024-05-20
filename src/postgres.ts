import { PrismaClient } from '@prisma/client';
import { BirthdayRecord, BirthdayListEntry } from './types';
import { DateTime } from 'luxon';
import { normalizeName } from './utils';

type DBKeyArgs = Pick<BirthdayRecord, 'name' | 'chatId'>;

let prisma = new PrismaClient();

export async function addRecord({ ...params }: BirthdayRecord) {
  // extract year. doing this here to avoid changing code upstream but
  // should be refactored at some point.
  const year = parseInt(params.date.split('-')[0]);
  const isoDate = DateTime.utc(year, params.month, params.day).toISO();

  params.name = normalizeName(params.name);

  if (!isoDate) {
    throw new Error(`Could not parse date ${params.date}`);
  }

  // add is upsert so trying to find record first.
  const potentialUser = await getRecord(params);

  if (potentialUser) {
    throw new Error('User already exists');
  }

  const user = await prisma.user.create({
    data: {
      name: params.name,
      date: isoDate,
      day: params.day,
      month: params.month,
      year: year,
      gender: params.gender,
      GroupChat: {
        connectOrCreate: {
          where: {
            id: params.chatId,
          },
          create: {
            id: params.chatId,
          },
        },
      },
    },
  });

  return parseRecord(user);
}

export async function removeRecord({
  ...params
}: DBKeyArgs): Promise<BirthdayRecord> {
  params.name = normalizeName(params.name);
  const user = await prisma.user.deleteMany({
    where: {
      name: params.name,
      GroupChat: {
        id: params.chatId,
      },
    },
  });

  return parseRecord(user);
}

export async function clearDB() {
  await prisma.user.deleteMany({ where: {} });
  await prisma.groupChat.deleteMany({ where: {} });
}

export async function getRecord({
  ...params
}: DBKeyArgs): Promise<BirthdayListEntry | null> {
  params.name = normalizeName(params.name);
  const record = await prisma.user.findFirst({
    where: {
      name: params.name,
      GroupChat: {
        id: params.chatId,
      },
    },
  });

  return record ? parseRecord(record) : null;
}

export async function getRecordsByChatId(
  chatId: number
): Promise<BirthdayListEntry[]> {
  const users = await prisma.user.findMany({
    where: {
      GroupChat: {
        id: chatId,
      },
    },
  });

  return parseList(users);
}

export async function getRecordsByDayAndMonth({
  day,
  month,
}: {
  month: number;
  day: number;
}): Promise<BirthdayListEntry[]> {
  const users = await prisma.user.findMany({
    where: {
      day,
      month,
    },
  });

  return parseList(users);
}

export async function removeAllByChatId(chatId: number) {
  await prisma.user.deleteMany({ where: { GroupChat: { id: chatId } } });
  await prisma.groupChat.delete({ where: { id: chatId } });
}

// TODO remove from here to utils?
const parseList = (dbList: any[]): BirthdayListEntry[] => {
  return dbList.map((result) => parseRecord(result));
};

// TODO remove from here to utils?
const parseRecord = (dbRecord: any): BirthdayRecord => {
  let { id, gender, date, name, groupChatId, day, month } = dbRecord;

  return {
    id,
    date: DateTime.fromJSDate(date).toISODate()!,
    name,
    gender,
    chatId: groupChatId,
    day,
    month,
  };
};
