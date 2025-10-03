#!/bin/bash

# Consolidated Production Setup Script for Pokehub Project
# Combines GitHub secrets and production secrets configuration
# Usage: ./scripts/setup/production-setup.sh [secrets|production|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Pokehub Production Setup${NC}"
echo "============================"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed. Please install it first:${NC}"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub. Please run: gh auth login${NC}"
    exit 1
fi

setup_github_secrets() {
    echo -e "${YELLOW}🔑 Setting up GitHub Secrets...${NC}"
    
    # Run the existing GitHub secrets setup
    if [ -f "$PROJECT_ROOT/scripts/setup-github-secrets.sh" ]; then
        echo "Running GitHub secrets setup..."
        "$PROJECT_ROOT/scripts/setup-github-secrets.sh"
    else
        echo -e "${RED}❌ GitHub secrets setup script not found${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ GitHub secrets setup completed${NC}"
}

setup_production_secrets() {
    echo -e "${YELLOW}🏭 Setting up Production Secrets...${NC}"
    
    # Run the existing production secrets setup
    if [ -f "$PROJECT_ROOT/scripts/setup-production-secrets.sh" ]; then
        echo "Running production secrets setup..."
        "$PROJECT_ROOT/scripts/setup-production-secrets.sh"
    else
        echo -e "${RED}❌ Production secrets setup script not found${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Production secrets setup completed${NC}"
}

case "${1:-all}" in
    "secrets")
        setup_github_secrets
        ;;
    "production")
        setup_production_secrets
        ;;
    "all")
        setup_github_secrets
        setup_production_secrets
        ;;
    *)
        echo "Usage: $0 [secrets|production|all]"
        echo ""
        echo "Commands:"
        echo "  secrets      - Set up GitHub repository secrets"
        echo "  production   - Set up production environment secrets"
        echo "  all          - Run both secrets and production setup (default)"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Production setup completed successfully!${NC}"
