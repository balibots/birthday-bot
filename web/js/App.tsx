import React, { useEffect, useState, useMemo } from 'react';
import '@telegram-apps/telegram-ui/dist/styles.css';

import {
  AppRoot,
  Text,
  LargeTitle,
  List,
  Chip,
  Radio,
} from '@telegram-apps/telegram-ui';

import Birthdays from './components/Birthdays';
import type {
  BirthdaysResponse,
  GroupBirthdayInfo,
  GrouppingMode,
  BirthdayInfo,
} from './types';

declare global {
  interface Window {
    BOT_BASE_API: string;
    Telegram: any;
  }
}

const BASE_API = window.BOT_BASE_API;

const App = () => {
  const [data, setData] = useState();
  const [mode, setMode] = useState<GrouppingMode>('calendar');

  const [birthdays, setBirthdays] = useState<GroupBirthdayInfo[]>();

  const initializeTelegram = async () => {
    const tg = window.Telegram;

    if (!tg || !tg.WebApp?.initData) {
      console.warn(
        'No Telegram data found - using dummy data for rendering purposes'
      );
      const sampleData = await import('./sampleData.json');
      setBirthdays(sampleData.birthdays as GroupBirthdayInfo[]);
      return;
    }

    tg.WebApp.MainButton.text = 'Close';
    tg.WebApp.MainButton.onClick(() => tg.WebApp.close());
    tg.WebApp.MainButton.show();

    //setTg(tg);
    setData(tg.WebApp.initData);
  };

  const requestBirthdayInfo = async (
    data: any /* TODO: type initData??? */
  ): Promise<BirthdaysResponse | null> => {
    try {
      const response = await fetch(`${BASE_API}/api/miniapp/birthdays`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      return await response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  useEffect(() => {
    initializeTelegram();
  }, []);

  useEffect(() => {
    async function run() {
      const response = await requestBirthdayInfo(data);
      if (response) {
        setBirthdays(response.birthdays);
      }
    }

    if (data) run();
  }, [data]);

  const handleSwitchChange = () => {
    setMode((mode) => (mode === 'calendar' ? 'group' : 'calendar'));
  };

  // TODO this still doesnt solve it - we need some sort of cache table to actually save the values of the calculations
  const birthdaysGroupped = useMemo(
    () => groupBirthdaysByMode(birthdays, mode),
    [birthdays, mode]
  );

  return (
    <AppRoot>
      <LargeTitle weight="1" style={{ margin: '8px 0 0' }}>
        BirthdayBot
      </LargeTitle>
      <List
        style={{
          background: 'var(--tgui--bg_color)',
          margin: '0 -8px',
          padding: '0.5em 8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
          className="radio-container"
        >
          <Text
            style={{
              fontSize: '0.9em',
              color: 'var(--tg-theme-subtitle-text-color)',
            }}
          >
            Group by:
          </Text>
          <Chip
            mode="elevated"
            before={
              <Radio
                name="mode"
                value="calendar"
                checked={mode === 'calendar'}
                onChange={() => handleSwitchChange()}
              />
            }
            onClick={() => setMode('calendar')}
          >
            Calendar
          </Chip>
          <Chip
            mode="elevated"
            before={
              <Radio
                name="mode"
                value="group"
                checked={mode === 'group'}
                onChange={() => handleSwitchChange()}
              />
            }
            onClick={() => setMode('group')}
          >
            Chat
          </Chip>
        </div>
      </List>
      {birthdaysGroupped && <Birthdays data={birthdaysGroupped} mode={mode} />}
    </AppRoot>
  );
};

function groupBirthdaysByMode(
  birthdays: GroupBirthdayInfo[] | undefined,
  mode: GrouppingMode
): GroupBirthdayInfo[] | undefined {
  if (!birthdays || !mode) return;

  if (mode === 'group') {
    return birthdays;
  } else if (mode === 'calendar') {
    let cache: Record<number, BirthdayInfo[]> = {};
    for (let i = 0; i < 12; i++) {
      cache[i] = [];
    }

    birthdays.forEach((group) => {
      group.birthdays.forEach((birthday) => {
        birthday.dedupGroupNames = undefined;
        cache[birthday.month - 1].push(birthday);
      });
    });

    for (let i = 0; i < 12; i++) {
      // sort birthdays by day
      cache[i].sort((a, b) => a.day - b.day);

      // dedup birthdays if same name and date
      cache[i] = cache[i].reduce(
        (acc: BirthdayInfo[], el: BirthdayInfo, j: number) => {
          if (j === 0) {
            acc.push(el);
            return acc;
          }

          let dedupd = false;

          for (let k = acc.length - 1; k >= 0; k--) {
            if (el.name === acc[k].name && el.date === acc[k].date) {
              acc[k].dedupGroupNames = acc[k].dedupGroupNames || [
                acc[k].groupName,
              ];
              acc[k].dedupGroupNames!.push(el.groupName);
              dedupd = true;
              break;
            } else if (el.day !== acc[k].day) {
              // optimization: if we're no longer on the same day of the month (array is sorted) we can give up
              break;
            }
          }

          if (!dedupd) {
            acc.push(el);
          }

          return acc;
        },
        []
      );
    }

    return Object.keys(cache).map((el: string) => {
      const date = new Date(2024, +el, 1);
      const monthName = date.toLocaleString('default', { month: 'long' });

      return {
        groupName: monthName,
        groupId: +el,
        birthdays: cache[+el],
      };
    });
  }
}

export default App;
