# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package.json and workspace configs
COPY package.json package-lock.json* ./

# Copy workspace packages
COPY backend/api ./backend/api
COPY frontend ./frontend

# Install dependencies and build
RUN npm ci --legacy-peer-deps
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy root package.json
COPY package.json package-lock.json* ./

# Copy workspace packages
COPY backend/api ./backend/api
COPY frontend ./frontend

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built assets from builder
COPY --from=builder /app/backend/api/dist ./backend/api/dist
COPY --from=builder /app/backend/api/node_modules ./backend/api/node_modules

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
