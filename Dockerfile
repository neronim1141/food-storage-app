ARG NODE_VERSION=18.18.0

# Alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo on the alpine base
FROM alpine as base
RUN npm install pnpm turbo --global
RUN pnpm config set store-dir ~/.pnpm-store

# Prune projects
FROM base AS pruner-backend
WORKDIR /app
COPY . .
RUN turbo prune --scope=@app/api --docker
# Prune projects
FROM base AS pruner-frontend
WORKDIR /app
COPY . .
RUN turbo prune --scope=@app/client --docker


# Build the project
FROM base AS builder-backend
WORKDIR /app
# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner-backend /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner-backend /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner-backend /app/out/json/ .
# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile
# Copy source code of isolated subworkspace
COPY --from=pruner-backend /app/out/full/ .
RUN turbo build --filter=@app/api
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src

FROM base AS builder-frontend
WORKDIR /app
# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner-frontend /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner-frontend /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner-frontend /app/out/json/ .
# First install the dependencies (as they change less often)
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile
# Copy source code of isolated subworkspace
COPY --from=pruner-frontend /app/out/full/ .
RUN turbo build --filter=@app/client
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN rm -rf ./**/*/src

# Final image
FROM alpine AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
WORKDIR /app
COPY --from=builder-backend --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder-backend --chown=nodejs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder-backend --chown=nodejs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder-backend --chown=nodejs:nodejs /app/apps/api/public ./apps/api/public
COPY --from=builder-frontend /app/apps/client/dist /app/apps/api/public
WORKDIR /app/apps/api
ENV NODE_ENV=production
CMD node dist/index.js