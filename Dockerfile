FROM node:18

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm i -g prisma

RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

CMD [  "npm", "run", "start:migrate:prod" ]