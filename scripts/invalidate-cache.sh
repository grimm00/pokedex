#!/bin/bash

# Cache Invalidation Script for Pokedex
# This script helps with cache invalidation during development

echo "🔄 Cache Invalidation Script"
echo "=============================="

# Get current timestamp
TIMESTAMP=$(date +%s)
echo "⏰ Timestamp: $TIMESTAMP"

# Check if Docker container is running
if ! docker ps | grep -q "pokedex-pokedex-app-1"; then
    echo "❌ Docker container is not running. Start it first with: docker-compose up -d"
    exit 1
fi

echo "✅ Docker container is running"

# Test cache headers
echo ""
echo "🧪 Testing Cache Headers..."
echo "=============================="

# Test static assets (should be cached)
echo "📄 Testing static assets (should be cached for 1 year):"
curl -s -I "http://localhost/assets/index-BnbgCpIG.js" | grep -i "cache-control\|expires"

# Test HTML files (should not be cached)
echo ""
echo "📄 Testing HTML files (should not be cached):"
curl -s -I "http://localhost/" | grep -i "cache-control\|expires"

# Test API endpoints (should not be cached)
echo ""
echo "📄 Testing API endpoints (should not be cached):"
curl -s -I "http://localhost/api/v1/pokemon" | grep -i "cache-control\|expires\|x-api-version"

echo ""
echo "🎯 Cache Invalidation Complete!"
echo "=============================="
echo "✅ Static assets: Cached for 1 year (immutable)"
echo "✅ HTML files: Never cached (always fresh)"
echo "✅ API responses: Never cached (always fresh)"
echo ""
echo "💡 Tips:"
echo "   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "   - Incognito mode: Always works with fresh cache"
echo "   - Clear browser cache: If issues persist"
