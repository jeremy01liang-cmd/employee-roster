FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
RUN mkdir -p /app/data

ENV PORT=3001
EXPOSE 3001

CMD ["npm", "run", "start"]
