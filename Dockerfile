FROM ghcr.io/nodejs/node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["node", "index.js"]



