#!/bin/bash

# GitHub Secrets Setup Script for Pokehub Project
# This script helps you set up GitHub secrets for CI/CD deployment

set -e

echo "🔧 GitHub Secrets Setup for Pokehub Project"
echo "=============================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"

# Check if we're in the right repository
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
if [ "$REPO" != "grimm00/pokehub" ]; then
    echo "❌ Not in the correct repository. Current: $REPO, Expected: grimm00/pokehub"
    echo "ℹ️  Note: If you haven't renamed the GitHub repo yet, update this script or rename the repo first"
    exit 1
fi

echo "✅ Repository confirmed: $REPO"

# Function to set secret with confirmation
set_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    echo ""
    echo "Setting secret: $secret_name"
    echo "Description: $description"
    echo "Value: ${secret_value:0:20}..."
    
    read -p "Do you want to set this secret? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$secret_value" | gh secret set "$secret_name"
        echo "✅ Secret $secret_name set successfully"
    else
        echo "⏭️  Skipped $secret_name"
    fi
}

# Generate secure random values
JWT_SECRET=$(openssl rand -base64 32)
FLASK_SECRET=$(openssl rand -base64 32)

echo ""
echo "🔐 Generated secure random values:"
echo "JWT_SECRET_KEY: ${JWT_SECRET:0:20}..."
echo "SECRET_KEY: ${FLASK_SECRET:0:20}..."

echo ""
echo "📋 Setting up GitHub secrets..."
echo "You can modify any values before confirming."

# Set up secrets
set_secret "DATABASE_URL" "sqlite:///backend/instance/pokehub_dev.db" "SQLite database connection string"
set_secret "JWT_SECRET_KEY" "$JWT_SECRET" "JWT signing key for authentication tokens"
set_secret "REDIS_URL" "redis://localhost:6379/0" "Redis connection string for caching"
set_secret "SECRET_KEY" "$FLASK_SECRET" "Flask secret key for sessions"
set_secret "POKEAPI_BASE_URL" "https://pokeapi.co/api/v2" "PokeAPI base URL for Pokemon data"

echo ""
echo "🔍 Verifying secrets..."

# List all secrets
echo "Current secrets in repository:"
gh secret list

echo ""
echo "✅ GitHub secrets setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/grimm00/pokehub/settings/actions"
echo "2. Set workflow permissions to 'Read and write'"
echo "3. Create 'staging' and 'production' environments"
echo "4. Re-run the failed workflows to test the configuration"
echo ""
echo "For detailed instructions, see: admin/technical/quick-reference/github-setup-guide.md"
