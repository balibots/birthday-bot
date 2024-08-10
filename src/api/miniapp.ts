import express from 'express';
import { getGroupChats, getRecordsByChatId, GroupInfo } from '../postgres';
import { sortClosestDate } from '../utils';
import { Api } from 'grammy';
import crypto from 'node:crypto';
import { birthdayLine } from '../interface';
import { BirthdayListEntry } from '../types';

const miniappRouter = express.Router();
const api = new Api(process.env.TELEGRAM_TOKEN, {
  environment: (process.env.BOT_ENV as 'prod' | 'test' | undefined) || 'prod',
});

interface BirthdaysList {
  groupName: string;
  groupId: number;
  birthdays: (BirthdayListEntry & { formattedLine: string })[];
}

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

  const requests = groups.map(
    async (group: GroupInfo): Promise<BirthdaysList | null> => {
      let userInfo;

      try {
        userInfo = await api.getChatMember(group.id, user.id);
        if (['left', 'kicked'].includes(userInfo.status)) {
          throw new Error();
        }
      } catch (e) {
        // not a group we want to include (the user is not a member)
        return null;
      }

      const birthdays = (await getRecordsByChatId(group.id)).sort(
        sortClosestDate
      );

      return {
        groupName: group.name,
        groupId: Math.abs(Number(group.id)),
        birthdays: birthdays.map((b: any) => {
          b.formattedLine = birthdayLine(b, 'en');
          return b;
        }),
      };
    }
  );

  const response = (await Promise.all(requests)).filter((a) => !!a);

  res.json({ birthdays: response });
});

export default miniappRouter;
