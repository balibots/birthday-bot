# Telegram Birthday Bot

This is a Telegram Bot that can be used in a Group as a reminder for everyone's birthdays.
It holds information about people's birth dates and will send a congratulory message on their birthday.

It's currently using:

 - Grammy, as a Telegram Bot framework
 - PostgreSQL as a DB, with Prisma ORM
 - Redis for KV store / caching
 - Fly.io as hosting platform
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

There's a bunch more commands nowadays, use the `/help` command to see what's available.

## Running

1. Clone and install dependencies

  ```
    npm i
  ```

1. Copy the `.env.sample` file to `.env` and fill in the necessary environment variables.

1. Run the Docker `compose.yml` file
```
  docker compose up -d
```

This will start PostgreSQL, an admin interface if you need it and Redis.

1. Run the dev script

  ```
    npm run dev
  ```

Locally, the bot uses long polling but it uses webhooks in prod (`NODE_ENV === 'production'`). There's a script to register your webhook too:

```
  npm run register -- --token <TELEGRAM_BOT_TOKEN> --webhook https://your.webook.endpoint.com/
```

## Deployment

There's GitHub Actions Workflows running for pull requests (deploys the `dev-rr` instance - this endpoint - https://birthday-bot-dev-rr.fly.dev - can then be registered to the dev bot, which can also be pointed locally by unregistering the webhook). 

Pushes to the `main` branch trigger deployment of the production bot.


## More on Usage

 - The bot can also be used in direct conversation mode. In that case, you'll need to supply the group id for each command, ie:

```
  /add John, 1999-09-22, -123456
  /list -123456
```
