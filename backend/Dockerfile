FROM node:20-alpine

WORKDIR /app/api

# Copy package files first for better caching
COPY api/package*.json ./

# Clean install dependencies
RUN npm ci

# Copy rest of the application
COPY api/ .

# Build the application
RUN npm run build

EXPOSE 3000

# Use production start command
CMD ["npm", "run", "start:prod"]