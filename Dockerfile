# Build Stage
FROM node:18-alpine3.18 AS builder
WORKDIR /app

# Ensure yarn is at its latest version
RUN yarn global add yarn

# Copy package.json, yarn.lock, and other necessary files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy necessary files for the build
COPY . .

# Perform the build
RUN yarn build

# Production Stage
FROM node:18-alpine3.18
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copying built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Copying dependencies
COPY --from=builder /app/node_modules ./node_modules

# Security: Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Graceful Shutdown
STOPSIGNAL SIGTERM

# Exposing port (adjust if different)
EXPOSE 8787

# Command to run the app
CMD ["node", "dist/src/index.js"]
