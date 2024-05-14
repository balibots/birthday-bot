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

  console.log(`${birthdays.length} users with birthdays today`, birthdays);

  let notified: string[] = [];

  for (let birthday of birthdays) {
    const birthdayKey = buildRecordKey(birthday);

    if (processed.includes(birthdayKey)) {
      console.info(
        `Skipping ${birthday.name} (${birthday.chatId}) as already notified today`
      );
      // not notifying the same people twice
      continue;
    }

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

    try {
      await sendMessage(birthday.chatId, formattedMsg, {
        parse_mode: 'Markdown',
      });
    } catch (e) {
      console.error(e);
      continue;
    }

    notified.push(birthdayKey);
  }

  await set(
    triggerCacheKeyFor(today),
    Array.from(new Set([...processed, ...notified])).join(',')
  );

  return birthdays.filter((b) => notified.includes(buildRecordKey(b)));
};

const getNotificationHourConfig = async (chatId: number) => {
  const config = await getConfigForGroup(chatId);
  return config && config.notificationHour;
};

export default triggerEndpoint;
