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
ENV PORT=8183
ENV HOSTNAME="0.0.0.0"

# Copy necessary files for standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8183

CMD ["node", "server.js"]
