import { Text, Section } from '@telegram-apps/telegram-ui';
import React from 'react';

const EmptyState = () => (
  <Section
    style={{
      margin: '1em auto',
      color: 'var(--tg-theme-section-header-text-color)',
      textAlign: 'center',
    }}
  >
    <div style={{ padding: '1em' }}>
      <Text Component="p" style={{ marginBottom: '1em' }}>
        You haven't created any birthdays yet, so there won't be much to see
        here!
      </Text>

      <Text Component="p" style={{ marginBottom: '1em' }}>
        To kick things off, add{' '}
        <a
          href="https://t.me/BaliBirthdayBot"
          style={{
            color: 'var(--tg-theme-accent-text-color)',
            textDecoration: 'none',
          }}
        >
          @BaliBirthdayBot
        </a>{' '}
        to a group chat and start adding birthdays by using the{' '}
        <span style={{ color: 'red', fontFamily: 'monospace' }}>/add</span>{' '}
        command.
      </Text>
    </div>
  </Section>
);
export default EmptyState;
