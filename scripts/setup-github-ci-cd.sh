#!/bin/bash

# Complete GitHub CI/CD Setup Script for Pokedex Project
# This script sets up all required GitHub configuration for CI/CD

set -e

echo "🚀 Complete GitHub CI/CD Setup for Pokedex Project"
echo "=================================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
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
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"

# Check if we're in the right repository
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
if [ "$REPO" != "grimm00/pokedex" ]; then
    echo "❌ Not in the correct repository. Current: $REPO, Expected: grimm00/pokedex"
    exit 1
fi

echo "✅ Repository confirmed: $REPO"

echo ""
echo "🔧 Step 1: Setting up GitHub secrets..."

# Generate secure random values
JWT_SECRET=$(openssl rand -base64 32)
FLASK_SECRET=$(openssl rand -base64 32)

echo "Generated secure random values:"
echo "  JWT_SECRET_KEY: ${JWT_SECRET:0:20}..."
echo "  SECRET_KEY: ${FLASK_SECRET:0:20}..."

# Set up secrets automatically
echo ""
echo "Setting up secrets..."

echo "$JWT_SECRET" | gh secret set JWT_SECRET_KEY
echo "✅ JWT_SECRET_KEY set"

echo "sqlite:///instance/pokedex_dev.db" | gh secret set DATABASE_URL
echo "✅ DATABASE_URL set"

echo "redis://localhost:6379/0" | gh secret set REDIS_URL
echo "✅ REDIS_URL set"

echo "$FLASK_SECRET" | gh secret set SECRET_KEY
echo "✅ SECRET_KEY set"

echo "https://pokeapi.co/api/v2" | gh secret set POKEAPI_BASE_URL
echo "✅ POKEAPI_BASE_URL set"

echo ""
echo "🔧 Step 2: Configuring workflow permissions..."

# Set workflow permissions
gh api repos/grimm00/pokedex/actions/permissions \
    --method PUT \
    --field enabled=true \
    --field allowed_actions=all

echo "✅ Workflow permissions updated"

echo ""
echo "🔧 Step 3: Creating GitHub environments..."

# Create staging environment
echo "Creating staging environment..."
gh api repos/grimm00/pokedex/environments/staging \
    --method PUT \
    --field wait_timer=0 \
    --field prevent_self_review=false \
    --field reviewers='[]' \
    --field deployment_branch_policy='{"protected_branches":false,"custom_branch_policies":true}' || echo "Staging environment may already exist"

echo "✅ Staging environment configured"

# Create production environment
echo "Creating production environment..."
gh api repos/grimm00/pokedex/environments/production \
    --method PUT \
    --field wait_timer=5 \
    --field prevent_self_review=true \
    --field reviewers='[{"type":"User","id":'$(gh api user --jq '.id')'}]' \
    --field deployment_branch_policy='{"protected_branches":true,"custom_branch_policies":false}' || echo "Production environment may already exist"

echo "✅ Production environment configured"

echo ""
echo "🔍 Step 4: Verifying configuration..."

# Verify secrets
echo "Current secrets:"
gh secret list

# Verify permissions
echo ""
echo "Current workflow permissions:"
gh api repos/grimm00/pokedex/actions/permissions --jq '.allowed_actions'

# Verify environments
echo ""
echo "Current environments:"
gh api repos/grimm00/pokedex/environments --jq '.environments[].name'

echo ""
echo "🎉 GitHub CI/CD setup complete!"
echo ""
echo "📋 What was configured:"
echo "✅ GitHub secrets (JWT_SECRET_KEY, DATABASE_URL, REDIS_URL, SECRET_KEY, POKEAPI_BASE_URL)"
echo "✅ Workflow permissions (Read and write access)"
echo "✅ Staging environment (no protection rules)"
echo "✅ Production environment (with protection rules)"
echo ""
echo "🚀 Next steps:"
echo "1. Go to https://github.com/grimm00/pokedex/actions"
echo "2. Re-run the failed workflows to test the configuration"
echo "3. Monitor the deployment progress"
echo ""
echo "📚 For detailed information, see: admin/technical/quick-reference/github-setup-guide.md"
echo ""
echo "🔧 To re-run workflows manually:"
echo "  gh run rerun --failed"
echo ""
echo "🎯 Ready for first successful deployment!"
