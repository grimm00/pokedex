#!/bin/bash

# Temporary script to disable security scans
# Use this if security scans are blocking development

echo "🔧 Disabling Security Scans Temporarily"
echo "========================================"

# Rename security workflow to disable it
if [ -f ".github/workflows/security.yml" ]; then
    mv .github/workflows/security.yml .github/workflows/security.yml.disabled
    echo "✅ Security workflow disabled (.github/workflows/security.yml.disabled)"
else
    echo "ℹ️  Security workflow already disabled or not found"
fi

echo ""
echo "⚠️  IMPORTANT: Security scans are now DISABLED"
echo "   Remember to re-enable them later with: scripts/enable-security-scans.sh"
echo ""
echo "🔄 To re-enable security scans:"
echo "   ./scripts/enable-security-scans.sh"
