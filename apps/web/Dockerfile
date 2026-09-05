# ---------- Build stage ----------
FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@11.25.0 --activate

WORKDIR /repo

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/utils/package.json packages/utils/
COPY apps/web/package.json apps/web/

# Install dependencies (frozen lockfile for reproducible builds)
RUN pnpm install --frozen-lockfile

# Copy source of shared package and web app
COPY packages/utils/ packages/utils/
COPY apps/web/ apps/web/

# Build the web app (also builds upstream workspace deps via turbo? no, direct)
RUN pnpm --filter web build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

# Serve built static assets
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html

# nginx config: serve SPA + proxy /api to backend service
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
