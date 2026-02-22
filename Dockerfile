# Stage 1: Base
FROM node:20-alpine AS base
RUN apk add --no-cache openssl && corepack enable pnpm

# Stage 2: Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile

# Stage 3: Build
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY . .

# Build shared types
RUN pnpm run build --filter=@agent-analytics/types

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build API
RUN pnpm run build --filter=@agent-analytics/api

# Stage 4: Production
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

# Copy shared types (runtime dependency)
COPY --from=build /app/packages/types/dist ./packages/types/dist
COPY --from=build /app/packages/types/package.json ./packages/types/

# Copy root node_modules (hoisted deps)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

CMD ["node", "apps/api/dist/main.js"]
