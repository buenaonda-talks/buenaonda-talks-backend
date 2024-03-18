# Build Stage
FROM node:18-alpine3.18 AS builder
WORKDIR /app

# Set Yarn cache folder and create a volume for it
ENV YARN_CACHE_FOLDER=/usr/local/yarn-cache
VOLUME /usr/local/yarn-cache

# Ensure yarn is at its latest version
RUN yarn global add yarn@1.22.21

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
EXPOSE 3000

# Command to run the app
CMD ["node", "dist/src/index.js"]
