import React from 'react';
import { GroupBirthdayInfo, BirthdayInfo } from '../types';
import { List, Section, Subheadline, Text } from '@telegram-apps/telegram-ui';

const Birthdays = ({ data }: { data: GroupBirthdayInfo[] }) => {
  return data.map((group, i) => <Group key={`group-${i}`} group={group} />);
};

const Group = ({ group }: { group: GroupBirthdayInfo }) => {
  return (
    <Section style={{ margin: '2em 0' }}>
      <Subheadline level="1" weight="2">
        🎂 {group.groupName} ({group.groupId})
      </Subheadline>
      <List>
        {group.birthdays.map((b, i) => (
          <Birthday key={i} birthday={b} />
        ))}
      </List>
    </Section>
  );
};

const Birthday = ({ birthday }: { birthday: BirthdayInfo }) => {
  return <Text Component="li">{birthday.formattedLine}</Text>;
};

export default Birthdays;
