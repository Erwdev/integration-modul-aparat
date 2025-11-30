# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy all source files
COPY . .

# Install all dependencies (including devDeps for build)
RUN npm install --legacy-peer-deps

# Build the application
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY backend/api/package.json ./backend/api/

# Copy built output from builder
COPY --from=builder /app/backend/api/dist ./backend/api/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/api/node_modules ./backend/api/node_modules

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "backend/api/dist/main.js"]
