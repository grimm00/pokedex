#!/bin/bash

# Weekly Project Status Review Script
# This script helps maintain accurate project status tracking

echo "📅 WEEKLY PROJECT STATUS REVIEW"
echo "==============================="
echo "Date: $(date)"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if servers are running
check_servers() {
    echo -e "${BLUE}🔍 CHECKING SERVERS${NC}"
    echo "-------------------"
    
    # Check backend
    if curl -s "http://localhost:5000/api/v1/pokemon?per_page=1" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend server running${NC}"
    else
        echo -e "${RED}❌ Backend server not running${NC}"
        echo "   Start with: cd backend && python3 -m flask --app app run --host=0.0.0.0 --port=5000 --debug"
    fi
    
    # Check frontend
    if curl -s "http://localhost:3000" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend server running${NC}"
    else
        echo -e "${RED}❌ Frontend server not running${NC}"
        echo "   Start with: cd frontend && npm run dev"
    fi
    echo ""
}

# Function to get current Pokemon count
get_pokemon_status() {
    echo -e "${BLUE}📊 POKEMON DATA STATUS${NC}"
    echo "----------------------"
    
    if curl -s "http://localhost:5000/api/v1/pokemon?per_page=151" >/dev/null 2>&1; then
        total=$(curl -s "http://localhost:5000/api/v1/pokemon?per_page=151" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(data['pagination']['total'])" 2>/dev/null)
        actual=$(curl -s "http://localhost:5000/api/v1/pokemon?per_page=151" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(len(data['pokemon']))" 2>/dev/null)
        
        echo "Total Pokemon in database: $actual"
        echo "Pagination shows: $total"
        
        if [ "$actual" = "151" ]; then
            echo -e "${GREEN}✅ Complete Generation 1 Pokemon set (151/151)${NC}"
        elif [ "$actual" = "100" ]; then
            echo -e "${YELLOW}⚠️  Partial Pokemon set (100/151) - 51 Pokemon remaining${NC}"
        else
            echo -e "${YELLOW}⚠️  Partial Pokemon set ($actual/151)${NC}"
        fi
    else
        echo -e "${RED}❌ Cannot check Pokemon status - backend not running${NC}"
    fi
    echo ""
}

# Function to check recent commits
check_recent_activity() {
    echo -e "${BLUE}📝 RECENT ACTIVITY${NC}"
    echo "------------------"
    
    echo "Recent commits (last 7 days):"
    git log --oneline --since="7 days ago" | head -10
    
    echo ""
    echo "Current branch: $(git branch --show-current)"
    echo "Last commit: $(git log -1 --format='%h - %s (%cr)')"
    echo ""
}

# Function to check documentation status
check_documentation() {
    echo -e "${BLUE}📚 DOCUMENTATION STATUS${NC}"
    echo "----------------------"
    
    # Check if status dashboard exists and is recent
    if [ -f "admin/docs/PROJECT_STATUS_DASHBOARD.md" ]; then
        last_modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "admin/docs/PROJECT_STATUS_DASHBOARD.md")
        echo -e "${GREEN}✅ Status dashboard exists${NC} (last modified: $last_modified)"
    else
        echo -e "${RED}❌ Status dashboard missing${NC}"
    fi
    
    # Check if maintenance process exists
    if [ -f "admin/docs/PROJECT_STATUS_MAINTENANCE.md" ]; then
        echo -e "${GREEN}✅ Maintenance process documented${NC}"
    else
        echo -e "${RED}❌ Maintenance process missing${NC}"
    fi
    
    # Check if verification script exists
    if [ -f "scripts/monitoring/verify-project-status.sh" ]; then
        echo -e "${GREEN}✅ Status verification script exists${NC}"
    else
        echo -e "${RED}❌ Status verification script missing${NC}"
    fi
    echo ""
}

# Function to check for issues
check_issues() {
    echo -e "${BLUE}🚨 POTENTIAL ISSUES${NC}"
    echo "-------------------"
    
    issues_found=0
    
    # Check for uncommitted changes
    if ! git diff --quiet; then
        echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
        issues_found=$((issues_found + 1))
    fi
    
    # Check for untracked files
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then
        echo -e "${YELLOW}⚠️  Untracked files detected${NC}"
        issues_found=$((issues_found + 1))
    fi
    
    # Check for large files
    large_files=$(find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
    if [ -n "$large_files" ]; then
        echo -e "${YELLOW}⚠️  Large files detected (>10MB)${NC}"
        issues_found=$((issues_found + 1))
    fi
    
    if [ $issues_found -eq 0 ]; then
        echo -e "${GREEN}✅ No issues detected${NC}"
    fi
    echo ""
}

# Function to provide next steps
provide_next_steps() {
    echo -e "${BLUE}🎯 RECOMMENDED NEXT STEPS${NC}"
    echo "-------------------------"
    
    # Check Pokemon count and suggest completion
    if curl -s "http://localhost:5000/api/v1/pokemon?per_page=151" >/dev/null 2>&1; then
        actual=$(curl -s "http://localhost:5000/api/v1/pokemon?per_page=151" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(len(data['pokemon']))" 2>/dev/null)
        
        if [ "$actual" != "151" ]; then
            echo "1. Complete Pokemon seeding (currently $actual/151)"
            echo "   Command: cd backend && python3 -c \"from app import app; from utils.pokemon_seeder import pokemon_seeder; app.app_context().push(); result = pokemon_seeder.seed_pokemon(101, 151); print(f'✅ Seeded {result['successful']} Pokemon')\""
        fi
    fi
    
    echo "2. Update PROJECT_STATUS_DASHBOARD.md with any changes"
    echo "3. Run full verification: ./scripts/monitoring/verify-project-status.sh"
    echo "4. Commit any documentation updates"
    echo "5. Plan next week's priorities"
    echo ""
}

# Function to generate status summary
generate_summary() {
    echo -e "${BLUE}📋 WEEKLY SUMMARY${NC}"
    echo "----------------"
    
    # Get current date
    current_date=$(date +"%Y-%m-%d")
    
    # Count commits this week
    commits_this_week=$(git log --oneline --since="7 days ago" | wc -l | tr -d ' ')
    
    # Get Pokemon count
    if curl -s "http://localhost:5000/api/v1/pokemon?per_page=151" >/dev/null 2>&1; then
        pokemon_count=$(curl -s "http://localhost:5000/api/v1/pokemon?per_page=151" | python3 -c "import json, sys; data=json.loads(sys.stdin.read()); print(len(data['pokemon']))" 2>/dev/null)
    else
        pokemon_count="Unknown (backend not running)"
    fi
    
    echo "Week of: $current_date"
    echo "Commits this week: $commits_this_week"
    echo "Pokemon seeded: $pokemon_count/151"
    echo "Current branch: $(git branch --show-current)"
    echo ""
}

# Main execution
main() {
    check_servers
    get_pokemon_status
    check_recent_activity
    check_documentation
    check_issues
    provide_next_steps
    generate_summary
    
    echo -e "${GREEN}✅ Weekly status review complete!${NC}"
    echo ""
    echo "Next review: $(date -v+7d +"%Y-%m-%d")"
}

# Run the main function
main
