#!/bin/bash

# Comprehensive Workflow Helper for Pokehub Development
# Integrates Git Flow, GitHub CLI, and development shortcuts
# Usage: ./scripts/workflow-helper.sh [command] [args...]

set -e

# Get the script directory for relative imports
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source Git Flow utilities for safe Git operations
if [ -f "$SCRIPT_DIR/core/git-flow-utils.sh" ]; then
    source "$SCRIPT_DIR/core/git-flow-utils.sh"
    gf_init_git_flow_utils >/dev/null 2>&1
else
    echo "❌ Error: git-flow-utils.sh not found. Please ensure all Git Flow scripts are properly installed."
    exit 1
fi

# Use Git Flow configuration
MAIN_BRANCH="$GF_MAIN_BRANCH"
DEVELOP_BRANCH="$GF_DEVELOP_BRANCH"
PROJECT_DIR="/Users/cdwilson/Projects/pokedex"

# Colors for output (only if terminal supports it)
if [[ -t 1 ]] && command -v tput >/dev/null 2>&1; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    PURPLE=$(tput setaf 5)
    CYAN=$(tput setaf 6)
    BOLD=$(tput bold)
    NC=$(tput sgr0) # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    PURPLE=''
    CYAN=''
    BOLD=''
    NC=''
fi

# Ensure we're in the project directory
cd "$PROJECT_DIR"

print_header() {
    echo "${PURPLE}🚀 Pokehub Workflow Helper${NC}"
    echo "${CYAN}═══════════════════════════════════════${NC}"
}

print_section() {
    echo ""
    echo "${BLUE}$1${NC}"
    echo "${CYAN}───────────────────────────────────────${NC}"
}

case "$1" in
    # Git Flow Commands
    "start-feature"|"sf")
        if [ -z "$2" ]; then
            echo "${RED}Usage: $0 start-feature <feature-name>${NC}"
            exit 1
        fi
        
        # Run safety checks first
        echo "${CYAN}🛡️  Running pre-flight safety checks...${NC}"
        if ! ./scripts/core/git-flow-safety.sh check; then
            echo "${RED}❌ Safety checks failed. Please resolve issues before starting new feature.${NC}"
            echo "${YELLOW}💡 Run: $0 safety-fix for suggestions${NC}"
            exit 1
        fi
        
        echo "${GREEN}🌱 Starting new feature: $2${NC}"
        gf_git_checkout $DEVELOP_BRANCH
        gf_git_pull origin $DEVELOP_BRANCH
        gf_git_checkout "feat/$2" true
        echo "${GREEN}✅ Created and switched to feat/$2${NC}"
        echo "${YELLOW}💡 Next steps:${NC}"
        echo "   1. Make your changes"
        echo "   2. Run: $0 push (or $0 pr to create PR)"
        echo "   3. Create PR: feat/$2 → $DEVELOP_BRANCH"
        ;;
        
    "start-fix"|"fix")
        if [ -z "$2" ]; then
            echo "${RED}Usage: $0 start-fix <fix-name>${NC}"
            exit 1
        fi
        echo "${GREEN}🐛 Starting new fix: $2${NC}"
        gf_git_checkout $DEVELOP_BRANCH
        gf_git_pull origin $DEVELOP_BRANCH
        gf_git_checkout "fix/$2" true
        echo "${GREEN}✅ Created and switched to fix/$2${NC}"
        echo "${YELLOW}💡 Next steps:${NC}"
        echo "   1. Fix the issue"
        echo "   2. Run: $0 push (or $0 pr to create PR)"
        echo "   3. Create PR: fix/$2 → $DEVELOP_BRANCH"
        ;;
        
    "start-chore"|"chore")
        if [ -z "$2" ]; then
            echo "${RED}Usage: $0 start-chore <chore-name>${NC}"
            exit 1
        fi
        echo "${GREEN}🔧 Starting new chore: $2${NC}"
        gf_git_checkout $DEVELOP_BRANCH
        gf_git_pull origin $DEVELOP_BRANCH
        gf_git_checkout "chore/$2" true
        echo "${GREEN}✅ Created and switched to chore/$2${NC}"
        echo "${YELLOW}💡 Next steps:${NC}"
        echo "   1. Complete the maintenance task"
        echo "   2. Run: $0 push (or $0 pr to create PR)"
        echo "   3. Create PR: chore/$2 → $DEVELOP_BRANCH"
        echo "${CYAN}💡 Common chore tasks: dependencies, docs, refactoring, cleanup${NC}"
        ;;
        
    "start-hotfix"|"hotfix")
        if [ -z "$2" ]; then
            echo "${RED}Usage: $0 start-hotfix <hotfix-name>${NC}"
            exit 1
        fi
        echo "${RED}🚨 Starting hotfix: $2${NC}"
        gf_git_checkout $MAIN_BRANCH
        gf_git_pull origin $MAIN_BRANCH
        gf_git_checkout "fix/$2" true
        echo "${GREEN}✅ Created and switched to fix/$2${NC}"
        echo "${YELLOW}💡 Next steps:${NC}"
        echo "   1. Fix the critical issue"
        echo "   2. Run: $0 push (or $0 pr-main)"
        echo "   3. Create PR: fix/$2 → $MAIN_BRANCH"
        echo "${RED}⚠️  Remember to merge back to $DEVELOP_BRANCH after main merge${NC}"
        ;;

    # GitHub CLI Integration
    "pr"|"pull-request")
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" = "$MAIN_BRANCH" ] || [ "$CURRENT_BRANCH" = "$DEVELOP_BRANCH" ]; then
            echo "${RED}❌ Cannot create PR from $CURRENT_BRANCH branch${NC}"
            exit 1
        fi
        
        # Determine target branch
        if [[ "$CURRENT_BRANCH" == fix/* ]] && git merge-base --is-ancestor HEAD origin/$MAIN_BRANCH 2>/dev/null; then
            TARGET="$MAIN_BRANCH"
        else
            TARGET="$DEVELOP_BRANCH"
        fi
        
        echo "${GREEN}📝 Creating PR: $CURRENT_BRANCH → $TARGET${NC}"
        gf_git_push origin "$CURRENT_BRANCH"
        gh pr create --base "$TARGET" --head "$CURRENT_BRANCH" --web
        ;;
        
    "pr-main")
        CURRENT_BRANCH=$(git branch --show-current)
        echo "${GREEN}📝 Creating PR: $CURRENT_BRANCH → $MAIN_BRANCH${NC}"
        gf_git_push origin "$CURRENT_BRANCH"
        gh pr create --base "$MAIN_BRANCH" --head "$CURRENT_BRANCH" --web
        ;;
        
    "pr-status"|"prs")
        echo "${GREEN}📋 Pull Request Status${NC}"
        PAGER="" gh pr list --state open
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
        echo "${GREEN}⬆️  Pushing $CURRENT_BRANCH to origin${NC}"
        gf_git_push origin "$CURRENT_BRANCH"
        ;;
        
    "pull")
        CURRENT_BRANCH=$(git branch --show-current)
        echo "${GREEN}⬇️  Pulling $CURRENT_BRANCH from origin${NC}"
        gf_git_pull origin "$CURRENT_BRANCH"
        ;;
        
    "sync"|"sync-develop")
        echo "${GREEN}🔄 Syncing develop with main${NC}"
        gf_git_checkout $DEVELOP_BRANCH
        gf_git_pull origin $DEVELOP_BRANCH
        gf_git_merge origin/$MAIN_BRANCH
        gf_git_push origin $DEVELOP_BRANCH
        echo "${GREEN}✅ Develop branch synced with main${NC}"
        ;;

    # Testing and Development
    "test"|"t")
        echo "${GREEN}🧪 Running all tests${NC}"
        echo "${YELLOW}Frontend tests...${NC}"
        npm test -- --run
        echo "${YELLOW}Backend tests...${NC}"
        cd backend && pytest
        echo "${GREEN}✅ All tests completed${NC}"
        ;;
        
    "dev"|"start")
        echo "${GREEN}🚀 Starting development servers${NC}"
        echo "${YELLOW}💡 Starting backend in background...${NC}"
        python -m backend.app &
        BACKEND_PID=$!
        echo "${YELLOW}💡 Backend PID: $BACKEND_PID${NC}"
        echo "${YELLOW}💡 Starting frontend...${NC}"
        cd frontend && npm run dev
        ;;
        
    "backend"|"be")
        echo "${GREEN}🐍 Starting backend server${NC}"
        python -m backend.app
        ;;
        
    "frontend"|"fe")
        echo "${GREEN}⚛️  Starting frontend server${NC}"
        cd frontend && npm run dev
        ;;

    # Git Flow Safety
    "safety"|"check"|"safe")
        echo "${GREEN}🛡️  Running Git Flow safety checks${NC}"
        ./scripts/core/git-flow-safety.sh check
        ;;
        
    "safety-fix"|"fix")
        echo "${GREEN}🔧 Git Flow auto-fix suggestions${NC}"
        ./scripts/core/git-flow-safety.sh fix
        ;;
        
    "install-hooks"|"hooks")
        echo "${GREEN}🪝 Installing Git Flow safety hooks${NC}"
        ./scripts/setup/install-git-hooks.sh
        ;;

    # Repository Management
    "status"|"st")
        OUTPUT_FILE=""
        if [ "$2" = "--export" ] || [ "$2" = "-e" ]; then
            OUTPUT_FILE="${3:-status-$(date +%Y%m%d-%H%M%S).txt}"
            echo "${GREEN}📄 Exporting status to: $OUTPUT_FILE${NC}"
        fi
        
        # Function to generate status output
        generate_status() {
            print_header
            print_section "📊 Git Status"
            git --no-pager status --porcelain=v1 2>/dev/null || git --no-pager status
            
            print_section "🌳 Branch Information"
            echo "Current branch: $(git branch --show-current)"
            echo "Recent commits:"
            git --no-pager log --oneline -5
            
            print_section "📋 Pull Requests"
            if command -v gh &> /dev/null; then
                PAGER="" gh pr list --state open --limit 5 2>/dev/null || echo "No open PRs or GitHub CLI not authenticated"
            else
                echo "GitHub CLI not installed"
            fi
            
            print_section "🔄 Branch Status"
            git --no-pager branch -v 
            
            print_section "📊 Repository Statistics"
            echo "Total commits: $(git rev-list --count HEAD 2>/dev/null || echo 'N/A')"
            echo "Contributors: $(git shortlog -sn --all | wc -l | tr -d ' ')"
            echo "Last commit: $(git --no-pager log -1 --format='%cr by %an'  2>/dev/null || echo 'N/A')"
        }
        
        if [ -n "$OUTPUT_FILE" ]; then
            # Export to file (without colors)
            RED='' GREEN='' YELLOW='' BLUE='' PURPLE='' CYAN='' BOLD='' NC=''
            generate_status > "$OUTPUT_FILE"
            echo "${GREEN}✅ Status exported to: $OUTPUT_FILE${NC}"
        else
            # Display to terminal (with colors)
            generate_status
        fi
        ;;
        
    "export-status"|"export")
        OUTPUT_FILE="${2:-status-$(date +%Y%m%d-%H%M%S).txt}"
        echo "${GREEN}📄 Exporting comprehensive status to: $OUTPUT_FILE${NC}"
        
        # Generate comprehensive status without colors
        RED='' GREEN='' YELLOW='' BLUE='' PURPLE='' CYAN='' BOLD='' NC=''
        {
            print_header
            print_section "📊 Git Status"
            git --no-pager status
            
            print_section "🌳 Branch Information"
            echo "Current branch: $(git branch --show-current)"
            echo "Recent commits:"
            git --no-pager log --oneline -10 
            
            print_section "📋 Pull Requests"
            if command -v gh &> /dev/null; then
                PAGER="" gh pr list --state all --limit 10 2>/dev/null || echo "No PRs or GitHub CLI not authenticated"
            else
                echo "GitHub CLI not installed"
            fi
            
            print_section "🔄 All Branches"
            git --no-pager branch -a -v 
            
            print_section "📊 Repository Statistics"
            echo "Total commits: $(git rev-list --count HEAD 2>/dev/null || echo 'N/A')"
            echo "Contributors: $(git shortlog -sn --all | wc -l | tr -d ' ')"
            echo "Repository size: $(du -sh . 2>/dev/null | cut -f1 || echo 'N/A')"
            echo "Last commit: $(git --no-pager log -1 --format='%cr by %an (%h)'  2>/dev/null || echo 'N/A')"
            
            print_section "🏷️ Recent Tags"
            git tag --sort=-version:refname | head -5 || echo "No tags found"
            
            print_section "📈 Commit Activity (Last 7 days)"
            git --no-pager log --since="7 days ago" --oneline  | wc -l | xargs echo "Commits in last 7 days:"
            
            echo ""
            echo "Generated on: $(date)"
            echo "Generated by: Pokehub Workflow Helper"
        } > "$OUTPUT_FILE"
        
        echo "${GREEN}✅ Comprehensive status exported to: $OUTPUT_FILE${NC}"
        echo "${YELLOW}💡 View with: cat $OUTPUT_FILE${NC}"
        ;;
        
    "clean"|"cleanup")
        # Check for --yes flag or CI environment for non-interactive mode
        FORCE_YES=false
        if [ "$2" = "--yes" ] || [ "$2" = "-y" ] || [ -n "${CI:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]; then
            FORCE_YES=true
            if [ -n "${CI:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]; then
                echo "${GREEN}🧹 Cleaning up merged branches (CI environment detected - auto-confirming)${NC}"
            else
                echo "${GREEN}🧹 Cleaning up merged branches (non-interactive mode)${NC}"
            fi
        else
            echo "${GREEN}🧹 Cleaning up merged branches${NC}"
        fi
        
        gf_git_checkout $DEVELOP_BRANCH
        gf_git_pull origin $DEVELOP_BRANCH
        
        # Clean up local branches
        echo "${CYAN}🔍 Checking local branches...${NC}"
        MERGED_BRANCHES=$(git branch --merged | grep -E "(feat/|fix/|chore/)" | grep -v "\*" | tr -d ' ')
        
        if [ -n "$MERGED_BRANCHES" ]; then
            echo "${YELLOW}Deleting local merged branches:${NC}"
            echo "$MERGED_BRANCHES"
            echo "$MERGED_BRANCHES" | xargs git branch -d
            echo "${GREEN}✅ Local cleanup complete${NC}"
        else
            echo "${YELLOW}No local merged branches to clean up${NC}"
        fi
        
        # Clean up remote branches
        echo "${CYAN}🔍 Checking remote branches...${NC}"
        
        # Fetch and prune to sync with remote
        gf_git_fetch origin
        
        # Get remote branches that are merged into develop
        REMOTE_MERGED_BRANCHES=$(git branch -r --merged origin/$DEVELOP_BRANCH | grep -E "origin/(feat/|fix/|chore/)" | sed 's|origin/||' | tr -d ' ')
        
        if [ -n "$REMOTE_MERGED_BRANCHES" ]; then
            echo "${YELLOW}Found merged remote branches:${NC}"
            echo "$REMOTE_MERGED_BRANCHES"
            
            # Handle confirmation based on mode
            if [ "$FORCE_YES" = true ]; then
                echo "${YELLOW}Auto-confirming remote branch deletion (--yes flag)${NC}"
                CONFIRM="y"
            else
                # Ask for confirmation before deleting remote branches
                echo "${YELLOW}⚠️  Delete these remote branches? (y/N):${NC}"
                read -r CONFIRM
            fi
            
            if [[ $CONFIRM =~ ^[Yy]$ ]]; then
                echo "${YELLOW}Deleting remote merged branches...${NC}"
                echo "$REMOTE_MERGED_BRANCHES" | while read -r branch; do
                    if ! gf_git_safe "git push origin --delete $branch" "Deleting remote branch $branch" false; then
                        echo "${YELLOW}⚠️  Failed to delete remote branch: $branch${NC}"
                    fi
                done
                echo "${GREEN}✅ Remote cleanup complete${NC}"
            else
                echo "${YELLOW}Skipped remote branch deletion${NC}"
            fi
        else
            echo "${YELLOW}No remote merged branches to clean up${NC}"
        fi
        
        echo "${GREEN}🎉 Branch cleanup complete!${NC}"
        ;;

    # Release Management
    "release"|"rel")
        if [ -z "$2" ]; then
            echo "${RED}Usage: $0 release <version>${NC}"
            exit 1
        fi
        echo "${GREEN}📦 Preparing release: $2${NC}"
        gf_git_checkout $DEVELOP_BRANCH
        gf_git_pull origin $DEVELOP_BRANCH
        
        # Update version in package.json
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"$2\"/" frontend/package.json
        rm frontend/package.json.bak
        
        git add frontend/package.json
        git commit -m "chore: bump version to $2"
        gf_git_push origin $DEVELOP_BRANCH
        
        echo "${GREEN}✅ Version bumped to $2 in develop${NC}"
        echo "${YELLOW}💡 Next steps:${NC}"
        echo "   1. Run: $0 pr-main (create PR to main)"
        echo "   2. After merge, tag release: git tag -a v$2 -m 'Release v$2'"
        ;;

    # CI/CD Helpers
    "ci"|"workflow")
        echo "${GREEN}🔄 GitHub Actions Status${NC}"
        if command -v gh &> /dev/null; then
            gh run list --limit 10
        else
            echo "GitHub CLI not installed"
        fi
        ;;
        
    "logs"|"ci-logs")
        if [ -z "$2" ]; then
            echo "${GREEN}📋 Recent workflow runs:${NC}"
            gh run list --limit 5
        else
            echo "${GREEN}📋 Workflow logs for run $2:${NC}"
            gh run view "$2" --log
        fi
        ;;

    # Help and Information
    "help"|"h"|"")
        print_header
        echo ""
        echo "${GREEN}Available commands:${NC}"
        echo ""
        
        print_section "🌳 Git Flow"
        echo "  ${CYAN}start-feature, sf${NC} <name>   Start new feature branch (with safety checks)"
        echo "  ${CYAN}start-fix, fix${NC} <name>      Start new fix branch"
        echo "  ${CYAN}start-chore, chore${NC} <name>  Start new chore branch"
        echo "  ${CYAN}start-hotfix, hotfix${NC} <name> Start hotfix branch"
        echo "  ${CYAN}sync, sync-develop${NC}         Sync develop with main"
        echo ""
        echo "  ${CYAN}safety, check, safe${NC}        Run Git Flow safety checks"
        echo "  ${CYAN}safety-fix${NC}                 Show auto-fix suggestions"
        echo "  ${CYAN}install-hooks, hooks${NC}       Install Git Flow safety hooks"
        
        print_section "📝 GitHub Integration"
        echo "  ${CYAN}pr, pull-request${NC}           Create PR (auto-detects target)"
        echo "  ${CYAN}pr-main${NC}                    Create PR to main branch"
        echo "  ${CYAN}pr-status, prs${NC}             List open PRs"
        echo "  ${CYAN}pr-view, prv${NC} [number]      View PR in browser"
        
        print_section "🚀 Development"
        echo "  ${CYAN}push, p${NC}                    Push current branch"
        echo "  ${CYAN}pull${NC}                       Pull current branch"
        echo "  ${CYAN}test, t${NC}                    Run all tests"
        echo "  ${CYAN}dev, start${NC}                 Start both servers"
        echo "  ${CYAN}backend, be${NC}                Start backend only"
        echo "  ${CYAN}frontend, fe${NC}               Start frontend only"
        
        print_section "📊 Repository Management"
        echo "  ${CYAN}status, st${NC}                 Show comprehensive status"
        echo "  ${CYAN}status --export${NC} [file]     Export status to file"
        echo "  ${CYAN}export-status${NC} [file]       Export detailed status report"
        echo "  ${CYAN}clean, cleanup${NC} [--yes]     Clean merged branches (local + remote with confirmation)"
        echo "    ${YELLOW}--yes, -y${NC}                 Skip confirmation prompts (for CI/automation)"
        echo "    ${YELLOW}Note:${NC} Auto-confirms in CI environments (CI, GITHUB_ACTIONS)"
        echo "  ${CYAN}release, rel${NC} <version>     Prepare release"
        
        print_section "🔄 CI/CD"
        echo "  ${CYAN}ci, workflow${NC}               Show GitHub Actions status"
        echo "  ${CYAN}logs, ci-logs${NC} [run-id]     Show workflow logs"
        
        echo ""
        echo "${YELLOW}Examples:${NC}"
        echo "  $0 sf user-authentication"
        echo "  $0 fix search-bug"
        echo "  $0 chore update-dependencies"
        echo "  $0 pr"
        echo "  $0 release 1.3.0"
        echo "  $0 status"
        echo "  $0 status --export my-status.txt"
        echo "  $0 export-status detailed-report.txt"
        ;;
        
    *)
        echo "${RED}❌ Unknown command: $1${NC}"
        echo "${YELLOW}Run '$0 help' for available commands${NC}"
        exit 1
        ;;
esac
