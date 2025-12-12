# amdWiki Docker Image
# JSPWiki-style wiki with advanced search capabilities

# Build arguments
ARG NODE_VERSION=20

# Use Node.js LTS (Long Term Support) version
FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /app

# Install production dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
# Install all dependencies (some devDependencies are needed at runtime)
RUN npm install --prefer-offline

# Copy application files
COPY . .

# Create necessary directories with proper permissions
# All instance-specific data is consolidated under /app/data for single volume mount
# Directory structure:
#   data/
#   ├── pages/        - Wiki content (amdwiki.page.provider.filesystem.storagedir)
#   ├── users/        - User accounts (amdwiki.user.provider.storagedir)
#   ├── attachments/  - File attachments (amdwiki.attachment.provider.basic.storagedir)
#   ├── logs/         - Application logs (amdwiki.logging.dir)
#   ├── search-index/ - Search index (amdwiki.search.provider.lunr.indexdir)
#   ├── backups/      - Backup files (amdwiki.backup.directory)
#   └── sessions/     - Session files
RUN mkdir -p \
    data/pages \
    data/users \
    data/attachments \
    data/versions \
    data/logs \
    data/search-index \
    data/backups \
    data/sessions \
    required-pages \
    resources \
    templates \
    config && \
    chmod -R 755 /app && \
    chmod -R 777 /app/data

# Note: chmod 777 on /app/data allows any user to write (needed for docker-compose user override)
# This is safe in Docker since the container is isolated
# The user is set via docker-compose.yml using UID/GID env vars

# Expose port (configurable via amdwiki.server.port in ConfigurationManager)
# Default: 3000, can be overridden with environment-specific config
EXPOSE 3000

# Environment variable for NODE_ENV
# ConfigurationManager uses this to load environment-specific config:
# - development: loads app-development-config.json
# - production: loads app-production-config.json
# - test: loads app-test-config.json
ENV NODE_ENV=production

# Health check
# Checks if the application is responding on the configured port
# Accepts both 200 (OK) and 302 (Redirect) as healthy responses
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => process.exit((r.statusCode === 200 || r.statusCode === 302) ? 0 : 1))"

# Volume mounts for persistent data
# All instance data is consolidated under /app/data (single volume mount)
# Config properties now point to subdirectories within data/:
# - amdwiki.page.provider.filesystem.storagedir: ./data/pages
# - amdwiki.user.provider.storagedir: ./data/users
# - amdwiki.attachment.provider.basic.storagedir: ./data/attachments
# - amdwiki.logging.dir: ./data/logs
# - amdwiki.search.provider.lunr.indexdir: ./data/search-index
# - amdwiki.backup.directory: ./data/backups
# Required-pages contains system templates (read-only, copied to data/pages on install)
VOLUME ["/app/data", "/app/required-pages", "/app/config"]

# Start command
# Uses npm start which runs: NODE_ENV=production node app.js
CMD ["npm", "start"]

# --- Configuration Override Instructions ---
#
# The ConfigurationManager loads configuration in this order (later overrides earlier):
# 1. config/app-default-config.json (base defaults - always loaded)
# 2. config/app-{NODE_ENV}-config.json (environment-specific - optional)
# 3. config/app-custom-config.json (local overrides - optional)
#
# To customize configuration for Docker:
#
# Option 1: Use environment-specific config
#   Create config/app-production-config.json with your overrides
#   Build: docker build -t amdwiki .
#   Run: docker run -p 3000:3000 amdwiki
#
# Option 2: Mount custom config at runtime
#   Create app-custom-config.json locally
#   Run: docker run -p 3000:3000 -v $(pwd)/app-custom-config.json:/app/config/app-custom-config.json amdwiki
#
# Option 3: Use environment variable to change NODE_ENV
#   Run: docker run -p 3000:3000 -e NODE_ENV=development amdwiki
#
# Common ConfigurationManager properties to override:
# - amdwiki.server.port: Server port (default: 3000)
# - amdwiki.server.host: Server host (default: localhost, use 0.0.0.0 for Docker)
# - amdwiki.baseURL: Base URL for the wiki
# - amdwiki.applicationName: Application name
# - amdwiki.session.secret: Session secret (MUST change in production!)
# - amdwiki.session.secure: Use secure cookies (set to true with HTTPS)
#
# Example production config (config/app-production-config.json):
# {
#   "amdwiki.server.host": "0.0.0.0",
#   "amdwiki.server.port": 3000,
#   "amdwiki.baseURL": "https://your-domain.com",
#   "amdwiki.session.secret": "your-secure-random-secret",
#   "amdwiki.session.secure": true
# }
