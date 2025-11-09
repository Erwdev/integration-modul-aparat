# Stage 1: Base - Install dependencies
FROM node:20-alpine AS base

WORKDIR /app/api

# Set NPM config for network issues in Indonesia
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY api/package*.json ./

# Install ALL dependencies (including dev for builder stage)
RUN npm ci && npm cache clean --force

# Stage 2: Builder - Build application
FROM base AS builder

WORKDIR /app/api

# Copy source code
COPY api/tsconfig*.json ./
COPY api/nest-cli.json ./
COPY api/src ./src

# Build application
RUN npm run build

# Stage 3: Development
FROM base AS development

WORKDIR /app/api

# Copy source for hot reload
COPY api/src ./src
COPY api/tsconfig*.json ./
COPY api/nest-cli.json ./

# Create upload directories
RUN mkdir -p uploads/signatures uploads/bukti-terima

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# Stage 4: Production
FROM node:20-alpine AS production

WORKDIR /app/api

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY api/package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/api/dist ./dist

# Create upload directories with proper permissions
RUN mkdir -p uploads/signatures uploads/bukti-terima logs && \
    chown -R nestjs:nodejs uploads logs && \
    chmod -R 755 uploads logs

# Switch to non-root user
USER nestjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/main.js"]