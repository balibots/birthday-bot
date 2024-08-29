import React, { useState } from 'react';
import { IconCalendarPlus } from '@tabler/icons-react';
import { ModalHeader } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader';
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose';
import { Icon28Close } from '@telegram-apps/telegram-ui/dist/icons/28/close';

import {
  Text,
  IconButton,
  Modal,
  Section,
  Button,
} from '@telegram-apps/telegram-ui';

const CalendarModal = ({ icsUrl }: { icsUrl: string }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const fullUrl = `${window.BOT_BASE_API}${icsUrl}`;

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
  };
  return (
    <Modal
      header={
        <ModalHeader
          after={
            <ModalClose>
              <Icon28Close style={{ color: 'var(--tgui--plain_foreground)' }} />
            </ModalClose>
          }
        >
          Birthday Calendar Subscription
        </ModalHeader>
      }
      trigger={
        <IconButton mode="bezeled" size="m">
          <IconCalendarPlus />
        </IconButton>
      }
    >
      <Section style={{ padding: '1em 1em 2.5em', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5em',
          }}
        >
          <Text Component="p">
            Here's the URL of your .ics file - use it to subscribe to your
            birthday calendar on your Calendar app of choice (iCalendar, Google
            Calendar, etc)
          </Text>
          <Text
            Component="p"
            style={{
              color: 'red',
              fontFamily: 'monospace',
              wordWrap: 'break-word',
              padding: '1em',
              background: 'var(--tg-theme-secondary-bg-color)',
            }}
          >
            {fullUrl}
          </Text>
          <Button mode="plain" size="s" onClick={() => copyUrlToClipboard()}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </Section>
    </Modal>
  );
};
export default CalendarModal;
