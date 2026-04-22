# Stage 1 — builder
FROM node:20-alpine AS builder
WORKDIR /minu-app
COPY package*.json ./
RUN npm install

COPY . . 

# Stage 2 — final (ainult vajalik)
FROM node:20-alpine AS final
WORKDIR /minu-app
COPY --from=builder /minu-app/package*.json ./
COPY --from=builder /minu-app/node_modules ./node_modules
COPY --from=builder /minu-app/server.js ./

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["node", "server.js"]