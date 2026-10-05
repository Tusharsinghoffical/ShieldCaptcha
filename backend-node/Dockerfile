# =====================================================================
# ShieldCaptcha Enterprise Core Defense Engine (Node.js)
# Production Container Image
# =====================================================================

FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for healthcheck & dumb-init for PID 1 signal forwarding
RUN apk add --no-cache curl dumb-init

# Set environment
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Copy application assets
COPY package.json ./
COPY server.js ./
COPY public ./public

# Ensure non-root execution
USER node

EXPOSE 3000

# Periodic health check against core engine
HEALTHCHECK --interval=15s --timeout=4s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
