#!/bin/bash

# GitHub Permissions Configuration Script for Pokedex Project
# This script helps you configure GitHub Actions permissions

set -e

echo "🔧 GitHub Permissions Configuration for Pokedex Project"
echo "======================================================"

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
if [ "$REPO" != "grimm00/pokedex" ]; then
    echo "❌ Not in the correct repository. Current: $REPO, Expected: grimm00/pokedex"
    exit 1
fi

echo "✅ Repository confirmed: $REPO"

echo ""
echo "📋 Configuring GitHub Actions permissions..."

# Check current permissions
echo "Current workflow permissions:"
gh api repos/grimm00/pokedex/actions/permissions

echo ""
echo "🔧 Setting workflow permissions to 'Read and write'..."

# Set workflow permissions
gh api repos/grimm00/pokedex/actions/permissions \
    --method PUT \
    --field enabled=true \
    --field allowed_actions=all

echo "✅ Workflow permissions updated successfully!"

echo ""
echo "🔍 Verifying permissions..."

# Verify permissions
CURRENT_PERMS=$(gh api repos/grimm00/pokedex/actions/permissions --jq '.allowed_actions')
echo "Current allowed actions: $CURRENT_PERMS"

if [ "$CURRENT_PERMS" = "all" ]; then
    echo "✅ Permissions configured correctly!"
else
    echo "❌ Permissions may not be set correctly. Please check manually."
fi

echo ""
echo "📋 Next steps:"
echo "1. Go to https://github.com/grimm00/pokedex/settings/environments"
echo "2. Create 'staging' environment (no protection rules needed)"
echo "3. Create 'production' environment (with protection rules)"
echo "4. Re-run the failed workflows to test the configuration"
echo ""
echo "For detailed instructions, see: admin/technical/quick-reference/github-setup-guide.md"
