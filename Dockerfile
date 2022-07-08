FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

RUN npm run compile

COPY ./dist ./

CMD ["node", "index"]