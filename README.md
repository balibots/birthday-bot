# Telegram Bot, built on Cyclic 🤖

This is a telegram bot that sends a message on people's birthdays.
It's deployed to Cyclic (https://www.cyclic.sh/)

It uses the following key packages:

- Grammy
- Sqlite3

## Deployment

To deploy just push to the main branch and then activate the webhook. You need to do this after testing locally.

### Activating the webhook

```bash
export TELEGRAM_API_TOKEN=... # YOUR TELEGRAM API TOKEN
export TELEGRAM_WEBHOOK_URL=... # YOUR CYCLIC DEPLOYMENT URL

curl "https://api.telegram.org/bot$TELEGRAM_API_TOKEN/setWebhook?url=$TELEGRAM_WEBHOOK_URL"
```
