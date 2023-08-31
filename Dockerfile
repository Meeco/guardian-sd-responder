FROM node:18

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY config.json ./

RUN yarn install --frozen-lockfile
COPY src ./src
ENV CONFIG_PATH=/usr/src/app/config.json

CMD ["yarn", "start"]