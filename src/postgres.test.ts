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
};
const record2 = {
  name: 'Ricardo',
  date: '1980-07-01',
  month: 7,
  day: 1,
  gender,
  chatId,
};

describe('Postgres tests', () => {
  beforeEach(async () => {
    return await clearDB();
  });

  it('adds a record successfully', async () => {
    const birthday = await addRecord(record);
    expect(birthday).toEqual({ ...record, id: expect.any(Number) });

    const allBirthdays = await getRecordsByChatId(chatId);

    expect(allBirthdays.length).toEqual(1);
    expect(allBirthdays[0].name).toEqual(record.name);
    expect(allBirthdays[0].date).toEqual(record.date);
  });

  it('removes a record successfully', async () => {
    const birthday = await addRecord(record);
    expect(birthday).toEqual({ ...record, id: expect.any(Number) });

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
    ).toEqual([{ ...record2, id: expect.any(Number) }]);
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
      { ...record2, id: expect.any(Number) },
      { ...record2, chatId: newChatId, id: expect.any(Number) },
    ]);

    await removeRecord(record2);

    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
    expect((await getRecordsByChatId(newChatId)).length).toEqual(1);

    await removeRecord({ ...record2, chatId: newChatId });

    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
    expect((await getRecordsByChatId(newChatId)).length).toEqual(0);

    expect(
      await getRecordsByDayAndMonth({ day: record.day, month: record.month })
    ).toEqual([{ ...record, id: expect.any(Number) }]);
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
    await addRecord({ ...record, name: 'RUI' });
    await addRecord({ ...record, name: 'rUi' });
    expect((await getRecordsByChatId(chatId)).length).toEqual(1);
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
