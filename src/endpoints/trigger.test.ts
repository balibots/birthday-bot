import { DateTime } from 'luxon';
import { clearCache } from '../cache';
import {
  addRecord,
  getRecordsByChatId,
  getRecordsByDayAndMonth,
  removeRecord,
  clearDB,
  getRecord,
} from '../postgres';

import '../i18n';
import triggerEndpoint from './trigger';

describe.skip('triggerEndpoint tests', () => {
  beforeAll(async () => {
    await clearDB();
    await clearCache();
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

  afterAll(async () => {
    await clearCache();
  });

  it('notifies the right people', async () => {
    const logMessage = jest.fn();
    const birthdays = await triggerEndpoint({ sendMessage: logMessage });
    expect(birthdays.length).toEqual(3);
    expect(logMessage).toHaveBeenCalledTimes(3);
  });

  it('does not notify them again', async () => {
    const logMessage = jest.fn();
    const birthdays = await triggerEndpoint({ sendMessage: logMessage });
    expect(birthdays.length).toEqual(0);
    expect(logMessage).toHaveBeenCalledTimes(0);
  });

  it('reacts to new peeps', async () => {
    const today = DateTime.now();
    const tomorrow = DateTime.now().plus({ days: 1 });

    await addRecord({
      name: 'Felix',
      date: today.toFormat('yyyy-MM-dd'),
      month: today.month,
      day: today.day,
      gender: 'male',
      chatId: -12345,
    });

    await addRecord({
      name: 'Pedro',
      date: tomorrow.toFormat('yyyy-MM-dd'),
      month: tomorrow.month,
      day: tomorrow.day,
      gender: 'male',
      chatId: -12345,
    });

    const logMessage = jest.fn();

    const birthdays = await triggerEndpoint({ sendMessage: logMessage });

    expect(birthdays.length).toEqual(1);
    expect(logMessage).toHaveBeenCalledTimes(1);
    expect(birthdays[0].name).toEqual('Felix');
  });
});
