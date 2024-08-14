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
      <Section.Header large style={{ padding: '0.75em 0.88em 0.5em' }}>
        🎂 {group.groupName}{' '}
        {mode === 'group' && (
          <span
            style={{
              fontWeight: 500,
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
              fontWeight: 500,
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
  const padDay = (day: number): string => (day < 10 ? `0${day}` : `${day}`);

  return (
    <Text
      Component="p"
      style={{
        /*fontSize: '0.9em',*/
        marginBottom: '6px',
      }}
    >
      {mode === 'group' ? (
        <>
          {formatDate(birthday.date)} - {birthday.name} (
          {getTurningAge(birthday.date, mode)})
        </>
      ) : (
        <>
          {padDay(birthday.day)} - {birthday.name} (
          {getTurningAge(birthday.date, mode)}
          ) - from <GroupOrGroups birthday={birthday} />
        </>
      )}
    </Text>
  );
};

const GroupOrGroups = ({ birthday }: { birthday: BirthdayInfo }) => {
  if (birthday.dedupGroupNames) {
    return (
      <Text>
        {birthday.dedupGroupNames[0]}
        <Text
          style={{
            color: 'var(--tg-theme-subtitle-text-color)',
            fontSize: '0.9em',
          }}
        >
          {' '}
          (also {birthday.dedupGroupNames.slice(1).join(', ')})
        </Text>
      </Text>
    );
  } else {
    return birthday.groupName;
  }
};

// we're displaying the age people are going to turn
function getTurningAge(dateStr: string, mode: string) {
  var today = new Date();
  var birthDate = new Date(dateStr);

  if (birthDate.getMonth() < today.getMonth()) {
    today.setFullYear(today.getFullYear() + 1);
  }

  var age = today.getFullYear() - birthDate.getFullYear();

  if (
    mode === 'group' &&
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() > birthDate.getDate()
  ) {
    /*
       edge case caused by how we're showing data slightly differently:
        - in calendar mode, the current month is this calendar year. all ages are either ages people already turned or are going to be
        - in group mode, as soon as your birthday's gone, your name will go to the end of the list (ie "next years"). we need to add 1 to the age in that case to reflect that.
     */
    age++;
  }

  return age;
}

function formatDate(date: string, locale: string = 'en'): string {
  const dateJS = new Date(date);
  return dateJS.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
}

export default Birthdays;
