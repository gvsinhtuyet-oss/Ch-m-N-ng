FROM node:22-slim AS build

WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run lint && npm run build

FROM node:22-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY --from=build /app/dist ./dist
COPY content-server.mjs auth-server.mjs content-storage.mjs gddp-catalog.mjs gddp-ai.mjs deployment-config.mjs ./

COPY --from=build /app/content-data/gddp-2026-2027.json ./content-data/gddp-2026-2027.json

RUN mkdir -p /app/content-data

EXPOSE 8080

CMD ["npm", "start"]
