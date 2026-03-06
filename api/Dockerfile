FROM node:22-alpine AS builder

WORKDIR /app

# Install openssl and other necessary libs for Prisma
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

# Copy built assets
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

# Start the NestJS application
CMD ["npm", "run", "start:prod"]
