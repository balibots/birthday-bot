import express from 'express';
import { getGroupChats, getRecordsByChatId } from '../postgres';
import { sortClosestDate } from '../utils';
import { Api } from 'grammy';
import crypto from 'node:crypto';
import { birthdayLine } from '../interface';

const miniappRouter = express.Router();
const api = new Api(process.env.TELEGRAM_TOKEN, {
  environment: (process.env.BOT_ENV as 'prod' | 'test' | undefined) || 'prod',
});

miniappRouter.post('/birthdays', async (req, res) => {
  const data = req.body.data;

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

  const groups = await getGroupChats();
  let response = [];

  for (let group of groups) {
    let userInfo;

    try {
      userInfo = await api.getChatMember(group.id, user.id);
      if (['left', 'kicked'].includes(userInfo.status)) {
        throw new Error();
      }
    } catch (e) {
      // this continue is very important otherwise this executes anyway!
      continue;
    }

    const birthdays = (await getRecordsByChatId(group.id)).sort(
      sortClosestDate
    );

    response.push({
      group: group.name,
      birthdays: birthdays.map((b: any) => {
        b.formattedLine = birthdayLine(b, 'en');
        return b;
      }),
    });
  }

  res.json({ birthdays: response });
});

export default miniappRouter;
