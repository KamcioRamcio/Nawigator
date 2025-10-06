FROM node:23

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8888

#RUN npm install tailwindcss @tailwindcss/vite

CMD ["npm", "run", "dev"]
