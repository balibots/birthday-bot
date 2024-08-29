import express from 'express';
import { Api } from 'grammy';
import {
  getAllBirthdaysForUserByGroup,
  getTokenForUserCalendar,
} from './apiUtils';
import crypto from 'node:crypto';

const miniappRouter = express.Router();
const api = new Api(process.env.TELEGRAM_TOKEN, {
  environment: (process.env.BOT_ENV as 'prod' | 'test' | undefined) || 'prod',
});

miniappRouter.post('/birthdays', async (req, res) => {
  const { data } = req.body;

  // not great. might send the json from the client as well?
  let jsonData = Object.fromEntries(new URLSearchParams(data));

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_TOKEN)
    .digest();

  const dataCheckString = Object.keys(jsonData)
    .sort()
    .filter((key) => key !== 'hash')
    .map((key) => `${key}=${jsonData[key]}`)
    .join('\n');

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== jsonData.hash) {
    console.error('Hash verification failed for data', jsonData);
    return res.status(403).send({ error: 'Hash verification failed' });
  }

  const user = JSON.parse(jsonData.user);

  const response = await getAllBirthdaysForUserByGroup(user.id);

  const icsUrl = `/calendar/${user.id}/${getTokenForUserCalendar(
    user.id
  )}/cal.ics`;

  return res.json({ birthdays: response, icsUrl });
});

export default miniappRouter;
