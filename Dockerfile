FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY server.js ./

RUN apk add --no-cache curl

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]