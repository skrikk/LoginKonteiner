FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY server.js ./

RUN apk add --no-cache curl

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD curl -f http://localhost:4000/health || exit 1

CMD ["npm", "start"]