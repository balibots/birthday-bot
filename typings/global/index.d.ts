declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
      CHAT_ID: string;
      NODE_ENV?: 'development' | 'production';
      PORT?: string;
    }
  }
}

export {};
