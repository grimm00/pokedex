#!/bin/bash

# Security Scans Toggle Script for Pokehub Project
# Usage: ./scripts/setup/security-toggle.sh [enable|disable|status]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

WORKFLOW_FILE="$PROJECT_ROOT/.github/workflows/security.yml"

echo -e "${BLUE}🔐 Pokehub Security Scans Toggle${NC}"
echo "================================="

check_status() {
    if [ ! -f "$WORKFLOW_FILE" ]; then
        echo -e "${RED}❌ Security workflow file not found: $WORKFLOW_FILE${NC}"
        return 1
    fi
    
    if grep -q "^#.*on:" "$WORKFLOW_FILE" 2>/dev/null; then
        echo -e "${RED}🔴 Security scans are DISABLED${NC}"
        return 1
    else
        echo -e "${GREEN}🟢 Security scans are ENABLED${NC}"
        return 0
    fi
}

enable_security() {
    echo -e "${YELLOW}🔓 Enabling security scans...${NC}"
    
    if [ ! -f "$WORKFLOW_FILE" ]; then
        echo -e "${RED}❌ Security workflow file not found: $WORKFLOW_FILE${NC}"
        exit 1
    fi
    
    # Remove comment from the 'on:' line to enable the workflow
    sed -i.bak 's/^#\(on:\)/\1/' "$WORKFLOW_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Security scans enabled successfully${NC}"
        echo "The security workflow will now run on push and pull requests."
    else
        echo -e "${RED}❌ Failed to enable security scans${NC}"
        exit 1
    fi
}

disable_security() {
    echo -e "${YELLOW}🔒 Disabling security scans...${NC}"
    
    if [ ! -f "$WORKFLOW_FILE" ]; then
        echo -e "${RED}❌ Security workflow file not found: $WORKFLOW_FILE${NC}"
        exit 1
    fi
    
    # Comment out the 'on:' line to disable the workflow
    sed -i.bak 's/^on:/#on:/' "$WORKFLOW_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Security scans disabled successfully${NC}"
        echo "The security workflow will no longer run automatically."
    else
        echo -e "${RED}❌ Failed to disable security scans${NC}"
        exit 1
    fi
}

case "${1:-status}" in
    "enable")
        enable_security
        ;;
    "disable")
        disable_security
        ;;
    "status")
        check_status
        ;;
    *)
        echo "Usage: $0 [enable|disable|status]"
        echo ""
        echo "Commands:"
        echo "  enable   - Enable security scans workflow"
        echo "  disable  - Disable security scans workflow"
        echo "  status   - Check current status (default)"
        echo ""
        echo "Current status:"
        check_status
        exit 1
        ;;
esac
