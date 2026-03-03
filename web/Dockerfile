# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Install dependencies required by SQLite3 in alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# The Next.js app uses SQLite, so ensure data directory exists for volume mount
RUN mkdir -p /app/data
ENV DB_PATH=/app/data/database.sqlite

EXPOSE 3002

CMD ["npm", "run", "start", "--", "-p", "3002"]
