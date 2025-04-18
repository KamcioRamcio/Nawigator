FROM node:23

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN touch db.sqlite3 && chmod 666 db.sqlite3

EXPOSE 3333

CMD ["node", "server.js"]
