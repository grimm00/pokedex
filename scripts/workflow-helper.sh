#!/bin/bash

# Comprehensive Workflow Helper for Pokehub Development
# Integrates Git Flow, GitHub CLI, and development shortcuts
# Usage: ./scripts/workflow-helper.sh [command] [args...]

set -e

MAIN_BRANCH="main"
DEVELOP_BRANCH="develop"
PROJECT_DIR="/Users/cdwilson/Projects/pokedex"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Ensure we're in the project directory
cd "$PROJECT_DIR"

print_header() {
    echo -e "${PURPLE}🚀 Pokehub Workflow Helper${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
}

print_section() {
    echo -e "\n${BLUE}$1${NC}"
    echo -e "${CYAN}───────────────────────────────────────${NC}"
}

case "$1" in
    # Git Flow Commands
    "start-feature"|"sf")
        if [ -z "$2" ]; then
            echo -e "${RED}Usage: $0 start-feature <feature-name>${NC}"
            exit 1
        fi
        echo -e "${GREEN}🌱 Starting new feature: $2${NC}"
        git checkout $DEVELOP_BRANCH
        git pull origin $DEVELOP_BRANCH
        git checkout -b "feat/$2"
        echo -e "${GREEN}✅ Created and switched to feat/$2${NC}"
        echo -e "${YELLOW}💡 Next steps:${NC}"
        echo -e "   1. Make your changes"
        echo -e "   2. Run: $0 push (or $0 pr to create PR)"
        echo -e "   3. Create PR: feat/$2 → $DEVELOP_BRANCH"
        ;;
        
    "start-fix"|"fix")
        if [ -z "$2" ]; then
            echo -e "${RED}Usage: $0 start-fix <fix-name>${NC}"
            exit 1
        fi
        echo -e "${GREEN}🐛 Starting new fix: $2${NC}"
        git checkout $DEVELOP_BRANCH
        git pull origin $DEVELOP_BRANCH
        git checkout -b "fix/$2"
        echo -e "${GREEN}✅ Created and switched to fix/$2${NC}"
        echo -e "${YELLOW}💡 Next steps:${NC}"
        echo -e "   1. Fix the issue"
        echo -e "   2. Run: $0 push (or $0 pr to create PR)"
        echo -e "   3. Create PR: fix/$2 → $DEVELOP_BRANCH"
        ;;
        
    "start-hotfix"|"hotfix")
        if [ -z "$2" ]; then
            echo -e "${RED}Usage: $0 start-hotfix <hotfix-name>${NC}"
            exit 1
        fi
        echo -e "${RED}🚨 Starting hotfix: $2${NC}"
        git checkout $MAIN_BRANCH
        git pull origin $MAIN_BRANCH
        git checkout -b "fix/$2"
        echo -e "${GREEN}✅ Created and switched to fix/$2${NC}"
        echo -e "${YELLOW}💡 Next steps:${NC}"
        echo -e "   1. Fix the critical issue"
        echo -e "   2. Run: $0 push (or $0 pr-main)"
        echo -e "   3. Create PR: fix/$2 → $MAIN_BRANCH"
        echo -e "${RED}⚠️  Remember to merge back to $DEVELOP_BRANCH after main merge${NC}"
        ;;

    # GitHub CLI Integration
    "pr"|"pull-request")
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" = "$MAIN_BRANCH" ] || [ "$CURRENT_BRANCH" = "$DEVELOP_BRANCH" ]; then
            echo -e "${RED}❌ Cannot create PR from $CURRENT_BRANCH branch${NC}"
            exit 1
        fi
        
        # Determine target branch
        if [[ "$CURRENT_BRANCH" == fix/* ]] && git merge-base --is-ancestor HEAD origin/$MAIN_BRANCH 2>/dev/null; then
            TARGET="$MAIN_BRANCH"
        else
            TARGET="$DEVELOP_BRANCH"
        fi
        
        echo -e "${GREEN}📝 Creating PR: $CURRENT_BRANCH → $TARGET${NC}"
        git push origin "$CURRENT_BRANCH"
        gh pr create --base "$TARGET" --head "$CURRENT_BRANCH" --web
        ;;
        
    "pr-main")
        CURRENT_BRANCH=$(git branch --show-current)
        echo -e "${GREEN}📝 Creating PR: $CURRENT_BRANCH → $MAIN_BRANCH${NC}"
        git push origin "$CURRENT_BRANCH"
        gh pr create --base "$MAIN_BRANCH" --head "$CURRENT_BRANCH" --web
        ;;
        
    "pr-status"|"prs")
        echo -e "${GREEN}📋 Pull Request Status${NC}"
        gh pr list --state open
        ;;
        
    "pr-view"|"prv")
        if [ -z "$2" ]; then
            gh pr view --web
        else
            gh pr view "$2" --web
        fi
        ;;

    # Development Commands
    "push"|"p")
        CURRENT_BRANCH=$(git branch --show-current)
        echo -e "${GREEN}⬆️  Pushing $CURRENT_BRANCH to origin${NC}"
        git push origin "$CURRENT_BRANCH"
        ;;
        
    "pull")
        CURRENT_BRANCH=$(git branch --show-current)
        echo -e "${GREEN}⬇️  Pulling $CURRENT_BRANCH from origin${NC}"
        git pull origin "$CURRENT_BRANCH"
        ;;
        
    "sync"|"sync-develop")
        echo -e "${GREEN}🔄 Syncing develop with main${NC}"
        git checkout $DEVELOP_BRANCH
        git pull origin $DEVELOP_BRANCH
        git merge origin/$MAIN_BRANCH
        git push origin $DEVELOP_BRANCH
        echo -e "${GREEN}✅ Develop branch synced with main${NC}"
        ;;

    # Testing and Development
    "test"|"t")
        echo -e "${GREEN}🧪 Running all tests${NC}"
        echo -e "${YELLOW}Frontend tests...${NC}"
        npm test -- --run
        echo -e "${YELLOW}Backend tests...${NC}"
        cd backend && pytest
        echo -e "${GREEN}✅ All tests completed${NC}"
        ;;
        
    "dev"|"start")
        echo -e "${GREEN}🚀 Starting development servers${NC}"
        echo -e "${YELLOW}💡 Starting backend in background...${NC}"
        python -m backend.app &
        BACKEND_PID=$!
        echo -e "${YELLOW}💡 Backend PID: $BACKEND_PID${NC}"
        echo -e "${YELLOW}💡 Starting frontend...${NC}"
        cd frontend && npm run dev
        ;;
        
    "backend"|"be")
        echo -e "${GREEN}🐍 Starting backend server${NC}"
        python -m backend.app
        ;;
        
    "frontend"|"fe")
        echo -e "${GREEN}⚛️  Starting frontend server${NC}"
        cd frontend && npm run dev
        ;;

    # Repository Management
    "status"|"st")
        print_header
        print_section "📊 Git Status"
        git status
        
        print_section "🌳 Branch Information"
        echo "Current branch: $(git branch --show-current)"
        echo "Recent commits:"
        git log --oneline -5
        
        print_section "📋 Pull Requests"
        if command -v gh &> /dev/null; then
            gh pr list --state open --limit 5 2>/dev/null || echo "No open PRs or GitHub CLI not authenticated"
        else
            echo "GitHub CLI not installed"
        fi
        
        print_section "🔄 Branch Status"
        git branch -v
        ;;
        
    "clean"|"cleanup")
        echo -e "${GREEN}🧹 Cleaning up merged branches${NC}"
        git checkout $DEVELOP_BRANCH
        git pull origin $DEVELOP_BRANCH
        
        # Get merged branches (excluding main, develop, and current branch)
        MERGED_BRANCHES=$(git branch --merged | grep -E "(feat/|fix/)" | grep -v "\*" | tr -d ' ')
        
        if [ -n "$MERGED_BRANCHES" ]; then
            echo -e "${YELLOW}Deleting merged branches:${NC}"
            echo "$MERGED_BRANCHES"
            echo "$MERGED_BRANCHES" | xargs git branch -d
            echo -e "${GREEN}✅ Local cleanup complete${NC}"
        else
            echo -e "${YELLOW}No merged branches to clean up${NC}"
        fi
        ;;

    # Release Management
    "release"|"rel")
        if [ -z "$2" ]; then
            echo -e "${RED}Usage: $0 release <version>${NC}"
            exit 1
        fi
        echo -e "${GREEN}📦 Preparing release: $2${NC}"
        git checkout $DEVELOP_BRANCH
        git pull origin $DEVELOP_BRANCH
        
        # Update version in package.json
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"$2\"/" frontend/package.json
        rm frontend/package.json.bak
        
        git add frontend/package.json
        git commit -m "chore: bump version to $2"
        git push origin $DEVELOP_BRANCH
        
        echo -e "${GREEN}✅ Version bumped to $2 in develop${NC}"
        echo -e "${YELLOW}💡 Next steps:${NC}"
        echo -e "   1. Run: $0 pr-main (create PR to main)"
        echo -e "   2. After merge, tag release: git tag -a v$2 -m 'Release v$2'"
        ;;

    # CI/CD Helpers
    "ci"|"workflow")
        echo -e "${GREEN}🔄 GitHub Actions Status${NC}"
        if command -v gh &> /dev/null; then
            gh run list --limit 10
        else
            echo "GitHub CLI not installed"
        fi
        ;;
        
    "logs"|"ci-logs")
        if [ -z "$2" ]; then
            echo -e "${GREEN}📋 Recent workflow runs:${NC}"
            gh run list --limit 5
        else
            echo -e "${GREEN}📋 Workflow logs for run $2:${NC}"
            gh run view "$2" --log
        fi
        ;;

    # Help and Information
    "help"|"h"|"")
        print_header
        echo -e "\n${GREEN}Available commands:${NC}\n"
        
        print_section "🌳 Git Flow"
        echo -e "  ${CYAN}start-feature, sf${NC} <name>   Start new feature branch"
        echo -e "  ${CYAN}start-fix, fix${NC} <name>      Start new fix branch"
        echo -e "  ${CYAN}start-hotfix, hotfix${NC} <name> Start hotfix branch"
        echo -e "  ${CYAN}sync, sync-develop${NC}         Sync develop with main"
        
        print_section "📝 GitHub Integration"
        echo -e "  ${CYAN}pr, pull-request${NC}           Create PR (auto-detects target)"
        echo -e "  ${CYAN}pr-main${NC}                    Create PR to main branch"
        echo -e "  ${CYAN}pr-status, prs${NC}             List open PRs"
        echo -e "  ${CYAN}pr-view, prv${NC} [number]      View PR in browser"
        
        print_section "🚀 Development"
        echo -e "  ${CYAN}push, p${NC}                    Push current branch"
        echo -e "  ${CYAN}pull${NC}                       Pull current branch"
        echo -e "  ${CYAN}test, t${NC}                    Run all tests"
        echo -e "  ${CYAN}dev, start${NC}                 Start both servers"
        echo -e "  ${CYAN}backend, be${NC}                Start backend only"
        echo -e "  ${CYAN}frontend, fe${NC}               Start frontend only"
        
        print_section "📊 Repository Management"
        echo -e "  ${CYAN}status, st${NC}                 Show comprehensive status"
        echo -e "  ${CYAN}clean, cleanup${NC}             Clean merged branches"
        echo -e "  ${CYAN}release, rel${NC} <version>     Prepare release"
        
        print_section "🔄 CI/CD"
        echo -e "  ${CYAN}ci, workflow${NC}               Show GitHub Actions status"
        echo -e "  ${CYAN}logs, ci-logs${NC} [run-id]     Show workflow logs"
        
        echo -e "\n${YELLOW}Examples:${NC}"
        echo -e "  $0 sf user-authentication"
        echo -e "  $0 fix search-bug"
        echo -e "  $0 pr"
        echo -e "  $0 release 1.3.0"
        echo -e "  $0 status"
        ;;
        
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo -e "${YELLOW}Run '$0 help' for available commands${NC}"
        exit 1
        ;;
esac
