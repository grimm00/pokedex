#!/bin/bash

# Script to re-enable security scans

echo "🔧 Re-enabling Security Scans"
echo "============================="

# Rename security workflow to enable it
if [ -f ".github/workflows/security.yml.disabled" ]; then
    mv .github/workflows/security.yml.disabled .github/workflows/security.yml
    echo "✅ Security workflow enabled (.github/workflows/security.yml)"
else
    echo "ℹ️  Security workflow already enabled or not found"
fi

echo ""
echo "✅ Security scans are now ENABLED"
echo ""
echo "🔍 Security scans will run on:"
echo "   - Push to main/develop branches"
echo "   - Pull requests to main"
echo "   - Weekly schedule (Monday 2 AM)"
