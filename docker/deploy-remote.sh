#!/bin/bash
#
# amdWiki Remote Deployment Script
# Deploys amdWiki to a remote Linux server via SSH
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REMOTE_USER="${REMOTE_USER:-}"
REMOTE_HOST="${REMOTE_HOST:-}"
REMOTE_PORT="${REMOTE_PORT:-22}"
REMOTE_PATH="${REMOTE_PATH:-~/amdwiki}"
DEPLOY_METHOD="${DEPLOY_METHOD:-rsync}"  # rsync or git

echo -e "${BLUE}🚀 amdWiki Remote Deployment${NC}"
echo "=============================="
echo ""

# Function to print colored messages
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if required commands exist
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is not installed"
        return 1
    fi
    return 0
}

# Get remote server details if not set
if [ -z "$REMOTE_HOST" ]; then
    echo "Enter remote server details:"
    read -p "Remote host (IP or domain): " REMOTE_HOST
fi

if [ -z "$REMOTE_USER" ]; then
    read -p "Remote user: " REMOTE_USER
fi

if [ -z "$REMOTE_PATH" ]; then
    read -p "Remote path (default: ~/amdwiki): " input_path
    REMOTE_PATH="${input_path:-~/amdwiki}"
fi

echo ""
print_info "Deployment configuration:"
echo "   Remote: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PORT}"
echo "   Path: ${REMOTE_PATH}"
echo ""

# Ask for confirmation
read -p "Proceed with deployment? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled"
    exit 0
fi

# Test SSH connection
print_info "Testing SSH connection..."
if ! ssh -p "$REMOTE_PORT" -o ConnectTimeout=10 "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH connection successful'" &> /dev/null; then
    print_error "Cannot connect to ${REMOTE_USER}@${REMOTE_HOST}"
    echo "   Please check:"
    echo "   - Host is reachable"
    echo "   - SSH credentials are correct"
    echo "   - SSH key is configured (if using key auth)"
    exit 1
fi
print_success "SSH connection successful"
echo ""

# Check if Docker is installed on remote
print_info "Checking Docker on remote server..."
if ! ssh -p "$REMOTE_PORT" "${REMOTE_USER}@${REMOTE_HOST}" "command -v docker &> /dev/null"; then
    print_error "Docker is not installed on remote server"
    exit 1
fi

if ! ssh -p "$REMOTE_PORT" "${REMOTE_USER}@${REMOTE_HOST}" "docker compose version &> /dev/null || command -v docker-compose &> /dev/null"; then
    print_error "Docker Compose is not installed on remote server"
    exit 1
fi
print_success "Docker and Docker Compose are installed"
echo ""

# Deploy method selection
if [ "$DEPLOY_METHOD" = "rsync" ]; then
    # Deploy via rsync
    print_info "Deploying files via rsync..."

    if ! check_command rsync; then
        print_error "rsync is required for this deployment method"
        exit 1
    fi

    # Create remote directory
    ssh -p "$REMOTE_PORT" "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}"

    # Sync files (excluding development files)
    rsync -avz --progress \
        -e "ssh -p ${REMOTE_PORT}" \
        --exclude '.git' \
        --exclude 'node_modules' \
        --exclude 'logs' \
        --exclude '*.log' \
        --exclude '.amdwiki.pid' \
        --exclude 'coverage' \
        --exclude 'jsdocs' \
        --exclude '.DS_Store' \
        --exclude '.vscode' \
        --exclude '.env' \
        --exclude 'pages/*' \
        --exclude 'data/*' \
        --exclude 'sessions/*' \
        ./ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"

    print_success "Files synced to remote server"
    echo ""

elif [ "$DEPLOY_METHOD" = "git" ]; then
    # Deploy via git
    print_info "Deploying via git..."

    # Check if we're in a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not a git repository"
        exit 1
    fi

    # Get current branch and remote
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

    if [ -z "$REMOTE_URL" ]; then
        print_error "No git remote configured"
        exit 1
    fi

    print_info "Using git repository: $REMOTE_URL"
    print_info "Branch: $CURRENT_BRANCH"

    # Deploy commands
    ssh -p "$REMOTE_PORT" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        set -e
        if [ -d "${REMOTE_PATH}/.git" ]; then
            echo "Updating existing repository..."
            cd ${REMOTE_PATH}
            git fetch origin
            git checkout ${CURRENT_BRANCH}
            git pull origin ${CURRENT_BRANCH}
        else
            echo "Cloning repository..."
            rm -rf ${REMOTE_PATH}
            git clone ${REMOTE_URL} ${REMOTE_PATH}
            cd ${REMOTE_PATH}
            git checkout ${CURRENT_BRANCH}
        fi
EOF

    print_success "Repository deployed via git"
    echo ""
fi

# Run setup on remote server
print_info "Setting up environment on remote server..."

ssh -p "$REMOTE_PORT" "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
set -e
cd ~/amdwiki || exit 1

# Run setup script if available
if [ -f docker-setup.sh ]; then
    chmod +x docker-setup.sh
    ./docker-setup.sh
else
    # Manual setup
    mkdir -p pages data logs sessions

    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo "UID=$(id -u)" >> .env
            echo "GID=$(id -g)" >> .env
        fi
    fi
fi
EOF

print_success "Environment configured"
echo ""

# Ask if should start containers
read -p "Start Docker containers now? (Y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    print_info "Starting Docker containers..."

    ssh -p "$REMOTE_PORT" "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
set -e
cd ~/amdwiki

# Build and start containers
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for container to be healthy
echo "Waiting for container to start..."
sleep 5

# Show status
docker-compose ps
EOF

    print_success "Containers started"
    echo ""

    # Get the configured port
    HOST_PORT=$(ssh -p "$REMOTE_PORT" "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_PATH} && grep '^HOST_PORT=' .env | cut -d= -f2" || echo "3000")

    print_success "Deployment complete!"
    echo ""
    echo "🌐 Access your wiki at:"
    echo "   http://${REMOTE_HOST}:${HOST_PORT}"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:    ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && docker-compose logs -f'"
    echo "   Restart:      ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && docker-compose restart'"
    echo "   Stop:         ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && docker-compose down'"
    echo "   SSH to host:  ssh ${REMOTE_USER}@${REMOTE_HOST}"
else
    print_info "Containers not started. To start manually:"
    echo "   ssh ${REMOTE_USER}@${REMOTE_HOST}"
    echo "   cd ${REMOTE_PATH}"
    echo "   docker-compose up -d"
fi

echo ""
print_success "Deployment finished!"
EOF
