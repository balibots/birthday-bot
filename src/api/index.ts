import { DateTime } from 'luxon';
import { getNamespace } from '../cache';
import {
  addRecord,
  getRecordsByChatId,
  removeAllByChatId,
  removeRecord,
} from '../dynamodb';
import { getGender } from '../genderize';
import { requireKey } from '../middlewares';
import { buildRecord, sanitizeName } from '../utils';
import express from 'express';

const router = express.Router();

router.use(requireKey);

router.get('/:chatId/list', async (req, res) => {
  const birthdays = await getRecordsByChatId(parseInt(req.params.chatId));
  res.json({ birthdays });
});

router.post('/:chatId/import', async (req, res) => {
  const birthdays = req.body.birthdays;

  if (!birthdays) {
    res.status(400).json({ error: 'Need a birthdays array' });
  }

  for (const b of birthdays) {
    const parsedDate = DateTime.fromISO(b.date);
    const sanitized = sanitizeName(b.name);
    const gender = await getGender(sanitized);

    const params = {
      name: sanitized,
      date: parsedDate.toFormat('yyyy-MM-dd'),
      month: parsedDate.month,
      day: parsedDate.day,
      gender,
      chatId: parseInt(req.params.chatId),
    };

    await addRecord(params);
  }

  res.json({ birthdays });
});

router.post('/:chatId/clear', async (req, res) => {
  removeAllByChatId(parseInt(req.params.chatId));
  res.json({});
});

router.post('/:chatId/batch', async (req, res) => {
  const records = req.body.records;
  if (!records) {
    return res.status(400).json({ error: 'No data' });
  }
  let count = 0;
  for (const record of records) {
    console.log(record);
    if (record.op === 'add') {
      try {
        const dbRecord = await buildRecord(
          record.name,
          record.date,
          parseInt(req.params.chatId)
        );
        addRecord(dbRecord);
      } catch (e) {
        console.error(e);
        continue;
      }
    } else if (record.op === 'remove') {
      try {
        await removeRecord({
          name: record.name,
          chatId: parseInt(req.params.chatId),
        });
      } catch (e) {
        console.error(e);
        continue;
      }
    }
    count += 1;
  }
  res.json({ count });
});

router.get('/chats', async (req, res) => {
  const chats = await getNamespace('chatIds');
  res.json(chats);
});

export default router;
