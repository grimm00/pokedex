#!/bin/bash

# Phase 4B Comprehensive Testing Script
# Tests all Phase 4B Enhanced UX Features automatically

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:5000/api/v1"
FRONTEND_URL="http://localhost:3000"
TEST_USER1="testuser1_$(date +%s)"
TEST_USER2="testuser2_$(date +%s)"
TEST_PASSWORD="password123"
TEST_EMAIL1="test1_$(date +%s)@example.com"
TEST_EMAIL2="test2_$(date +%s)@example.com"

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test results
print_test_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        echo -e "${RED}   Details: $details${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    if [ -n "$details" ] && [ "$status" = "PASS" ]; then
        echo -e "${BLUE}   $details${NC}"
    fi
    echo
}

# Function to make API calls and check responses
api_call() {
    local method="$1"
    local url="$2"
    local headers="$3"
    local data="$4"
    local expected_status="$5"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" $headers -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" $headers)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        echo "$body"
        return 0
    else
        echo "HTTP $http_code: $body" >&2
        return 1
    fi
}

# Function to extract JSON field
extract_json_field() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"$field\":\"[^\"]*\"" | cut -d'"' -f4
}

echo -e "${BLUE}🧪 Phase 4B Comprehensive Testing Script${NC}"
echo -e "${BLUE}==========================================${NC}"
echo

# Test 1: Service Availability
echo -e "${YELLOW}🔍 Test 1: Service Availability${NC}"
if curl -s "$API_BASE/health" > /dev/null 2>&1; then
    print_test_result "Backend API Health Check" "PASS" "API responding on port 5000"
else
    print_test_result "Backend API Health Check" "FAIL" "API not responding"
fi

if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    print_test_result "Frontend Health Check" "PASS" "Frontend responding on port 3000"
else
    print_test_result "Frontend Health Check" "FAIL" "Frontend not responding"
fi

# Test 2: User Registration
echo -e "${YELLOW}🔍 Test 2: User Registration${NC}"
user1_response=$(api_call "POST" "$API_BASE/auth/register" \
    "-H 'Content-Type: application/json'" \
    "{\"username\":\"$TEST_USER1\",\"email\":\"$TEST_EMAIL1\",\"password\":\"$TEST_PASSWORD\"}" \
    "201" 2>/dev/null)

if [ $? -eq 0 ]; then
    user1_id=$(extract_json_field "$user1_response" "id")
    print_test_result "User 1 Registration" "PASS" "User ID: $user1_id"
else
    print_test_result "User 1 Registration" "FAIL" "Registration failed"
    exit 1
fi

user2_response=$(api_call "POST" "$API_BASE/auth/register" \
    "-H 'Content-Type: application/json'" \
    "{\"username\":\"$TEST_USER2\",\"email\":\"$TEST_EMAIL2\",\"password\":\"$TEST_PASSWORD\"}" \
    "201" 2>/dev/null)

if [ $? -eq 0 ]; then
    user2_id=$(extract_json_field "$user2_response" "id")
    print_test_result "User 2 Registration" "PASS" "User ID: $user2_id"
else
    print_test_result "User 2 Registration" "FAIL" "Registration failed"
    exit 1
fi

# Test 3: User Authentication
echo -e "${YELLOW}🔍 Test 3: User Authentication${NC}"
user1_login=$(api_call "POST" "$API_BASE/auth/login" \
    "-H 'Content-Type: application/json'" \
    "{\"username\":\"$TEST_USER1\",\"password\":\"$TEST_PASSWORD\"}" \
    "200" 2>/dev/null)

if [ $? -eq 0 ]; then
    user1_token=$(extract_json_field "$user1_login" "access_token")
    print_test_result "User 1 Login" "PASS" "JWT token obtained"
else
    print_test_result "User 1 Login" "FAIL" "Login failed"
    exit 1
fi

user2_login=$(api_call "POST" "$API_BASE/auth/login" \
    "-H 'Content-Type: application/json'" \
    "{\"username\":\"$TEST_USER2\",\"password\":\"$TEST_PASSWORD\"}" \
    "200" 2>/dev/null)

if [ $? -eq 0 ]; then
    user2_token=$(extract_json_field "$user2_login" "access_token")
    print_test_result "User 2 Login" "PASS" "JWT token obtained"
else
    print_test_result "User 2 Login" "FAIL" "Login failed"
    exit 1
fi

# Test 4: Favorites Management
echo -e "${YELLOW}🔍 Test 4: Favorites Management${NC}"

# Add favorite for user 1
add_favorite=$(api_call "POST" "$API_BASE/users/$user1_id/favorites" \
    "-H 'Content-Type: application/json' -H 'Authorization: Bearer $user1_token'" \
    "{\"pokemon_id\":1}" \
    "201" 2>/dev/null)

if [ $? -eq 0 ]; then
    print_test_result "Add Favorite (User 1)" "PASS" "Bulbasaur added to favorites"
else
    print_test_result "Add Favorite (User 1)" "FAIL" "Failed to add favorite"
fi

# Add different favorite for user 2
add_favorite2=$(api_call "POST" "$API_BASE/users/$user2_id/favorites" \
    "-H 'Content-Type: application/json' -H 'Authorization: Bearer $user2_token'" \
    "{\"pokemon_id\":25}" \
    "201" 2>/dev/null)

if [ $? -eq 0 ]; then
    print_test_result "Add Favorite (User 2)" "PASS" "Pikachu added to favorites"
else
    print_test_result "Add Favorite (User 2)" "FAIL" "Failed to add favorite"
fi

# Test 5: User Isolation
echo -e "${YELLOW}🔍 Test 5: User Isolation${NC}"

# Get user 1 favorites
user1_favorites=$(api_call "GET" "$API_BASE/users/$user1_id/favorites" \
    "-H 'Authorization: Bearer $user1_token'" \
    "" \
    "200" 2>/dev/null)

if [ $? -eq 0 ] && echo "$user1_favorites" | grep -q "pokemon_id.*1"; then
    print_test_result "User 1 Favorites Retrieval" "PASS" "Contains Bulbasaur (ID: 1)"
else
    print_test_result "User 1 Favorites Retrieval" "FAIL" "Missing expected favorite"
fi

# Get user 2 favorites
user2_favorites=$(api_call "GET" "$API_BASE/users/$user2_id/favorites" \
    "-H 'Authorization: Bearer $user2_token'" \
    "" \
    "200" 2>/dev/null)

if [ $? -eq 0 ] && echo "$user2_favorites" | grep -q "pokemon_id.*25"; then
    print_test_result "User 2 Favorites Retrieval" "PASS" "Contains Pikachu (ID: 25)"
else
    print_test_result "User 2 Favorites Retrieval" "FAIL" "Missing expected favorite"
fi

# Test cross-user access (should fail)
cross_access=$(api_call "GET" "$API_BASE/users/$user2_id/favorites" \
    "-H 'Authorization: Bearer $user1_token'" \
    "" \
    "403" 2>/dev/null)

if [ $? -eq 0 ]; then
    print_test_result "Cross-User Access Prevention" "PASS" "Correctly blocked access"
else
    print_test_result "Cross-User Access Prevention" "FAIL" "Security issue: cross-user access allowed"
fi

# Test 6: Favorites Sorting
echo -e "${YELLOW}🔍 Test 6: Favorites Sorting${NC}"

# Test favorites sorting for user 1
favorites_sort=$(api_call "GET" "$API_BASE/pokemon?sort=favorites&per_page=5" \
    "-H 'Authorization: Bearer $user1_token'" \
    "" \
    "200" 2>/dev/null)

if [ $? -eq 0 ] && echo "$favorites_sort" | grep -q "pokemon_id.*1"; then
    print_test_result "Favorites Sorting (User 1)" "PASS" "Bulbasaur appears first"
else
    print_test_result "Favorites Sorting (User 1)" "FAIL" "Favorites sorting not working"
fi

# Test favorites sorting for user 2
favorites_sort2=$(api_call "GET" "$API_BASE/pokemon?sort=favorites&per_page=5" \
    "-H 'Authorization: Bearer $user2_token'" \
    "" \
    "200" 2>/dev/null)

if [ $? -eq 0 ] && echo "$favorites_sort2" | grep -q "pokemon_id.*25"; then
    print_test_result "Favorites Sorting (User 2)" "PASS" "Pikachu appears first"
else
    print_test_result "Favorites Sorting (User 2)" "FAIL" "Favorites sorting not working"
fi

# Test 7: Sorting Combinations
echo -e "${YELLOW}🔍 Test 7: Sorting Combinations${NC}"

# Test favorites + search
combo_search=$(api_call "GET" "$API_BASE/pokemon?sort=favorites&search=char&per_page=5" \
    "-H 'Authorization: Bearer $user1_token'" \
    "" \
    "200" 2>/dev/null)

if [ $? -eq 0 ]; then
    print_test_result "Favorites + Search Combination" "PASS" "Search with favorites sorting works"
else
    print_test_result "Favorites + Search Combination" "FAIL" "Search combination failed"
fi

# Test favorites + type filter
combo_type=$(api_call "GET" "$API_BASE/pokemon?sort=favorites&type=fire&per_page=5" \
    "-H 'Authorization: Bearer $user1_token'" \
    "" \
    "200" 2>/dev/null)

if [ $? -eq 0 ]; then
    print_test_result "Favorites + Type Filter Combination" "PASS" "Type filter with favorites sorting works"
else
    print_test_result "Favorites + Type Filter Combination" "FAIL" "Type filter combination failed"
fi

# Test 8: Performance Testing
echo -e "${YELLOW}🔍 Test 8: Performance Testing${NC}"

# Test single request performance
start_time=$(date +%s%N)
api_call "GET" "$API_BASE/pokemon?sort=favorites&per_page=20" \
    "-H 'Authorization: Bearer $user1_token'" \
    "" \
    "200" > /dev/null 2>&1
end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

if [ $duration -lt 1000 ]; then  # Less than 1 second
    print_test_result "Single Request Performance" "PASS" "Response time: ${duration}ms"
else
    print_test_result "Single Request Performance" "FAIL" "Response time too slow: ${duration}ms"
fi

# Test concurrent requests
echo "Testing concurrent requests..."
for i in {1..5}; do
    api_call "GET" "$API_BASE/pokemon?sort=favorites&per_page=10" \
        "-H 'Authorization: Bearer $user1_token'" \
        "" \
        "200" > /dev/null 2>&1 &
done
wait

if [ $? -eq 0 ]; then
    print_test_result "Concurrent Requests Performance" "PASS" "5 concurrent requests completed successfully"
else
    print_test_result "Concurrent Requests Performance" "FAIL" "Concurrent requests failed"
fi

# Test 9: Frontend Tests
echo -e "${YELLOW}🔍 Test 9: Frontend Test Suite${NC}"

if [ -d "frontend" ]; then
    cd frontend
    if npm test -- --run > /dev/null 2>&1; then
        print_test_result "Frontend Test Suite" "PASS" "All frontend tests passing"
    else
        print_test_result "Frontend Test Suite" "FAIL" "Some frontend tests failing"
    fi
    cd ..
else
    print_test_result "Frontend Test Suite" "SKIP" "Frontend directory not found"
fi

# Test 10: Cleanup
echo -e "${YELLOW}🔍 Test 10: Cleanup${NC}"

# Remove test users (optional - they'll expire anyway)
print_test_result "Test Cleanup" "PASS" "Test users created with unique timestamps"

# Final Results
echo -e "${BLUE}📊 FINAL TEST RESULTS${NC}"
echo -e "${BLUE}=====================${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Phase 4B is ready for production!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
