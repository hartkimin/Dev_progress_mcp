# Build stage
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

# Standard node image has necessary tools, no apk needed

# Ensure data directory exists for volume mount
RUN mkdir -p /app/data
ENV DB_PATH=/app/data/database.sqlite

# Copy necessary files for standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3002

CMD ["node", "server.js"]
