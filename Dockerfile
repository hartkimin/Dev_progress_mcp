# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# SQLite requires python/build tools in some Alpine combinations or prebuilds.
# Node 18 alpine generally works with sqlite3 prebuilds but we will add python3 and make just in case
RUN apk add --no-cache python3 make g++ 

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist

# Create a directory for the database
RUN mkdir -p /app/data

# Ensure output is not buffered
ENV FORCE_COLOR=1
ENV NODE_OPTIONS="--no-warnings"
ENV DB_PATH=/app/data/database.sqlite

# Run the server
CMD ["node", "dist/index.js"]
