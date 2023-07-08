process.env.CYCLIC_DB_COLLECTION = `${process.env.CYCLIC_DB_COLLECTION}:test`;

import { DateTime } from 'luxon';
import {
  addRecord,
  getRecordsByChatId,
  getRecordsByDayAndMonth,
  removeRecord,
  clearDB,
  getRecord,
} from './dynamodb';
import { Gender } from './types';

const chatId = 12345;
const gender: Gender = 'male';

const record = { name: 'Rui', date: '1984-12-26', month: 12, day: 26, gender, chatId };
const record2 = { name: 'Ricardo', date: '1980-07-01', month: 7, day: 1, gender, chatId };
const dbRecord = {
  $index: ['date', 'chatId'],
  collection: process.env.CYCLIC_DB_COLLECTION,
  key: `${chatId}:Rui:1984-12-26`,
  props: {
    chatId,
    date: '1984-12-26',
  },
};

console.log(` * Using collection '${process.env.CYCLIC_DB_COLLECTION}' for tests`);

describe('DynamoDB tests', () => {
  beforeEach(async () => {
    return await clearDB();
  });

  it('adds a record successfully', async () => {
    const birthday = await addRecord(record);
    expect(birthday).toEqual(dbRecord);

    const allBirthdays = await getRecordsByChatId(chatId);

    expect(allBirthdays.length).toEqual(1);
    expect(allBirthdays[0].name).toEqual(record.name);
    expect(allBirthdays[0].date).toEqual(record.date);
  });

  it('removes a record successfully', async () => {
    const birthday = await addRecord(record);
    expect(birthday).toEqual(dbRecord);

    let allBirthdays = await getRecordsByChatId(chatId);

    expect(allBirthdays.length).toEqual(1);

    await removeRecord(record);

    allBirthdays = await getRecordsByChatId(chatId);

    expect(allBirthdays.length).toEqual(0);
  });

  it('works with multiple records', async () => {
    await addRecord(record);
    await addRecord(record2);
    await addRecord(record2); // upserts fine
    expect((await getRecordsByChatId(chatId)).length).toEqual(2);

    await removeRecord(record);

    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
  });

  it('gets a record', async () => {
    await addRecord(record);
    await addRecord(record2);
    expect(await getRecord({ name: record.name, date: record.date, chatId })).toMatchObject({
      name: record.name,
      date: record.date,
      chatId,
    });
  });

  it('finds a record by month and day ', async () => {
    await addRecord(record);
    await addRecord(record2);

    expect(await getRecordsByDayAndMonth({ day: record2.day, month: record2.month })).toEqual([
      record2,
    ]);
  });

  it('returns empty array on no match', async () => {
    await addRecord(record);
    expect(await getRecordsByDayAndMonth({ day: record2.day, month: record2.month })).toEqual([]);
  });

  it('is multitenant', async () => {
    const newChatId = 54321;
    await addRecord(record);
    await addRecord(record2);
    await addRecord({ ...record2, chatId: newChatId });

    expect((await getRecordsByChatId(chatId)).length).toEqual(2);
    expect((await getRecordsByChatId(newChatId)).length).toEqual(1);

    expect(await getRecordsByDayAndMonth({ day: record2.day, month: record2.month })).toEqual([
      record2,
      { ...record2, chatId: newChatId },
    ]);

    await removeRecord(record2);

    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
    expect((await getRecordsByChatId(newChatId)).length).toEqual(1);

    await removeRecord({ ...record2, chatId: newChatId });

    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
    expect((await getRecordsByChatId(newChatId)).length).toEqual(0);

    expect(await getRecordsByDayAndMonth({ day: record.day, month: record.month })).toEqual([
      record,
    ]);
  });
});
