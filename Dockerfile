# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install deps
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Build
FROM base AS build
COPY . .
RUN npm ci && npm run postinstall && npm run build

# Production image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Enable Next.js standlone output if configured; copy required files
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src/generated ./src/generated

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node node_modules/next/dist/bin/next start -p 3000"]