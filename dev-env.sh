#!/bin/bash

# Run 'source dev-env.sh' to load env vars during development

export NODE_ENV=development

export RABBIT_MQ_URL="amqp://guest:guest@localhost:5672"
export EMAIL_SERVER="localhost"
export EMAIL_PORT="1025"
export EMAIL_SECURE="false"
export EMAIL_USER="user@maildev.com"
export EMAIL_PASS="user"
export SCRAPER_NAVIGATION_TIMEOUT=10000
export SCRAPER_HEADLESS="false" # Set to false to show the browser window during the scraper operation

echo "Dev Environment Variables:"
echo "RABBIT_MQ_URL=$RABBIT_MQ_URL"
echo "EMAIL_SERVER=$EMAIL_SERVER"
echo "EMAIL_PORT=$EMAIL_PORT"
echo "EMAIL_SECURE=$EMAIL_SECURE"
echo "EMAIL_USER=$EMAIL_USER"
echo "EMAIL_PASS=$EMAIL_PASS"
echo "SCRAPER_NAVIGATION_TIMEOUT=$SCRAPER_NAVIGATION_TIMEOUT"
echo "SCRAPER_HEADLESS=$SCRAPER_HEADLESS"
