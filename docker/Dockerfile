# amdWiki Docker Image - Multi-Stage Build
# JSPWiki-style wiki with advanced search capabilities
#
# Multi-stage build:
#   Stage 1 (builder): Install all deps, build TypeScript, compile native modules
#   Stage 2 (runtime): Production-only dependencies, optimized for size
#
# Expected image size: ~400-500MB (down from ~2.2GB single-stage)

# Build arguments
ARG NODE_VERSION=20

# =============================================================================
# Stage 1: Builder
# =============================================================================
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files first (for layer caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Prune devDependencies for production
RUN npm prune --omit=dev

# =============================================================================
# Stage 2: Runtime
# =============================================================================
FROM node:${NODE_VERSION}-alpine AS runtime

# Labels for container metadata
LABEL org.opencontainers.image.title="amdWiki"
LABEL org.opencontainers.image.description="JSPWiki-style wiki with advanced search capabilities"
LABEL org.opencontainers.image.source="https://github.com/jwilleke/amdWiki"

WORKDIR /app

# Install runtime dependencies only (for bcrypt native bindings)
# Note: g++ is needed at runtime for node-gyp if bcrypt needs recompilation
RUN apk add --no-cache libstdc++

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled JavaScript
COPY --from=builder /app/dist ./dist

# Copy application entry point and essential files
COPY --from=builder /app/app.js ./
COPY --from=builder /app/package.json ./

# Copy views (EJS templates)
COPY --from=builder /app/views ./views

# Copy public assets
COPY --from=builder /app/public ./public

# Copy required-pages (system templates)
COPY --from=builder /app/required-pages ./required-pages

# Copy resources (if exists)
COPY --from=builder /app/resources ./resources

# Copy default configuration
COPY --from=builder /app/config/app-default-config.json ./config/
COPY --from=builder /app/config/app-custom-config.example ./config/

# Create data directories with proper permissions
# All instance-specific data is consolidated under /app/data
# Directory structure:
#   data/
#   ├── pages/        - Wiki content
#   ├── users/        - User accounts
#   ├── attachments/  - File attachments
#   ├── logs/         - Application logs
#   ├── search-index/ - Search index
#   ├── backups/      - Backup files
#   ├── config/       - Instance configuration
#   └── sessions/     - Session files
RUN mkdir -p \
    data/pages \
    data/users \
    data/attachments \
    data/versions \
    data/logs \
    data/search-index \
    data/backups \
    data/config \
    data/sessions && \
    chmod -R 755 /app && \
    chmod -R 777 /app/data

# Note: chmod 777 on /app/data allows any user to write (needed for docker-compose user override)
# This is safe in Docker since the container is isolated

# Expose port (configurable via amdwiki.server.port)
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV INSTANCE_DATA_FOLDER=/app/data

# Health check
# Accepts both 200 (OK) and 302 (Redirect) as healthy responses
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => process.exit((r.statusCode === 200 || r.statusCode === 302) ? 0 : 1))"

# Volume mounts for persistent data
VOLUME ["/app/data"]

# Start command - direct node execution (no PM2)
# PM2 is removed for K8s compatibility - K8s handles process management
CMD ["node", "app.js"]

# =============================================================================
# Configuration Override Instructions
# =============================================================================
#
# ConfigurationManager loads configuration in this order:
# 1. config/app-default-config.json (base defaults - in image)
# 2. INSTANCE_DATA_FOLDER/config/app-{NODE_ENV}-config.json (environment-specific)
# 3. INSTANCE_DATA_FOLDER/config/app-custom-config.json (local overrides)
#
# To customize configuration for Docker:
#
# Option 1: Mount custom config at runtime
#   docker run -p 3000:3000 \
#     -v my-config.json:/app/data/config/app-custom-config.json \
#     amdwiki
#
# Option 2: Use environment variable to change NODE_ENV
#   docker run -p 3000:3000 -e NODE_ENV=development amdwiki
#
# Common properties to override:
# - amdwiki.server.port: Server port (default: 3000)
# - amdwiki.server.host: Server host (default: 0.0.0.0 for Docker)
# - amdwiki.baseURL: Base URL for the wiki
# - amdwiki.session.secret: Session secret (MUST change in production!)
