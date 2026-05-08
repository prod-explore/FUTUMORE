FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application
COPY server.js ./
COPY FUTUMORE/ ./FUTUMORE/

EXPOSE 3000

USER node

CMD ["node", "server.js"]
