# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist

# Ensure output is not buffered
ENV FORCE_COLOR=1
ENV NODE_OPTIONS="--no-warnings"

# Run the server
CMD ["node", "dist/index.js"]
