#!/bin/bash

# Consolidated GitHub Setup Script for Pokehub Project
# Combines CI/CD setup and permissions configuration
# Usage: ./scripts/setup/github-setup.sh [permissions|ci-cd|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Pokehub GitHub Setup${NC}"
echo "=========================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed. Please install it first:${NC}"
    echo "   https://cli.github.com/"
    echo ""
    echo "Installation instructions:"
    echo "  macOS: brew install gh"
    echo "  Linux: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "  Windows: winget install GitHub.cli"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub. Please run: gh auth login${NC}"
    exit 1
fi

setup_permissions() {
    echo -e "${YELLOW}🔧 Configuring GitHub Actions Permissions...${NC}"
    
    echo "Setting up repository permissions for GitHub Actions..."
    echo "Please ensure the following permissions are enabled in your repository:"
    echo ""
    echo "1. Go to: https://github.com/grimm00/pokehub/settings/actions"
    echo "2. Under 'Actions permissions', select 'Allow all actions and reusable workflows'"
    echo "3. Under 'Workflow permissions', select 'Read and write permissions'"
    echo "4. Check 'Allow GitHub Actions to create and approve pull requests'"
    echo ""
    
    read -p "Press Enter when you have configured these settings..."
    echo -e "${GREEN}✅ Permissions configuration completed${NC}"
}

setup_ci_cd() {
    echo -e "${YELLOW}🔄 Setting up CI/CD Configuration...${NC}"
    
    # Run the existing setup scripts
    if [ -f "$PROJECT_ROOT/scripts/setup-github-ci-cd.sh" ]; then
        echo "Running CI/CD setup..."
        "$PROJECT_ROOT/scripts/setup-github-ci-cd.sh"
    else
        echo -e "${RED}❌ CI/CD setup script not found${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ CI/CD setup completed${NC}"
}

case "${1:-all}" in
    "permissions")
        setup_permissions
        ;;
    "ci-cd")
        setup_ci_cd
        ;;
    "all")
        setup_permissions
        setup_ci_cd
        ;;
    *)
        echo "Usage: $0 [permissions|ci-cd|all]"
        echo ""
        echo "Commands:"
        echo "  permissions  - Configure GitHub Actions permissions"
        echo "  ci-cd        - Set up CI/CD workflows"
        echo "  all          - Run both permissions and CI/CD setup (default)"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 GitHub setup completed successfully!${NC}"
