# ===============================
# Stage 1: Base - common deps
# ===============================
FROM node:20-alpine AS base

WORKDIR /app/api

# Set NPM config (especially useful for slower connections)
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY api/package*.json ./

# Install all deps (we'll prune later for prod)
RUN npm ci && npm cache clean --force


# ===============================
# Stage 2: Builder
# ===============================
FROM base AS builder

WORKDIR /app/api

# Copy source
COPY api/tsconfig*.json ./
COPY api/nest-cli.json ./
COPY api/src ./src

# Build app
RUN npm run build


# ===============================
# Stage 3: Development
# ===============================
FROM base AS development

WORKDIR /app/api

# Copy everything for live reload
COPY api/tsconfig*.json ./
COPY api/nest-cli.json ./
COPY api/src ./src

# Create directories for file uploads
RUN mkdir -p uploads/signatures uploads/bukti-terima

EXPOSE 3000

# Run NestJS in dev mode
CMD ["npm", "run", "start:dev"]


# # ===============================
# # Stage 4: Production
# # ===============================
# FROM node:20-alpine AS production

# WORKDIR /app/api

# # Create non-root user for security
# RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

# # Copy only necessary files
# COPY api/package*.json ./

# # Install only production dependencies
# RUN npm ci --omit=dev && npm cache clean --force

# # Copy compiled code from builder
# COPY --from=builder /app/api/dist ./dist

# # Prepare upload + log dirs with proper permissions
# RUN mkdir -p uploads/signatures uploads/bukti-terima logs \
#  && chown -R nestjs:nodejs uploads logs \
#  && chmod -R 755 uploads logs

# # Switch to non-root user
# USER nestjs

# EXPOSE 3000

# # Healthcheck
# HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

# CMD ["node", "dist/main.js"]
 