#!/bin/bash

# Health Check Script for Pokedex Application
# This script checks the health of all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${BASE_URL:-"http://localhost"}
TIMEOUT=${TIMEOUT:-10}

echo "🏥 Starting health check for Pokedex application..."
echo "📍 Base URL: $BASE_URL"
echo "⏱️  Timeout: ${TIMEOUT}s"
echo ""

# Function to check endpoint
check_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    
    echo -n "Checking $name... "
    
    if response=$(curl -s -w "%{http_code}" -o /dev/null --max-time $TIMEOUT "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✅ OK (HTTP $response)${NC}"
            return 0
        else
            echo -e "${RED}❌ FAILED (HTTP $response, expected $expected_status)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ FAILED (Connection error)${NC}"
        return 1
    fi
}

# Function to check service status
check_service() {
    local service_name="$1"
    local container_name="$2"
    
    echo -n "Checking $service_name container... "
    
    if docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
        if docker ps --format "table {{.Status}}" | grep -q "Up"; then
            echo -e "${GREEN}✅ Running${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Container exists but not running${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Container not found${NC}"
        return 1
    fi
}

# Check Docker services
echo "🐳 Checking Docker services..."
# Look for any pokedex container (single-container deployment)
POKEDEX_CONTAINER=$(docker ps --format "table {{.Names}}" | grep "pokedex-" | head -1)
if [ -n "$POKEDEX_CONTAINER" ]; then
    check_service "Pokedex" "$POKEDEX_CONTAINER"
else
    echo -e "Pokedex container: ${RED}❌ Not found${NC}"
    exit 1
fi
echo ""

# Check API endpoints
echo "🌐 Checking API endpoints..."
check_endpoint "Root endpoint" "$BASE_URL/" "200"
check_endpoint "Health endpoint" "$BASE_URL/" "200"
check_endpoint "Pokemon API" "$BASE_URL/api/v1/pokemon" "200"
check_endpoint "API docs" "$BASE_URL/api/docs" "200"
echo ""

# Check database connectivity
echo "🗄️  Checking database connectivity..."
if docker exec $POKEDEX_CONTAINER python -c "from backend.database import db; print('Database connection OK')" 2>/dev/null; then
    echo -e "Database: ${GREEN}✅ Connected${NC}"
else
    echo -e "Database: ${RED}❌ Connection failed${NC}"
fi

# Check Redis connectivity
echo "🔴 Checking Redis connectivity..."
if docker exec $POKEDEX_CONTAINER redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "Redis: ${GREEN}✅ Connected${NC}"
else
    echo -e "Redis: ${RED}❌ Connection failed${NC}"
fi

echo ""
echo "🏁 Health check completed!"

# Exit with error if any critical checks failed
if ! check_endpoint "Root endpoint" "$BASE_URL/" "200" >/dev/null 2>&1; then
    echo -e "${RED}❌ Critical health check failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All health checks passed!${NC}"
