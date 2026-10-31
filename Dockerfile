FROM node:22-slim AS build

WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run lint && npm run build && node scripts/package-production.mjs

FROM node:22-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Only the measured runtime package crosses into the final image.
COPY --from=build /app/.production-build ./

EXPOSE 8080
CMD ["node", "content-server.mjs"]
