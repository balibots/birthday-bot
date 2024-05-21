import { Bot } from 'grammy';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const { token, webhook } = yargs(hideBin(process.argv))
  .options({
    token: {
      alias: 't',
      type: 'string',
      description: 'Your Telegram Bot token',
      demandOption: true,
    },
  })
  .parseSync();

if (!token) {
  console.error('ERROR: Missing bot token');
  process.exit(1);
}

console.log(` * Deleting webhook for the bot with token ${token}`);

(async () => {
  const bot = new Bot(token);
  await bot.api.deleteWebhook();
  console.log(' * Done!');
})();
