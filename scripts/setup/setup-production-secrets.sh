#!/bin/bash

# Script to set up production secrets for Pokedex CI/CD pipeline

REPO_OWNER="grimm00"
REPO_NAME="pokedex"

echo "🔐 Setting up Production Secrets for Pokedex CI/CD Pipeline"
echo "=========================================================="

# Check if GitHub CLI is authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is authenticated"

# Generate secure random values
echo ""
echo "🔑 Generating secure random values..."

# Generate a strong JWT secret key (64 characters)
JWT_SECRET_KEY=$(openssl rand -hex 32)
echo "Generated JWT_SECRET_KEY: ${JWT_SECRET_KEY:0:20}..."

# Generate a strong database password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Generated DB_PASSWORD: ${DB_PASSWORD:0:10}..."

# Generate a strong Redis password
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Generated REDIS_PASSWORD: ${REDIS_PASSWORD:0:10}..."

echo ""
echo "📝 Production Configuration:"
echo "============================"

# Database configuration
echo "🗄️  Database:"
echo "   Type: PostgreSQL (recommended for production)"
echo "   Host: your-production-db-host.com"
echo "   Port: 5432"
echo "   Database: pokedex_production"
echo "   Username: pokedex_user"
echo "   Password: $DB_PASSWORD"
echo "   URL: postgresql://pokedex_user:$DB_PASSWORD@your-production-db-host.com:5432/pokedex_production"

echo ""
echo "🔴 Redis:"
echo "   Host: your-production-redis-host.com"
echo "   Port: 6379"
echo "   Password: $REDIS_PASSWORD"
echo "   URL: redis://:$REDIS_PASSWORD@your-production-redis-host.com:6379/0"

echo ""
echo "🔐 JWT Secret:"
echo "   Key: $JWT_SECRET_KEY"

echo ""
echo "🚀 Setting up GitHub Environment Secrets..."
echo "==========================================="

# Set production secrets
echo "Setting PRODUCTION_DATABASE_URL..."
gh secret set PRODUCTION_DATABASE_URL -b"postgresql://pokedex_user:$DB_PASSWORD@your-production-db-host.com:5432/pokedex_production" --env production --repo "$REPO_OWNER/$REPO_NAME"

echo "Setting PRODUCTION_REDIS_URL..."
gh secret set PRODUCTION_REDIS_URL -b"redis://:$REDIS_PASSWORD@your-production-redis-host.com:6379/0" --env production --repo "$REPO_OWNER/$REPO_NAME"

echo "Setting PRODUCTION_JWT_SECRET_KEY..."
gh secret set PRODUCTION_JWT_SECRET_KEY -b"$JWT_SECRET_KEY" --env production --repo "$REPO_OWNER/$REPO_NAME"

echo ""
echo "✅ Production secrets configured successfully!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Update the database and Redis URLs with your actual production hosts"
echo "2. Set up your production database and Redis instances"
echo "3. Configure your production environment protection rules"
echo "4. Test the production deployment"
echo ""
echo "🔧 To update secrets later:"
echo "   gh secret set SECRET_NAME -b\"new_value\" --env production --repo $REPO_OWNER/$REPO_NAME"
echo ""
echo "📊 To view current secrets:"
echo "   gh secret list --env production --repo $REPO_OWNER/$REPO_NAME"
echo ""
echo "🎉 Production CI/CD pipeline is ready!"
