import yargs from 'yargs';
import { getFunctionCall } from '../src/openai';
import { hideBin } from 'yargs/helpers';

const args = yargs(hideBin(process.argv)).parseSync();

const message = args._.join(' ');

if (!message) {
  console.error('No message supplied, use `npm run test:gpt -- message`');
  process.exit(1);
}

try {
  (async function run() {
    const response = await getFunctionCall(message);

    console.log(response);
  })();
} catch (e) {
  console.error(e);
}
