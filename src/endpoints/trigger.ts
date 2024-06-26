import express, { Handler } from 'express';
import { MiddlewareFn } from 'grammy';
import { DateTime } from 'luxon';
import { getRecordsByDayAndMonth } from '../postgres';
import generateSalutation from '../salutations';
import { BirthdayListEntry } from '../types';
import { get, set } from '../cache';
import { getConfigForGroup } from '../config';
import i18next from 'i18next';
import { DEFAULT_LANGUAGE } from '../i18n';

// DEFAULT NOTIFICATION HOUR = 7am UTC
// this will probably change in the future.
const NOTIFICATION_START_HOUR = process.env.NOTIFICATION_START_HOUR || 7;

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
    if (processed.includes(String(birthday.id))) {
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

    const groupConfig = await getConfigForGroup(birthday.chatId);

    await i18next.changeLanguage(groupConfig?.language ?? DEFAULT_LANGUAGE);

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

    notified.push(String(birthday.id));
  }

  await set(
    triggerCacheKeyFor(today),
    Array.from(new Set([...processed, ...notified])).join(',')
  );

  return birthdays.filter((b) => notified.includes(String(b.id)));
};

const getNotificationHourConfig = async (chatId: number) => {
  const config = await getConfigForGroup(chatId);
  return config && config.notificationHour;
};

export default triggerEndpoint;
