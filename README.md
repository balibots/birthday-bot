# Telegram Birthday Bot

This is a Telegram Bot that can be used in a Group as a reminder for everyone's birthdays.
It holds information about people's birth dates and will send a congratulory message on their birthday.

It's currently using:

 - Grammy, as a Telegram Bot framework
 - Cyclic.sh, for deployment, including data persistence on DynamoDB
 - Jest, as a test runner

## Usage

After adding the bot to your Telegram group, birthdays can be added by group admins by calling /add:

```
  /add John, 1999-09-22
```

There's a `/birthdays` command that show's everyones birth dates, ordered by the nearest one, and a `/list` command to show everyone's ages (use with caution).

Users can be removed with the `/remove` command:

```
  /remove John
```

## Running

1. Clone and install dependencies

  ```
    npm i
  ```

1. Copy the `.env.sample` file to `.env` and fill in the necessary environment variables.

1. Run start

  ```
    npm start
  ```

Locally, the bot uses long polling but it uses webhooks in prod (`NODE_ENV === 'production'`). There's a script to register your webhook too:

```
  npm run register -- --token <TELEGRAM_BOT_TOKEN> --webhook https://your.webook.endpoint.com/
```

## More on Usage

 - The bot can also be used in direct conversation mode. In that case, you'll need to supply the group id for each command, ie:

```
  /add John, 1999-09-22, -123456
  /list -123456
```
