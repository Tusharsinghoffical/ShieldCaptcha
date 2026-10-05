# =====================================================================
# ShieldCaptcha Enterprise Developer Portal (Next.js 16 + TypeScript)
# Multi-Stage Standalone Production Dockerfile
# =====================================================================

# Stage 1: Dependencies Cache
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Production Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment arguments (can be overridden via docker build --build-arg)
ARG CAPTCHA_BACKEND_URL=http://backend:3000
ARG NEXT_PUBLIC_SITE_KEY=pub_shield_live_production
ENV CAPTCHA_BACKEND_URL=${CAPTCHA_BACKEND_URL} \
    NEXT_PUBLIC_SITE_KEY=${NEXT_PUBLIC_SITE_KEY} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build

# Stage 3: Minimal Standalone Runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl dumb-init

ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1

# Create non-root system user & group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and compiled standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:3001/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
