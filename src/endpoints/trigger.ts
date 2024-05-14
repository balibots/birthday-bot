import express, { Handler } from 'express';
import { MiddlewareFn } from 'grammy';
import { DateTime } from 'luxon';
import { buildRecordKey, getRecordsByDayAndMonth } from '../dynamodb';
import generateSalutation from '../salutations';
import { BirthdayListEntry } from '../types';
import { get, set } from '../cache';
import { getConfigForGroup } from '../config';

const NOTIFICATION_START_HOUR = process.env.NOTIFICATION_START_HOUR || 8;

const triggerCacheKeyFor = (today: DateTime) =>
  `trigger:${today.toFormat('yyyy-MM-dd')}`;

const triggerEndpoint = async ({ sendMessage }: { sendMessage: any }) => {
  console.log('Triggering birthday alerts at', new Date());
  // this is now UTC
  const today = DateTime.now().toUTC();

  let birthdays = await getRecordsByDayAndMonth({
    day: today.day,
    month: today.month,
  });

  const triggerCache = await get(triggerCacheKeyFor(today));
  const processed = triggerCache ? [...triggerCache.split(',')] : [];

  const birthdaysKeys = birthdays.map((record) => buildRecordKey(record));

  birthdays = birthdaysKeys.reduce<BirthdayListEntry[]>((acc, key, i) => {
    if (!processed.includes(key)) {
      acc.push(birthdays[i]);
    }

    return acc;
  }, []);

  console.log(`Notifying ${birthdays.length} users today`, birthdays);

  for (let birthday of birthdays) {
    const notificationTime =
      (await getNotificationHourConfig(birthday.chatId)) ||
      NOTIFICATION_START_HOUR;

    if (today.hour < notificationTime) {
      console.log(
        `Too early to trigger message for group ${birthday.chatId}: today.hour: ${today.hour}, notificationTime: ${notificationTime}`
      );
      continue;
    }

    const formattedMsg = generateSalutation(birthday);
    console.log(
      `Sending message to group ${birthday.chatId} about ${birthday.name}`
    );

    await sendMessage(birthday.chatId, formattedMsg, {
      parse_mode: 'Markdown',
    });
  }

  await set(
    triggerCacheKeyFor(today),
    Array.from(new Set([...processed, ...birthdaysKeys])).join(',')
  );

  return birthdays;
};

const getNotificationHourConfig = async (chatId: number) => {
  const config = await getConfigForGroup(chatId);
  return config && config.notificationHour;
};

export default triggerEndpoint;
