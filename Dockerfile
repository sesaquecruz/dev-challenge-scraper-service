FROM node:20.11.0-slim as builder
USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node  . .
RUN npm install
RUN npm run build

FROM node:20.11.0-slim
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node --from=builder /home/node/app/dist ./dist
COPY --chown=node:node --from=builder /home/node/app/package-lock.json ./
COPY --chown=node:node --from=builder /home/node/app/package.json ./
RUN npm ci --only=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV NODE_ENV production
CMD [ "npm", "run", "start" ]
