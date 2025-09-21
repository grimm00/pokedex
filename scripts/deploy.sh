#!/bin/bash

# Deployment Script for Pokedex Application
# This script handles deployment to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
COMPOSE_FILE="docker-compose.yml"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment. Use: development, staging, or production${NC}"
    exit 1
fi

echo "🚀 Deploying Pokedex to $ENVIRONMENT environment..."
echo "📦 Version: $VERSION"
echo ""

# Set environment-specific configuration
case $ENVIRONMENT in
    development)
        COMPOSE_FILE="docker-compose.yml"
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        ;;
    production)
        COMPOSE_FILE="docker-compose.prod.yml"
        ;;
esac

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Compose file $COMPOSE_FILE not found!${NC}"
    exit 1
fi

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running!${NC}"
        exit 1
    fi
}

# Function to pull latest images
pull_images() {
    echo "📥 Pulling latest images..."
    docker-compose -f $COMPOSE_FILE pull
}

# Function to stop existing containers
stop_containers() {
    echo "🛑 Stopping existing containers..."
    docker-compose -f $COMPOSE_FILE down
}

# Function to start new containers
start_containers() {
    echo "🚀 Starting new containers..."
    docker-compose -f $COMPOSE_FILE up -d
}

# Function to wait for services to be healthy
wait_for_health() {
    echo "⏳ Waiting for services to be healthy..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f $COMPOSE_FILE ps | grep -q "healthy"; then
            echo -e "${GREEN}✅ Services are healthy!${NC}"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts - waiting for services..."
        sleep 10
        ((attempt++))
    done
    
    echo -e "${RED}❌ Services failed to become healthy within timeout${NC}"
    return 1
}

# Function to run smoke tests
run_smoke_tests() {
    echo "🧪 Running smoke tests..."
    
    # Wait a bit for services to fully start
    sleep 30
    
    # Test health endpoint
    if curl -f http://localhost/api/v1/health >/dev/null 2>&1; then
        echo -e "Health endpoint: ${GREEN}✅ OK${NC}"
    else
        echo -e "Health endpoint: ${RED}❌ FAILED${NC}"
        return 1
    fi
    
    # Test main page
    if curl -f http://localhost/ >/dev/null 2>&1; then
        echo -e "Main page: ${GREEN}✅ OK${NC}"
    else
        echo -e "Main page: ${RED}❌ FAILED${NC}"
        return 1
    fi
    
    # Test API endpoint
    if curl -f http://localhost/api/v1/pokemon >/dev/null 2>&1; then
        echo -e "Pokemon API: ${GREEN}✅ OK${NC}"
    else
        echo -e "Pokemon API: ${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to show deployment status
show_status() {
    echo ""
    echo "📊 Deployment Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo "🌐 Application URLs:"
    echo "  - Main Application: http://localhost/"
    echo "  - API Health: http://localhost/api/v1/health"
    echo "  - API Documentation: http://localhost/api/docs"
    echo ""
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    # Pre-deployment checks
    check_docker
    
    # Deployment steps
    pull_images
    stop_containers
    start_containers
    
    # Wait for services to be healthy
    if ! wait_for_health; then
        echo -e "${RED}❌ Deployment failed - services not healthy${NC}"
        exit 1
    fi
    
    # Run smoke tests
    if ! run_smoke_tests; then
        echo -e "${RED}❌ Deployment failed - smoke tests failed${NC}"
        exit 1
    fi
    
    # Show final status
    show_status
    
    echo -e "${GREEN}🎉 Deployment to $ENVIRONMENT completed successfully!${NC}"
}

# Run main function
main "$@"
