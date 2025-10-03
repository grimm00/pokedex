#!/bin/bash

# Git Flow Helper Script for Pokehub Development
# Usage: ./scripts/git-flow-helper.sh [command] [branch-name]

set -e

MAIN_BRANCH="main"
DEVELOP_BRANCH="develop"

case "$1" in
    "start-feature")
        if [ -z "$2" ]; then
            echo "Usage: $0 start-feature <feature-name>"
            exit 1
        fi
        echo "🚀 Starting new feature: $2"
        git checkout $DEVELOP_BRANCH
        git pull origin $DEVELOP_BRANCH
        git checkout -b "feat/$2"
        echo "✅ Created and switched to feat/$2"
        echo "💡 When ready, create PR: feat/$2 → $DEVELOP_BRANCH"
        ;;
        
    "start-fix")
        if [ -z "$2" ]; then
            echo "Usage: $0 start-fix <fix-name>"
            exit 1
        fi
        echo "🐛 Starting new fix: $2"
        git checkout $DEVELOP_BRANCH
        git pull origin $DEVELOP_BRANCH
        git checkout -b "fix/$2"
        echo "✅ Created and switched to fix/$2"
        echo "💡 When ready, create PR: fix/$2 → $DEVELOP_BRANCH"
        ;;
        
    "start-hotfix")
        if [ -z "$2" ]; then
            echo "Usage: $0 start-hotfix <hotfix-name>"
            exit 1
        fi
        echo "🚨 Starting hotfix: $2"
        git checkout $MAIN_BRANCH
        git pull origin $MAIN_BRANCH
        git checkout -b "fix/$2"
        echo "✅ Created and switched to fix/$2"
        echo "💡 When ready, create PR: fix/$2 → $MAIN_BRANCH"
        echo "⚠️  Remember to also merge to $DEVELOP_BRANCH after main merge"
        ;;
        
    "sync-develop")
        echo "🔄 Syncing develop with main..."
        git checkout $DEVELOP_BRANCH
        git pull origin $DEVELOP_BRANCH
        git merge origin/$MAIN_BRANCH
        git push origin $DEVELOP_BRANCH
        echo "✅ Develop branch synced with main"
        ;;
        
    "prepare-release")
        if [ -z "$2" ]; then
            echo "Usage: $0 prepare-release <version>"
            exit 1
        fi
        echo "📦 Preparing release: $2"
        git checkout $DEVELOP_BRANCH
        git pull origin $DEVELOP_BRANCH
        
        # Update version in package.json
        sed -i.bak "s/\"version\": \".*\"/\"version\": \"$2\"/" frontend/package.json
        rm frontend/package.json.bak
        
        git add frontend/package.json
        git commit -m "chore: bump version to $2"
        git push origin $DEVELOP_BRANCH
        
        echo "✅ Version bumped to $2 in develop"
        echo "💡 Create PR: $DEVELOP_BRANCH → $MAIN_BRANCH"
        echo "💡 After merge, tag release: git tag -a v$2 -m 'Release v$2'"
        ;;
        
    "status")
        echo "📊 Git Flow Status:"
        echo ""
        echo "Current branch: $(git branch --show-current)"
        echo ""
        echo "Branch status:"
        git branch -v
        echo ""
        echo "Recent commits on main:"
        git log --oneline -5 $MAIN_BRANCH
        echo ""
        echo "Recent commits on develop:"
        git log --oneline -5 $DEVELOP_BRANCH
        ;;
        
    *)
        echo "🌳 Pokehub Git Flow Helper"
        echo ""
        echo "Available commands:"
        echo "  start-feature <name>   - Start new feature branch from develop"
        echo "  start-fix <name>       - Start new fix branch from develop"  
        echo "  start-hotfix <name>    - Start hotfix branch from main"
        echo "  sync-develop           - Sync develop with main"
        echo "  prepare-release <ver>  - Prepare release with version bump"
        echo "  status                 - Show current git flow status"
        echo ""
        echo "Examples:"
        echo "  $0 start-feature user-profiles"
        echo "  $0 start-fix broken-search"
        echo "  $0 start-hotfix security-patch"
        echo "  $0 prepare-release 1.3.0"
        ;;
esac
