FROM node:18-alpine

# Set working directory untuk api
WORKDIR /app/api

# Copy package.json files
COPY api/package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY api/ .

# Build NestJS app
RUN npm run build

EXPOSE 3000

# Run production build
CMD ["npm", "run", "start:prod"]