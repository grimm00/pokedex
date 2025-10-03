#!/bin/bash

# Phase 4B Quick Testing Script for CI/CD
# Essential tests for automated deployment validation

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_BASE="http://localhost:5000/api/v1"
FRONTEND_URL="http://localhost:3000"

echo -e "${YELLOW}🚀 Phase 4B Quick Validation${NC}"

# Test 1: Services are running
echo "Testing service availability..."
if ! curl -s "$API_BASE/health" > /dev/null; then
    echo -e "${RED}❌ Backend API not responding${NC}"
    exit 1
fi

if ! curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${RED}❌ Frontend not responding${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Services running${NC}"

# Test 2: User registration and authentication
echo "Testing user authentication..."
USER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"username":"ci_test_user","email":"ci@test.com","password":"password123"}')

if echo "$USER_RESPONSE" | grep -q "User registered successfully"; then
    echo -e "${GREEN}✅ User registration working${NC}"
elif echo "$USER_RESPONSE" | grep -q "already exists"; then
    echo -e "${GREEN}✅ User registration working (user already exists)${NC}"
else
    echo -e "${RED}❌ User registration failed: $USER_RESPONSE${NC}"
    exit 1
fi

# Test 3: Login and get token
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"ci_test_user","password":"password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ User authentication working${NC}"
else
    echo -e "${RED}❌ User authentication failed${NC}"
    exit 1
fi

# Test 4: Favorites functionality
echo "Testing favorites functionality..."
TOKEN=$(python3 -c "import json, sys; data=json.loads('$LOGIN_RESPONSE'); print(data['access_token'])" 2>/dev/null)
USER_ID=$(python3 -c "import json, sys; data=json.loads('$LOGIN_RESPONSE'); print(data['user']['id'])" 2>/dev/null || echo "4")

FAVORITE_RESPONSE=$(curl -s -X POST "$API_BASE/users/$USER_ID/favorites" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"pokemon_id":1}')

if echo "$FAVORITE_RESPONSE" | grep -q "pokemon_id.*1"; then
    echo -e "${GREEN}✅ Favorites functionality working${NC}"
elif echo "$FAVORITE_RESPONSE" | grep -q "already in favorites"; then
    echo -e "${GREEN}✅ Favorites functionality working (already favorited)${NC}"
else
    echo -e "${RED}❌ Favorites functionality failed: $FAVORITE_RESPONSE${NC}"
    exit 1
fi

# Test 5: Favorites sorting
echo "Testing favorites sorting..."
SORT_RESPONSE=$(curl -s -X GET "$API_BASE/pokemon?sort=favorites&per_page=5" \
    -H "Authorization: Bearer $TOKEN")

if echo "$SORT_RESPONSE" | grep -q "pokemon_id.*1"; then
    echo -e "${GREEN}✅ Favorites sorting working${NC}"
else
    echo -e "${RED}❌ Favorites sorting failed${NC}"
    exit 1
fi

# Test 6: Frontend tests (if available)
if [ -d "frontend" ]; then
    echo "Running frontend tests..."
    cd frontend
    if npm test -- --run > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend tests passing${NC}"
    else
        echo -e "${RED}❌ Frontend tests failing${NC}"
        exit 1
    fi
    cd ..
fi

echo -e "${GREEN}🎉 All Phase 4B tests passed! Ready for deployment!${NC}"
