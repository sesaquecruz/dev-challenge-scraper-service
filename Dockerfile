FROM node:20.10.0-alpine as builder
USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node  . .
RUN npm install
RUN npm run build

FROM node:20.10.0-alpine
USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node --from=builder /home/node/app/dist ./dist
COPY --chown=node:node --from=builder /home/node/app/package-lock.json ./
COPY --chown=node:node --from=builder /home/node/app/package.json ./
RUN npm ci --only=production
ENV NODE_ENV production
CMD [ "npm", "run", "start" ]
