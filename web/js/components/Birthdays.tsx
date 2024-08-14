import React from 'react';
import { GroupBirthdayInfo, BirthdayInfo, GrouppingMode } from '../types';
import { List, Section, Text } from '@telegram-apps/telegram-ui';

const Birthdays = ({
  data,
  mode,
}: {
  data: GroupBirthdayInfo[];
  mode: GrouppingMode;
}) => {
  if (mode === 'group') {
    return data.map((group, i) => (
      <Group key={`group-${i}`} group={group} mode={mode} />
    ));
  } else {
    const today = new Date();
    let j = today.getMonth();
    const nodes = [];
    for (let i = 0; i < 12; i++) {
      nodes.push(<Group key={`group-${j}`} group={data[j]} mode={mode} />);
      j = (j + 1) % 12;
    }

    return nodes;
  }
};

const Group = ({
  group,
  mode,
}: {
  group: GroupBirthdayInfo;
  mode: GrouppingMode;
}) => {
  const date = new Date();
  return (
    <Section style={{ margin: '1em 0' }}>
      <Section.Header large style={{ padding: '0.75em 8px 0.5em' }}>
        🎂 {group.groupName}{' '}
        {mode === 'group' && (
          <span
            style={{
              fontWeight: 400,
              fontSize: '0.9em',
              color: 'var(--tg-theme-subtitle-text-color)',
            }}
          >
            ({group.groupId})
          </span>
        )}
        {mode === 'calendar' && (
          <span
            style={{
              fontWeight: 400,
              fontSize: '0.9em',
              color: 'var(--tg-theme-subtitle-text-color)',
            }}
          >
            {date.getMonth() <= group.groupId
              ? date.getFullYear()
              : date.getFullYear() + 1}
          </span>
        )}
      </Section.Header>
      <List style={{ padding: '0.5em 1em' }}>
        {group.birthdays.map((b, i) => (
          <Birthday key={i} birthday={b} mode={mode} />
        ))}
      </List>
    </Section>
  );
};

const Birthday = ({
  birthday,
  mode,
}: {
  birthday: BirthdayInfo;
  mode: GrouppingMode;
}) => {
  return (
    <Text Component="li" style={{ fontSize: '0.9em', margin: 0 }}>
      {mode === 'group' ? (
        <>
          {formatDate(birthday.date)} - {birthday.name} (
          {getTurningAge(birthday.date)})
        </>
      ) : (
        <>
          {birthday.day} - {birthday.name} ({getTurningAge(birthday.date)}) -
          from {birthday.groupName}{' '}
        </>
      )}
    </Text>
  );
};

function getTurningAge(dateStr: string) {
  var today = new Date();
  var birthDate = new Date(dateStr);

  var age = today.getFullYear() - birthDate.getFullYear() + 1;
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function formatDate(date: string, locale: string = 'en'): string {
  const dateJS = new Date(date);
  return dateJS.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
}

export default Birthdays;
