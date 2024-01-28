#!/bin/bash

# Run 'source dev-env.sh' to load env vars during development

export NODE_ENV=development

export RABBIT_MQ_URL="amqp://guest:guest@localhost:5672"
export EMAIL_SERVER="localhost"
export EMAIL_PORT="1025"
export EMAIL_SECURE="false"
export EMAIL_USER="user@maildev.com"
export EMAIL_PASS="user"
export SCRAPER_HEADLESS="false" # As false, this show the browser window during the dev env

echo "Dev Environment Variables:"
echo "RABBIT_MQ_URL=$RABBIT_MQ_URL"
echo "EMAIL_SERVER=$EMAIL_SERVER"
echo "EMAIL_PORT=$EMAIL_PORT"
echo "EMAIL_SECURE=$EMAIL_SECURE"
echo "EMAIL_USER=$EMAIL_USER"
echo "EMAIL_PASS=$EMAIL_PASS"
echo "SCRAPER_HEADLESS=$SCRAPER_HEADLESS"
