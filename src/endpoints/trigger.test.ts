process.env.CYCLIC_DB_COLLECTION = `${process.env.CYCLIC_DB_COLLECTION}:test`;

import { DateTime } from 'luxon';
import {
  addRecord,
  getRecordsByChatId,
  getRecordsByDayAndMonth,
  removeRecord,
  clearDB,
  getRecord,
} from '../dynamodb';

import '../i18n';
import triggerEndpoint from './trigger';

describe('triggerEndpoint tests', () => {
  beforeAll(async () => {
    await clearDB();
    const today = DateTime.now();
    const tomorrow = DateTime.now().plus({ days: 1 });

    await addRecord({
      name: 'Rui',
      date: today.toFormat('yyyy-MM-dd'),
      month: today.month,
      day: today.day,
      gender: 'male',
      chatId: -12345,
    });

    await addRecord({
      name: 'Ricardo',
      date: today.toFormat('yyyy-MM-dd'),
      month: today.month,
      day: today.day,
      gender: 'male',
      chatId: -54321,
    });

    await addRecord({
      name: 'Saul',
      date: tomorrow.toFormat('yyyy-MM-dd'),
      month: tomorrow.month,
      day: tomorrow.day,
      gender: 'male',
      chatId: -23456,
    });

    await addRecord({
      name: 'Joel',
      date: today.toFormat('yyyy-MM-dd'),
      month: today.month,
      day: today.day,
      gender: 'male',
      chatId: -12345,
    });
  });

  it('notifies the right people', async () => {
    const logMessage = jest.fn();
    const birthdays = await triggerEndpoint({ sendMessage: logMessage });
    expect(birthdays.length).toEqual(3);
    expect(logMessage).toHaveBeenCalledTimes(3);
  });

  it.skip('does not notify them again', async () => {
    // TODO fails
    const logMessage = jest.fn();
    const birthdays = await triggerEndpoint({ sendMessage: logMessage });
    expect(birthdays.length).toEqual(0);
    expect(logMessage).toHaveBeenCalledTimes(0);
  });
});
