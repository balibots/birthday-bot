import express, { Handler } from 'express';
import { MiddlewareFn } from 'grammy';
import { DateTime } from 'luxon';
import { getRecordsByDayAndMonth } from '../dynamodb';
import generateSalutation from '../salutations';
import { BirthdayListEntry } from '../types';

const triggerEndpoint = async ({ sendMessage }: { sendMessage: any }) => {
  console.log('Triggering birthday alerts at', new Date());
  const today = DateTime.now();
  const birthdays = await getRecordsByDayAndMonth({
    day: today.day,
    month: today.month,
  });

  console.info(`Notifying ${birthdays.length} users today`, birthdays);

  birthdays.forEach((birthday) => {
    const formattedMsg = generateSalutation(birthday);
    console.info(
      `Sending message to group ${birthday.chatId} about ${birthday.name}`
    );

    sendMessage(birthday.chatId, formattedMsg, {
      parse_mode: 'Markdown',
    });
  });

  return birthdays;
};

export default triggerEndpoint;
