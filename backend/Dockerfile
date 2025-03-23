FROM node:23

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3333

CMD ["node", "server.js"]
