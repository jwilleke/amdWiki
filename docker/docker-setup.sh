#!/bin/bash
#
# amdWiki Docker Setup Helper Script
# Automates the setup process for Docker deployment
#
# Usage: Run from project root or docker directory
#   From root: ./docker/docker-setup.sh
#   From docker: cd docker && ./docker-setup.sh
#

set -e  # Exit on error

# Detect if we're in docker directory or project root
if [ -f "docker-setup.sh" ]; then
    # We're in the docker directory, move to parent
    cd ..
fi

echo "🚀 amdWiki Docker Setup"
echo "======================="
echo ""
echo "📍 Working directory: $(pwd)"
echo ""

# 1. Create required directories
echo "📁 Creating required directories..."
mkdir -p pages data logs sessions
echo "   ✅ Created: pages, data, logs, sessions"
echo ""

# 2. Create .env file with current user's UID/GID
if [ -f docker/.env ]; then
    echo "⚠️  docker/.env file already exists"
    read -p "   Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Keeping existing .env file"
        echo ""
    else
        rm docker/.env
        echo "   Removed existing .env file"
        echo ""
    fi
fi

if [ ! -f docker/.env ]; then
    echo "⚙️  Creating docker/.env file with your user permissions..."
    cp docker/.env.example docker/.env

    # Get current user's UID and GID
    CURRENT_UID=$(id -u)
    CURRENT_GID=$(id -g)

    # Update docker/.env file with current user's UID/GID
    # Note: Using different approach for cross-platform compatibility
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^UID=.*/UID=$CURRENT_UID/" docker/.env
        sed -i '' "s/^GID=.*/GID=$CURRENT_GID/" docker/.env
    else
        # Linux
        sed -i "s/^UID=.*/UID=$CURRENT_UID/" docker/.env
        sed -i "s/^GID=.*/GID=$CURRENT_GID/" docker/.env
    fi

    echo "   ✅ Created docker/.env with UID=$CURRENT_UID, GID=$CURRENT_GID"
    echo ""
fi

# 3. Optional: Create production config
if [ ! -f config/app-production-config.json ]; then
    echo "📋 Production configuration"
    read -p "   Create production config from example? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f config/app-production-config.example.json ]; then
            cp config/app-production-config.example.json config/app-production-config.json
            echo "   ✅ Created config/app-production-config.json"
            echo "   ⚠️  Remember to edit it with your settings (session secret, baseURL, etc.)"
        else
            echo "   ⚠️  Example file not found"
        fi
    fi
    echo ""
fi

# 4. Check Docker and Docker Compose
echo "🔍 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "   ❌ Docker is not installed"
    echo "   Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "   ⚠️  Docker Compose is not installed"
    echo "   Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "   ✅ Docker is installed"
echo ""

# 5. Summary and next steps
echo "✅ Setup complete!"
echo ""
echo "📝 Configuration summary:"
echo "   - Directories: pages, data, logs, sessions"
echo "   - User permissions: UID=$(grep '^UID=' docker/.env | cut -d= -f2), GID=$(grep '^GID=' docker/.env | cut -d= -f2)"
echo "   - Host port: $(grep '^HOST_PORT=' docker/.env | cut -d= -f2)"
echo "   - Environment: $(grep '^NODE_ENV=' docker/.env | cut -d= -f2)"
echo ""
echo "🚀 Next steps:"
echo "   1. (Optional) Edit docker/.env to change port or other settings"
echo "   2. (Optional) Edit config/app-production-config.json with your settings"
echo "   3. Start amdWiki: cd docker && docker-compose up -d"
echo "   4. View logs: cd docker && docker-compose logs -f"
echo "   5. Access wiki: http://localhost:$(grep '^HOST_PORT=' docker/.env | cut -d= -f2)"
echo ""
echo "📚 For more information, see docker/DOCKER.md"
