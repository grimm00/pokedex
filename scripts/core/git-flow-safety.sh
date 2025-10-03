#!/bin/bash

# Git Flow Safety Checks
# Automated checks to ensure proper Git Flow workflow compliance

# Get the script directory for relative imports
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source shared utilities
if [ -f "$SCRIPT_DIR/git-flow-utils.sh" ]; then
    source "$SCRIPT_DIR/git-flow-utils.sh"
else
    echo "❌ Error: git-flow-utils.sh not found. Please ensure all Git Flow scripts are properly installed."
    exit 1
fi

# Initialize Git Flow utilities
if ! init_git_flow_utils; then
    exit 1
fi

# Check if current branch is appropriate for development
check_current_branch() {
    local current_branch=$(get_current_branch)
    
    print_section "🌳 Branch Safety Check"
    
    # Check if on protected branch
    if is_protected_branch "$current_branch"; then
        print_status "ERROR" "Currently on protected branch: $current_branch"
        print_status "WARNING" "You should not develop directly on $current_branch"
        echo -e "${YELLOW}💡 Recommended actions:${NC}"
        echo "   1. Create a feature branch: git checkout -b feat/your-feature"
        echo "   2. Or switch to develop: git checkout $DEVELOP_BRANCH"
        return 1
    fi
    
    # Check if on develop (acceptable for small changes)
    if [ "$current_branch" = "$DEVELOP_BRANCH" ]; then
        print_status "WARNING" "Working directly on $DEVELOP_BRANCH"
        print_status "INFO" "Consider creating a feature branch for larger changes"
        return 0
    fi
    
    # Check if on a proper feature branch
    if is_valid_branch_name "$current_branch"; then
        print_status "SUCCESS" "Working on feature branch: $current_branch"
        return 0
    fi
    
    print_status "WARNING" "Unusual branch name: $current_branch"
    print_status "INFO" "Consider using conventional branch names: ${BRANCH_PREFIXES[*]}"
    return 0
}

# Check for uncommitted changes
check_working_directory() {
    print_section "📁 Working Directory Check"
    
    if ! git diff-index --quiet HEAD --; then
        print_status "WARNING" "You have uncommitted changes"
        echo -e "${YELLOW}Modified files:${NC}"
        git status --porcelain | head -5
        if [ $(git status --porcelain | wc -l) -gt 5 ]; then
            echo "   ... and $(( $(git status --porcelain | wc -l) - 5 )) more files"
        fi
        return 1
    else
        print_status "SUCCESS" "Working directory is clean"
        return 0
    fi
}

# Check for open PRs that might conflict
check_open_prs() {
    print_section "🔄 Pull Request Check"
    
    if ! command_exists "gh"; then
        print_status "WARNING" "GitHub CLI not installed - cannot check PRs"
        print_status "INFO" "Install GitHub CLI for PR conflict detection: https://cli.github.com/"
        return 0
    fi
    
    # Check for open PRs from current user
    local open_prs=$(gh pr list --author "@me" --state open --json number,title,headRefName 2>/dev/null)
    
    if [ "$open_prs" = "[]" ] || [ -z "$open_prs" ]; then
        print_status "SUCCESS" "No open PRs from current user"
        return 0
    fi
    
    local pr_count=$(echo "$open_prs" | jq length 2>/dev/null || echo "0")
    
    if [ "$pr_count" -gt 0 ]; then
        print_status "WARNING" "You have $pr_count open PR(s)"
        echo -e "${YELLOW}Open PRs:${NC}"
        echo "$open_prs" | jq -r '.[] | "   #\(.number): \(.title) (\(.headRefName))"' 2>/dev/null || echo "   (Could not parse PR details)"
        
        if [ "$pr_count" -gt 3 ]; then
            print_status "ERROR" "Too many open PRs ($pr_count) - consider consolidating"
            return 1
        fi
    fi
    
    return 0
}

# Check for potential merge conflicts
check_merge_conflicts() {
    print_section "⚠️  Merge Conflict Check"
    
    local current_branch=$(git branch --show-current)
    
    # Skip if on develop or main
    if [ "$current_branch" = "$DEVELOP_BRANCH" ] || [ "$current_branch" = "$MAIN_BRANCH" ]; then
        print_status "INFO" "Skipping conflict check for $current_branch"
        return 0
    fi
    
    # Fetch latest changes
    git fetch origin $DEVELOP_BRANCH >/dev/null 2>&1
    
    # Check if current branch is behind develop
    local behind_count=$(git rev-list --count HEAD..origin/$DEVELOP_BRANCH 2>/dev/null || echo "0")
    
    if [ "$behind_count" -gt 0 ]; then
        print_status "WARNING" "Branch is $behind_count commits behind $DEVELOP_BRANCH"
        print_status "INFO" "Consider rebasing: git rebase origin/$DEVELOP_BRANCH"
        
        # Check for potential conflicts (simplified check)
        local conflict_files=$(git merge-tree $(git merge-base HEAD origin/$DEVELOP_BRANCH) HEAD origin/$DEVELOP_BRANCH 2>/dev/null | grep -c "<<<<<<< " || echo "0")
        
        if [ "$conflict_files" -gt 0 ]; then
            print_status "ERROR" "Potential merge conflicts detected ($conflict_files files)"
            print_status "WARNING" "Resolve conflicts before creating PR"
            return 1
        fi
    else
        print_status "SUCCESS" "Branch is up to date with $DEVELOP_BRANCH"
    fi
    
    return 0
}

# Check repository health
check_repository_health() {
    print_section "🏥 Repository Health Check"
    
    # Check for large files
    local large_files=$(find . -name "*.log" -o -name "*.tmp" -o -name "node_modules" -o -name ".DS_Store" -o -name "*.cache" 2>/dev/null | head -5)
    
    if [ -n "$large_files" ]; then
        print_status "WARNING" "Found potentially problematic files:"
        echo "$large_files" | while read -r file; do
            echo "   $file"
        done
    fi
    
    # Check .gitignore compliance
    local untracked_important=$(git status --porcelain | grep "^??" | grep -E "\.(env|log|tmp|cache)$|node_modules/|\.DS_Store" | head -3)
    
    if [ -n "$untracked_important" ]; then
        print_status "WARNING" "Untracked files that should be ignored:"
        echo "$untracked_important" | while read -r line; do
            echo "   ${line#??}"
        done
        print_status "INFO" "Consider updating .gitignore"
    fi
    
    return 0
}

# Main safety check function
run_safety_checks() {
    local exit_code=0
    
    print_header "🛡️  Git Flow Safety Checks"
    echo ""
    
    # Check dependencies first
    if ! check_dependencies; then
        return 1
    fi
    echo ""
    
    # Run all checks
    check_current_branch || exit_code=1
    echo ""
    
    check_working_directory || exit_code=1
    echo ""
    
    check_open_prs || exit_code=1
    echo ""
    
    check_merge_conflicts || exit_code=1
    echo ""
    
    check_repository_health
    echo ""
    
    # Summary
    if [ $exit_code -eq 0 ]; then
        print_status "SUCCESS" "All safety checks passed!"
        echo -e "${GREEN}🎉 You're good to go!${NC}"
    else
        print_status "ERROR" "Some safety checks failed"
        echo -e "${RED}🚨 Please address the issues above before proceeding${NC}"
    fi
    
    return $exit_code
}

# Auto-fix function
auto_fix() {
    print_section "🔧 Auto-Fix Suggestions"
    
    local current_branch=$(get_current_branch)
    
    # If on protected branch, suggest creating feature branch
    if is_protected_branch "$current_branch"; then
        echo -e "${YELLOW}💡 Auto-fix available:${NC}"
        echo "   Create feature branch: git checkout -b feat/$(date +%Y%m%d)-work"
        return 0
    fi
    
    # If behind develop, suggest rebase
    local behind_count=$(git rev-list --count HEAD..origin/$DEVELOP_BRANCH 2>/dev/null || echo "0")
    if [ "$behind_count" -gt 0 ]; then
        echo -e "${YELLOW}💡 Auto-fix available:${NC}"
        echo "   Update branch: git rebase origin/$DEVELOP_BRANCH"
        return 0
    fi
    
    print_status "INFO" "No auto-fixes available"
}

# Command line interface
case "${1:-check}" in
    "check"|"")
        run_safety_checks
        ;;
    "fix")
        auto_fix
        ;;
    "branch")
        check_current_branch
        ;;
    "conflicts")
        check_merge_conflicts
        ;;
    "prs")
        check_open_prs
        ;;
    "health")
        check_repository_health
        ;;
    "help"|"-h"|"--help")
        echo "Git Flow Safety Checks"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check     Run all safety checks (default)"
        echo "  fix       Show auto-fix suggestions"
        echo "  branch    Check current branch safety"
        echo "  conflicts Check for merge conflicts"
        echo "  prs       Check open pull requests"
        echo "  health    Check repository health"
        echo "  help      Show this help message"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
