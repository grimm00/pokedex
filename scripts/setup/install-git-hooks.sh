#!/bin/bash

# Git Hooks Installer for Git Flow Safety
# Installs pre-commit and other Git hooks for automated safety checks

# Get the script directory for relative imports
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source shared utilities
if [ -f "$SCRIPT_DIR/../core/git-flow-utils.sh" ]; then
    source "$SCRIPT_DIR/../core/git-flow-utils.sh"
    init_git_flow_utils >/dev/null 2>&1
else
    # Fallback colors if utils not available
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m' # No Color
    
    print_status() {
        local msg_type=$1
        local message=$2
        case $msg_type in
            "ERROR")   echo -e "${RED}❌ $message${NC}" ;;
            "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
            "SUCCESS") echo -e "${GREEN}✅ $message${NC}" ;;
            "INFO")    echo -e "${CYAN}ℹ️  $message${NC}" ;;
        esac
    }
    
    print_header() {
        local title=$1
        echo -e "${BOLD}${CYAN}$title${NC}"
        echo -e "${CYAN}$(printf '═%.0s' $(seq 1 ${#title}))${NC}"
    }
fi

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$PROJECT_ROOT" ]; then
    echo -e "${RED}❌ Not in a Git repository${NC}"
    exit 1
fi

HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
SOURCE_HOOKS_DIR="$PROJECT_ROOT/scripts/core/git-hooks"

print_header "🪝 Installing Git Flow Safety Hooks"
echo ""

# Check if hooks directory exists
if [ ! -d "$HOOKS_DIR" ]; then
    echo -e "${RED}❌ Git hooks directory not found: $HOOKS_DIR${NC}"
    exit 1
fi

# Check if source hooks exist
if [ ! -d "$SOURCE_HOOKS_DIR" ]; then
    echo -e "${RED}❌ Source hooks directory not found: $SOURCE_HOOKS_DIR${NC}"
    exit 1
fi

# Install hooks
echo -e "${CYAN}📦 Installing hooks...${NC}"

for hook_file in "$SOURCE_HOOKS_DIR"/*; do
    if [ -f "$hook_file" ]; then
        hook_name=$(basename "$hook_file")
        target_hook="$HOOKS_DIR/$hook_name"
        
        # Backup existing hook if it exists
        if [ -f "$target_hook" ]; then
            backup_file="$target_hook.backup.$(date +%Y%m%d-%H%M%S)"
            echo -e "${YELLOW}⚠️  Backing up existing $hook_name to $(basename "$backup_file")${NC}"
            cp "$target_hook" "$backup_file"
        fi
        
        # Install new hook
        print_status "SUCCESS" "Installing $hook_name"
        cp "$hook_file" "$target_hook"
        chmod +x "$target_hook"
    fi
done

echo ""
echo -e "${GREEN}🎉 Git hooks installed successfully!${NC}"
echo ""
echo -e "${CYAN}📋 Installed hooks:${NC}"
ls -la "$HOOKS_DIR" | grep -v "\.sample$" | grep -E "^-.*x.*" | awk '{print "   " $9}'

echo ""
echo -e "${YELLOW}💡 What these hooks do:${NC}"
echo "   • ${CYAN}pre-commit${NC}: Runs safety checks before each commit"
echo "   • Prevents commits on protected branches (main/develop)"
echo "   • Checks for sensitive files and large files"
echo "   • Validates branch naming conventions"

echo ""
echo -e "${YELLOW}🔧 To disable hooks temporarily:${NC}"
echo "   git commit --no-verify"

echo ""
echo -e "${YELLOW}🗑️  To uninstall hooks:${NC}"
echo "   rm $HOOKS_DIR/pre-commit"
echo "   # (restore from .backup files if needed)"

echo ""
echo -e "${GREEN}✨ Your repository is now protected by Git Flow safety hooks!${NC}"
