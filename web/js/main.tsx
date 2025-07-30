import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import TelegramAnalytics from '@telegram-apps/analytics';

TelegramAnalytics.init({
  token:
    'eyJhcHBfbmFtZSI6ImJpcnRoZGF5X2JvdCIsImFwcF91cmwiOiJodHRwczovL3QubWUvQmFsaUJpcnRoZGF5Qm90IiwiYXBwX2RvbWFpbiI6Imh0dHBzOi8vYmlydGhkYXktYm90LXByb2QuZmx5LmRldi93ZWIvIn0=!JqykEXmAgEeTU1RATdBDCbj9mW7hcsinKq1q6Io2q3A=',
  appName: 'birthday_bot',
});

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
