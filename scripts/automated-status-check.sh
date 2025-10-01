#!/bin/bash

# Automated Project Status Check
# This script can be run in CI/CD or as a cron job

# Exit codes:
# 0 = All checks passed
# 1 = Backend issues
# 2 = Frontend issues
# 3 = Data issues
# 4 = Documentation issues

echo "🤖 AUTOMATED PROJECT STATUS CHECK"
echo "================================="
echo "Date: $(date)"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
backend_issues=0
frontend_issues=0
data_issues=0
doc_issues=0

# Function to check backend health
check_backend() {
    echo "🔍 Checking backend..."
    
    # Check if backend is running
    if ! curl -s "http://localhost:5000/api/v1/pokemon?per_page=1" >/dev/null 2>&1; then
        echo -e "${RED}❌ Backend not responding${NC}"
        backend_issues=1
        return 1
    fi
    
    # Check core endpoints
    endpoints=(
        "http://localhost:5000/api/v1/pokemon?per_page=1"
        "http://localhost:5000/api/v1/pokemon/1"
        "http://localhost:5000/api/v1/pokemon/types"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if ! curl -s "$endpoint" >/dev/null 2>&1; then
            echo -e "${RED}❌ Endpoint failed: $endpoint${NC}"
            backend_issues=1
        fi
    done
    
    if [ $backend_issues -eq 0 ]; then
        echo -e "${GREEN}✅ Backend healthy${NC}"
    fi
}

# Function to check frontend health
check_frontend() {
    echo "🔍 Checking frontend..."
    
    # Check if frontend is running
    if ! curl -s "http://localhost:3000" >/dev/null 2>&1; then
        echo -e "${RED}❌ Frontend not responding${NC}"
        frontend_issues=1
        return 1
    fi
    
    # Check if frontend serves HTML
    response=$(curl -s "http://localhost:3000" | head -1)
    if [[ "$response" == *"<!doctype html>"* ]]; then
        echo -e "${GREEN}✅ Frontend healthy${NC}"
    else
        echo -e "${RED}❌ Frontend not serving HTML${NC}"
        frontend_issues=1
    fi
}

# Function to check data integrity
check_data() {
    echo "🔍 Checking data integrity..."
    
    if ! curl -s "http://localhost:5000/api/v1/pokemon?per_page=151" >/dev/null 2>&1; then
        echo -e "${RED}❌ Cannot check data - backend not running${NC}"
        data_issues=1
        return 1
    fi
    
    # Get Pokemon count across all pages
    total_pages=$(curl -s "http://localhost:5000/api/v1/pokemon?per_page=100" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data['pagination']['pages'])" 2>/dev/null)
    pokemon_count=0
    
    for page in $(seq 1 $total_pages); do
        page_count=$(curl -s "http://localhost:5000/api/v1/pokemon?per_page=100&page=$page" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(len(data['pokemon']))" 2>/dev/null)
        pokemon_count=$((pokemon_count + page_count))
    done
    
    if [ -z "$pokemon_count" ]; then
        echo -e "${RED}❌ Cannot determine Pokemon count${NC}"
        data_issues=1
        return 1
    fi
    
    # Check if we have reasonable amount of Pokemon
    if [ "$pokemon_count" -lt 50 ]; then
        echo -e "${RED}❌ Too few Pokemon seeded ($pokemon_count)${NC}"
        data_issues=1
    elif [ "$pokemon_count" -eq 151 ]; then
        echo -e "${GREEN}✅ Complete Pokemon dataset ($pokemon_count/151)${NC}"
    else
        echo -e "${YELLOW}⚠️  Partial Pokemon dataset ($pokemon_count/151)${NC}"
    fi
    
    # Check if first Pokemon exists
    first_pokemon=$(curl -s "http://localhost:5000/api/v1/pokemon/1" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data['name'])" 2>/dev/null)
    if [ "$first_pokemon" != "bulbasaur" ]; then
        echo -e "${RED}❌ First Pokemon data incorrect${NC}"
        data_issues=1
    fi
}

# Function to check documentation
check_documentation() {
    echo "🔍 Checking documentation..."
    
    # Check if key documentation exists
    key_docs=(
        "admin/docs/PROJECT_STATUS_DASHBOARD.md"
        "admin/docs/PROJECT_STATUS_MAINTENANCE.md"
        "README.md"
    )
    
    for doc in "${key_docs[@]}"; do
        if [ ! -f "$doc" ]; then
            echo -e "${RED}❌ Missing documentation: $doc${NC}"
            doc_issues=1
        fi
    done
    
    if [ $doc_issues -eq 0 ]; then
        echo -e "${GREEN}✅ Documentation complete${NC}"
    fi
}

# Function to check project structure
check_structure() {
    echo "🔍 Checking project structure..."
    
    # Check if key files exist
    key_files=(
        "backend/app.py"
        "frontend/src/pages/PokemonPage.tsx"
        "docker-compose.yml"
        "package.json"
    )
    
    missing_files=0
    for file in "${key_files[@]}"; do
        if [ ! -f "$file" ]; then
            echo -e "${RED}❌ Missing file: $file${NC}"
            missing_files=1
        fi
    done
    
    if [ $missing_files -eq 0 ]; then
        echo -e "${GREEN}✅ Project structure intact${NC}"
    else
        backend_issues=1
    fi
}

# Function to generate report
generate_report() {
    echo ""
    echo "📊 STATUS REPORT"
    echo "================"
    
    total_issues=$((backend_issues + frontend_issues + data_issues + doc_issues))
    
    if [ $total_issues -eq 0 ]; then
        echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
        echo "Project is healthy and ready for development"
        exit 0
    else
        echo -e "${RED}❌ ISSUES DETECTED${NC}"
        echo ""
        
        if [ $backend_issues -eq 1 ]; then
            echo "• Backend issues detected"
        fi
        if [ $frontend_issues -eq 1 ]; then
            echo "• Frontend issues detected"
        fi
        if [ $data_issues -eq 1 ]; then
            echo "• Data integrity issues detected"
        fi
        if [ $doc_issues -eq 1 ]; then
            echo "• Documentation issues detected"
        fi
        
        echo ""
        echo "Run './scripts/verify-project-status.sh' for detailed analysis"
        exit $total_issues
    fi
}

# Main execution
main() {
    check_backend
    check_frontend
    check_data
    check_documentation
    check_structure
    generate_report
}

# Run the main function
main
