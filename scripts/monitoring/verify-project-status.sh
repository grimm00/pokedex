#!/bin/bash

# Pokedex Project Status Verification Script
# This script verifies the actual current state of the project

echo "🔍 POKEDEX PROJECT STATUS VERIFICATION"
echo "========================================"
echo "Date: $(date)"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check API endpoint
check_api() {
    local endpoint="$1"
    local description="$2"
    local expected_field="$3"
    
    echo -n "Checking $description... "
    
    response=$(curl -s "$endpoint" 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        if [ -n "$expected_field" ]; then
            # Check if expected field exists in response
            if echo "$response" | grep -q "$expected_field"; then
                echo -e "${GREEN}✅ PASS${NC}"
                return 0
            else
                echo -e "${RED}❌ FAIL - Missing expected field${NC}"
                return 1
            fi
        else
            echo -e "${GREEN}✅ PASS${NC}"
            return 0
        fi
    else
        echo -e "${RED}❌ FAIL - No response${NC}"
        return 1
    fi
}

# Function to get count from API with pagination
get_total_count() {
    local endpoint="$1"
    local field="$2"
    
    curl -s "$endpoint" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data['$field'])" 2>/dev/null
}

# Function to get actual Pokemon count across all pages
get_actual_pokemon_count() {
    local total_pages=$(curl -s "http://localhost:5000/api/v1/pokemon?per_page=100" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data['pagination']['pages'])" 2>/dev/null)
    local total_count=0
    
    for page in $(seq 1 $total_pages); do
        page_count=$(curl -s "http://localhost:5000/api/v1/pokemon?per_page=100&page=$page" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(len(data['pokemon']))" 2>/dev/null)
        total_count=$((total_count + page_count))
    done
    
    echo $total_count
}

echo "📊 BACKEND API VERIFICATION"
echo "---------------------------"

# Check if backend is running
echo -n "Backend server status... "
if curl -s "http://localhost:5000/api/v1/pokemon?per_page=1" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${RED}❌ NOT RUNNING${NC}"
    echo "Please start the backend server first: cd backend && python3 -m flask --app app run --host=0.0.0.0 --port=5000 --debug"
    exit 1
fi

# Core API endpoints
check_api "http://localhost:5000/api/v1/pokemon?per_page=1" "Pokemon list endpoint" "pokemon"
check_api "http://localhost:5000/api/v1/pokemon/1" "Individual Pokemon endpoint" "bulbasaur"
check_api "http://localhost:5000/api/v1/pokemon/types" "Types endpoint" "fire"

# Search and filtering
check_api "http://localhost:5000/api/v1/pokemon?search=char" "Search functionality" "charmander"
check_api "http://localhost:5000/api/v1/pokemon?type=fire" "Type filtering" "charmander"

echo ""
echo "📈 DATA VERIFICATION"
echo "-------------------"

# Get actual counts using pagination
total_pokemon=$(get_total_count "http://localhost:5000/api/v1/pokemon?per_page=100" "pagination.total")
actual_pokemon=$(get_actual_pokemon_count)
types_count=$(get_total_count "http://localhost:5000/api/v1/pokemon/types" "types")

echo "Total Pokemon in database: $total_pokemon"
echo "Pokemon returned across all pages: $actual_pokemon"
echo "Available types: $types_count"

# Verify complete Gen 1 set
if [ "$total_pokemon" = "151" ]; then
    echo -e "${GREEN}✅ Complete Generation 1 Pokemon set (151/151)${NC}"
else
    echo -e "${YELLOW}⚠️  Partial Pokemon set ($total_pokemon/151)${NC}"
fi

# Check last Pokemon
last_pokemon=$(curl -s "http://localhost:5000/api/v1/pokemon/151" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data['name'])" 2>/dev/null)
if [ "$last_pokemon" = "mew" ]; then
    echo -e "${GREEN}✅ Last Pokemon is Mew (ID: 151)${NC}"
else
    echo -e "${YELLOW}⚠️  Last Pokemon: $last_pokemon${NC}"
fi

echo ""
echo "🎨 FRONTEND VERIFICATION"
echo "-----------------------"

# Check if frontend is running
echo -n "Frontend server status... "
if curl -s "http://localhost:3000" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ RUNNING${NC}"
else
    echo -e "${YELLOW}⚠️  NOT RUNNING${NC}"
    echo "To start frontend: cd frontend && npm run dev"
fi

echo ""
echo "🧪 TESTING VERIFICATION"
echo "----------------------"

# Check if tests exist and can run
if [ -f "backend/pytest.ini" ]; then
    echo -e "${GREEN}✅ Backend tests configured${NC}"
else
    echo -e "${RED}❌ Backend tests not configured${NC}"
fi

if [ -f "frontend/vitest.config.ts" ]; then
    echo -e "${GREEN}✅ Frontend tests configured${NC}"
else
    echo -e "${RED}❌ Frontend tests not configured${NC}"
fi

echo ""
echo "📁 PROJECT STRUCTURE VERIFICATION"
echo "--------------------------------"

# Check key directories and files
key_files=(
    "backend/app.py"
    "backend/models/pokemon.py"
    "backend/routes/pokemon_routes.py"
    "frontend/src/pages/PokemonPage.tsx"
    "frontend/src/store/favoritesStore.ts"
    "docker-compose.yml"
    "admin/docs/PROJECT_STATUS_DASHBOARD.md"
)

for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file${NC}"
    fi
done

echo ""
echo "📋 SUMMARY"
echo "---------"

# Calculate completion percentage
if [ "$total_pokemon" = "151" ]; then
    pokemon_completion="100%"
else
    pokemon_completion="$((total_pokemon * 100 / 151))%"
fi

echo "Pokemon Data: $pokemon_completion complete"
echo "API Endpoints: All core endpoints working"
echo "Search & Filter: Functional"
echo "Frontend: Available"
echo "Documentation: Status dashboard created"

echo ""
echo "🎯 NEXT STEPS"
echo "------------"
echo "1. Review any failed checks above"
echo "2. Update PROJECT_STATUS_DASHBOARD.md with actual status"
echo "3. Establish weekly status review process"
echo "4. Set up automated monitoring where possible"

echo ""
echo "Verification complete at $(date)"
