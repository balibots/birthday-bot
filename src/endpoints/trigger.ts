import express, { Handler } from 'express';
import { MiddlewareFn } from 'grammy';
import { DateTime } from 'luxon';
import { buildRecordKey, getRecordsByDayAndMonth } from '../dynamodb';
import generateSalutation from '../salutations';
import { BirthdayListEntry } from '../types';
import { get, set } from '../cache';

const triggerCacheKeyFor = (today: DateTime) =>
  `trigger:${today.toFormat('yyyy-MM-dd')}`;

const triggerEndpoint = async ({ sendMessage }: { sendMessage: any }) => {
  console.log('Triggering birthday alerts at', new Date());
  const today = DateTime.now();

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

  birthdays.forEach((birthday) => {
    const formattedMsg = generateSalutation(birthday);
    console.log(
      `Sending message to group ${birthday.chatId} about ${birthday.name}`
    );

    sendMessage(birthday.chatId, formattedMsg, {
      parse_mode: 'Markdown',
    });
  });

  await set(
    triggerCacheKeyFor(today),
    Array.from(new Set([...processed, ...birthdaysKeys])).join(',')
  );

  return birthdays;
};

export default triggerEndpoint;
