import express from 'express';

import ical, {
  ICalCalendarMethod,
  ICalEventRepeatingFreq,
} from 'ical-generator';
import {
  getAllBirthdaysForUserByGroup,
  isValidUserCalendarToken,
} from './apiUtils';

const router = express.Router();

router.get('/:user/:token/cal.ics', async (req, res) => {
  const { user, token } = req.params;

  if (!user) {
    return res.status(400).send({ error: 'User Id  missing' });
  } else if (!token) {
    return res.status(400).send({ error: 'User Token missing' });
  }

  const userId = +user;

  if (!isValidUserCalendarToken(userId, token as string)) {
    return res.status(403).end();
  }

  const groups = await getAllBirthdaysForUserByGroup(userId);

  const calendar = ical({ name: 'BirthdayBot' });
  calendar.method(ICalCalendarMethod.REQUEST);

  let birthdayMap = new Map();

  groups.forEach((group) => {
    group.birthdays.forEach((birthday) => {
      const key = `${birthday.name}-${birthday.date}`;
      if (!birthdayMap.has(key)) {
        birthdayMap.set(key, birthday);
      } else {
        let b = birthdayMap.get(key);
        birthdayMap.set(key, {
          ...b,
          dedupGroupNames: [
            ...(b.dedupGroupNames || [b.groupName]),
            birthday.groupName,
          ],
        });
      }
    });
  });

  const allBirthdays = Array.from(birthdayMap.values());

  console.log(allBirthdays);

  allBirthdays.forEach((birthday) => {
    let groupDescription;
    if (birthday.dedupGroupNames) {
      groupDescription = `, from the following groups: ${birthday.dedupGroupNames.join(
        ', '
      )}.`;
    } else if (birthday.groupName) {
      groupDescription = `, from the ${birthday.groupName} group.`;
    }

    calendar.createEvent({
      start: birthday.date,
      end: birthday.date,
      summary: `🎂 ${birthday.name}`,
      allDay: true,
      repeating: { freq: ICalEventRepeatingFreq.YEARLY },
      description: `BirthdayBot: Today is ${birthday.name}'s birthday${
        groupDescription ?? '!'
      }`,
    });
  });

  res.writeHead(200, {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': 'attachment; filename="calendar.ics"',
  });

  res.end(calendar.toString());
});

export default router;
