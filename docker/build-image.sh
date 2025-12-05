#!/bin/bash
# Docker image build helper script
# Reads variables from .env and builds Docker image

set -e  # Exit on error

# Load .env if it exists
if [ -f .env ]; then
    source .env
else
    echo "Warning: .env not found, using defaults"
fi

# Set defaults
DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME:-amdwiki}
DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG:-latest}
DOCKER_NODE_VERSION=${DOCKER_NODE_VERSION:-20}
BUILD_CONTEXT=${BUILD_CONTEXT:-..}
DOCKERFILE_PATH=${DOCKERFILE_PATH:-docker/Dockerfile}

# Construct full image name
if [ -n "$DOCKER_REGISTRY" ]; then
    FULL_IMAGE="$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG"
else
    FULL_IMAGE="$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG"
fi

echo "============================================"
echo "Building Docker Image"
echo "============================================"
echo "Image: $FULL_IMAGE"
echo "Node Version: $DOCKER_NODE_VERSION"
echo "Build Context: $BUILD_CONTEXT"
echo "Dockerfile: $DOCKERFILE_PATH"
echo "============================================"

# Build command
BUILD_CMD="docker build"
BUILD_CMD="$BUILD_CMD -t $FULL_IMAGE"
BUILD_CMD="$BUILD_CMD --build-arg NODE_VERSION=$DOCKER_NODE_VERSION"

# Validate Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker daemon is not running or not accessible"
    exit 1
fi

# Add platform if specified
if [ -n "$DOCKER_BUILD_PLATFORM" ]; then
    BUILD_CMD="$BUILD_CMD --platform $DOCKER_BUILD_PLATFORM"
fi

# Add no-cache if specified
if [ -n "$DOCKER_NO_CACHE" ]; then
    BUILD_CMD="$BUILD_CMD --no-cache"
fi

# Add custom build args if specified
if [ -n "$DOCKER_BUILD_ARGS" ]; then
    BUILD_CMD="$BUILD_CMD $DOCKER_BUILD_ARGS"
fi

BUILD_CMD="$BUILD_CMD -f $DOCKERFILE_PATH $BUILD_CONTEXT"

echo "Command: $BUILD_CMD"
echo "============================================"
echo ""

# Execute build
if eval $BUILD_CMD; then
    BUILD_STATUS=0
else
    BUILD_STATUS=$?
    echo "❌ Build failed with exit code $BUILD_STATUS"
    exit $BUILD_STATUS
fi

echo "============================================"
echo "Build Complete!"
echo "Image: $FULL_IMAGE"
echo "============================================"
echo ""
echo "Run with: docker run -d -p 3000:3000 $FULL_IMAGE"
echo "Or use: docker-compose up -d"
