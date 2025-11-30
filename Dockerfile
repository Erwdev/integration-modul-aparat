# Build stage
FROM node:22-alpine AS builder

WORKDIR /app/backend/api

# Copy package files
COPY backend/api/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY backend/api/src ./src
COPY backend/api/tsconfig*.json ./
COPY backend/api/nest-cli.json ./

# Build the application
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy package.json for runtime
COPY backend/api/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/backend/api/dist ./dist

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "dist/main.js"]