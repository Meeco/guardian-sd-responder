FROM node:18

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

RUN yarn install --frozen-lockfile
COPY src ./src

CMD ["yarn", "start"]