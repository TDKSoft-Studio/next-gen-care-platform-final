# syntax=docker/dockerfile:1.7
FROM node:24.20.0-bookworm-slim AS dependencies
WORKDIR /workspace
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/localization/package.json packages/localization/package.json
COPY packages/observability/package.json packages/observability/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
RUN pnpm build

FROM node:24.20.0-bookworm-slim AS runtime
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
# The runtime only ever execs `node apps/web/server.js`. npm/npx/corepack (and their own
# bundled dependency tree, independent of this workspace's pnpm-lock.yaml) are never invoked
# here, so drop them: it removes upstream npm-bundled CVEs from the final image instead of
# waiting on the base image to republish with patched bundled versions.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /usr/local/bin/pnpm* /usr/local/bin/yarn*
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
