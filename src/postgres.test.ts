import {
  addRecord,
  getRecordsByChatId,
  clearDB,
  removeRecord,
  getRecord,
  getRecordsByDayAndMonth,
} from './postgres';
import { Gender } from './types';

const chatId = 12345;
const gender: Gender = 'male';

const record = {
  name: 'Rui',
  date: '1984-12-26',
  month: 12,
  day: 26,
  gender,
  chatId,
  year: 1984,
};
const record2 = {
  name: 'Ricardo',
  date: '1980-07-01',
  month: 7,
  day: 1,
  gender,
  chatId,
  year: 1980,
};

describe('Postgres tests', () => {
  beforeEach(async () => {
    return await clearDB();
  });

  afterAll(async () => {
    return await clearDB();
  });

  it('adds a record successfully', async () => {
    const birthday = await addRecord(record);
    expect(birthday).toEqual({ ...record, id: expect.any(String) });

    const allBirthdays = await getRecordsByChatId(chatId);

    expect(allBirthdays.length).toEqual(1);
    expect(allBirthdays[0].name).toEqual(record.name);
    expect(allBirthdays[0].date).toEqual(record.date);
  });

  it('removes a record successfully', async () => {
    const birthday = await addRecord(record);
    expect(birthday).toEqual({ ...record, id: expect.any(String) });

    let allBirthdays = await getRecordsByChatId(chatId);

    expect(allBirthdays.length).toEqual(1);

    await removeRecord(record);

    allBirthdays = await getRecordsByChatId(chatId);

    expect(allBirthdays.length).toEqual(0);
  });

  it('works with multiple records', async () => {
    await addRecord(record);
    await addRecord(record2);
    await expect(async () => {
      await addRecord(record2); // upserts
    }).rejects.toThrow();
    expect((await getRecordsByChatId(chatId)).length).toEqual(2);

    await removeRecord(record);

    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
  });

  it('gets a record', async () => {
    await addRecord(record);
    await addRecord(record2);
    expect(await getRecord({ name: record.name, chatId })).toMatchObject({
      name: record.name,
      date: record.date,
      chatId,
    });
  });

  it('finds a record by month and day ', async () => {
    await addRecord(record);
    await addRecord(record2);

    expect(
      await getRecordsByDayAndMonth({ day: record2.day, month: record2.month })
    ).toEqual([{ ...record2, id: expect.any(String) }]);
  });

  it('returns empty array on no match', async () => {
    await addRecord(record);
    expect(
      await getRecordsByDayAndMonth({ day: record2.day, month: record2.month })
    ).toEqual([]);
  });

  it('is multitenant', async () => {
    const newChatId = 54321;
    await addRecord(record);
    await addRecord(record2);
    await addRecord({ ...record2, chatId: newChatId });

    expect((await getRecordsByChatId(chatId)).length).toEqual(2);
    expect((await getRecordsByChatId(newChatId)).length).toEqual(1);

    expect(
      await getRecordsByDayAndMonth({ day: record2.day, month: record2.month })
    ).toEqual([
      { ...record2, id: expect.any(String) },
      { ...record2, chatId: newChatId, id: expect.any(String) },
    ]);

    await removeRecord(record2);

    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
    expect((await getRecordsByChatId(newChatId)).length).toEqual(1);

    await removeRecord({ ...record2, chatId: newChatId });

    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
    expect((await getRecordsByChatId(newChatId)).length).toEqual(0);

    expect(
      await getRecordsByDayAndMonth({ day: record.day, month: record.month })
    ).toEqual([{ ...record, id: expect.any(String) }]);
  });

  it('upserts', async () => {
    let record = {
      name: 'Rui',
      date: '1984-12-26',
      month: 12,
      day: 26,
      gender,
      chatId,
    };

    await addRecord(record);
    await expect(
      async () =>
        await addRecord({ ...record, name: 'RUI', date: '1984-12-27' })
    ).rejects.toThrow();

    await expect(
      async () =>
        await addRecord({ ...record, name: 'rUi', date: '1984-12-28' })
    ).rejects.toThrow();

    const results = await getRecordsByChatId(chatId);
    expect(results.length).toEqual(1);
    expect(results[0].name).toEqual('Rui');
    expect(results[0].date).toEqual('1984-12-26');
  });

  it('normalises keys to lowercase', async () => {
    let record = {
      name: 'RUI',
      date: '1984-12-26',
      month: 12,
      day: 26,
      gender,
      chatId,
    };

    await addRecord(record);
    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
    await removeRecord({ name: 'rUi', chatId });
    expect((await getRecordsByChatId(chatId)).length).toEqual(0);
  });
});
