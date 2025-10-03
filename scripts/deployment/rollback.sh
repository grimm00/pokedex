#!/bin/bash

# Rollback Script for Pokedex Application
# This script handles rollback to previous versions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PREVIOUS_VERSION=${2:-$(docker images --format "table {{.Tag}}" | grep $ENVIRONMENT | head -2 | tail -1)}

echo "🔄 Rolling back Pokedex in $ENVIRONMENT environment..."
echo "📦 Rolling back to version: $PREVIOUS_VERSION"
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
    *)
        echo -e "${RED}❌ Invalid environment. Use: development, staging, or production${NC}"
        exit 1
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

# Function to get available versions
get_available_versions() {
    echo "📋 Available versions:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | grep pokedex | head -10
    echo ""
}

# Function to update compose file with previous version
update_compose_file() {
    echo "📝 Updating compose file to use version $PREVIOUS_VERSION..."
    
    # Create backup of current compose file
    cp "$COMPOSE_FILE" "${COMPOSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update image tags in compose file
    sed -i.bak "s/:latest/:$PREVIOUS_VERSION/g" "$COMPOSE_FILE"
    
    echo -e "${GREEN}✅ Compose file updated${NC}"
}

# Function to stop current containers
stop_containers() {
    echo "🛑 Stopping current containers..."
    docker-compose -f $COMPOSE_FILE down
}

# Function to start previous version
start_previous_version() {
    echo "🚀 Starting previous version..."
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

# Function to run health checks
run_health_checks() {
    echo "🏥 Running health checks..."
    
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
}

# Function to show rollback status
show_status() {
    echo ""
    echo "📊 Rollback Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo "🌐 Application URLs:"
    echo "  - Main Application: http://localhost/"
    echo "  - API Health: http://localhost/api/v1/health"
    echo "  - API Documentation: http://localhost/api/docs"
    echo ""
}

# Function to restore original compose file
restore_compose_file() {
    echo "🔄 Restoring original compose file..."
    if [ -f "${COMPOSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)" ]; then
        cp "${COMPOSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)" "$COMPOSE_FILE"
        echo -e "${GREEN}✅ Compose file restored${NC}"
    else
        echo -e "${YELLOW}⚠️  No backup found, keeping current version${NC}"
    fi
}

# Main rollback process
main() {
    echo -e "${BLUE}Starting rollback process...${NC}"
    
    # Pre-rollback checks
    check_docker
    
    # Show available versions
    get_available_versions
    
    # Confirm rollback
    read -p "Are you sure you want to rollback to version $PREVIOUS_VERSION? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Rollback cancelled${NC}"
        exit 0
    fi
    
    # Rollback steps
    update_compose_file
    stop_containers
    start_previous_version
    
    # Wait for services to be healthy
    if ! wait_for_health; then
        echo -e "${RED}❌ Rollback failed - services not healthy${NC}"
        restore_compose_file
        exit 1
    fi
    
    # Run health checks
    if ! run_health_checks; then
        echo -e "${RED}❌ Rollback failed - health checks failed${NC}"
        restore_compose_file
        exit 1
    fi
    
    # Show final status
    show_status
    
    echo -e "${GREEN}🎉 Rollback to $PREVIOUS_VERSION completed successfully!${NC}"
}

# Run main function
main "$@"
