import { PrismaClient } from '@prisma/client';
import { BirthdayRecord, BirthdayListEntry } from './types';
import { DateTime } from 'luxon';

type DBKeyArgs = Pick<BirthdayRecord, 'name' | 'chatId'>;

let prisma = new PrismaClient();

const buildKey = (params: DBKeyArgs) => {
  return `${params.chatId}:${params.name.toLowerCase()}`;
};

export interface GroupInfo {
  id: number;
  name: string;
  userCount: number;
}

export async function addRecord({ ...params }: BirthdayRecord) {
  // extract year. doing this here to avoid changing code upstream but
  // should be refactored at some point.
  const year = parseInt(params.date.split('-')[0]);
  const isoDate = DateTime.utc(year, params.month, params.day).toISO();

  if (!isoDate) {
    throw new Error(`Could not parse date ${params.date}`);
  }

  const user = await prisma.user.create({
    data: {
      id: buildKey(params),
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
  const key = buildKey(params);
  const user = await prisma.user.delete({
    where: {
      id: key,
    },
  });

  return parseRecord(user);
}

export async function clearDB() {
  const deleteUser = prisma.user.deleteMany();
  const deleteGroups = prisma.groupChat.deleteMany();

  // The transaction runs synchronously so deleteUsers must run last.
  await prisma.$transaction([deleteUser, deleteGroups]);
}

export async function getRecord({
  ...params
}: DBKeyArgs): Promise<BirthdayRecord | null> {
  const key = buildKey(params);
  const record = await prisma.user.findFirst({
    where: {
      id: key,
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

export async function insertGroupChat({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  return await prisma.groupChat.upsert({
    where: {
      id,
    },
    update: {
      name,
    },
    create: {
      id,
      name,
    },
  });
}

export async function getGroupChats(): Promise<GroupInfo[]> {
  return (await prisma.groupChat.findMany({ include: { users: true } })).map(
    (gc: any) => ({
      id: gc.id,
      name: gc.name,
      userCount: gc.users.length,
    })
  );
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
  let { id, gender, date, name, groupChatId, day, month, year } = dbRecord;

  return {
    id,
    date: DateTime.fromJSDate(date).toISODate()!,
    name,
    gender,
    chatId: Number(groupChatId),
    day,
    month,
    year,
  };
};
