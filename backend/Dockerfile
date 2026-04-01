FROM node:20-alpine

WORKDIR /app

RUN npm cache clean --force

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

