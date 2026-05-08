FROM node:20-alpine

LABEL maintainer="FUTUMORE <futumore.solutions@gmail.com>"
LABEL description="FUTUMORE — Hardened production server"

WORKDIR /app

# Install dependencies first (layer caching)
# --ignore-scripts prevents malicious postinstall scripts
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy application
COPY server.js ./
COPY FUTUMORE/ ./FUTUMORE/

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

USER node

CMD ["node", "server.js"]
