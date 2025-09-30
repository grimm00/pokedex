#!/bin/bash

# Phase 4B Simple Testing Script
# Basic validation for automated testing

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_BASE="http://localhost:5000/api/v1"
FRONTEND_URL="http://localhost:3000"

echo -e "${YELLOW}🚀 Phase 4B Simple Validation${NC}"

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

# Test 2: Basic API endpoints
echo "Testing basic API endpoints..."
if curl -s "$API_BASE/pokemon?per_page=1" | grep -q "pokemon"; then
    echo -e "${GREEN}✅ Pokemon API working${NC}"
else
    echo -e "${RED}❌ Pokemon API failed${NC}"
    exit 1
fi

# Test 3: User registration
echo "Testing user registration..."
TIMESTAMP=$(date +%s)
USER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"test_user_$TIMESTAMP\",\"email\":\"test_$TIMESTAMP@example.com\",\"password\":\"password123\"}")

if echo "$USER_RESPONSE" | grep -q "User registered successfully"; then
    echo -e "${GREEN}✅ User registration working${NC}"
elif echo "$USER_RESPONSE" | grep -q "already exists"; then
    echo -e "${GREEN}✅ User registration working (user already exists)${NC}"
else
    echo -e "${RED}❌ User registration failed: $USER_RESPONSE${NC}"
    exit 1
fi

# Test 4: User login
echo "Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"test_user_$TIMESTAMP\",\"password\":\"password123\"}")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✅ User authentication working${NC}"
else
    echo -e "${RED}❌ User authentication failed${NC}"
    exit 1
fi

# Test 5: Frontend tests (if available)
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

echo -e "${GREEN}🎉 All Phase 4B basic tests passed!${NC}"
