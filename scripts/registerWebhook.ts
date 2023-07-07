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
    webhook: {
      alias: 'w',
      type: 'string',
      description: 'The full URL for your webhook server',
      demandOption: true,
    },
  })
  .parseSync();

if (!token || !webhook) {
  console.log();
  process.exit(1);
}

console.log(` * Registering bot token ${token} with webhook at ${webhook}`);

(async () => {
  const bot = new Bot(token);
  await bot.api.setWebhook(webhook);
  console.log(' * Done!');
})();
