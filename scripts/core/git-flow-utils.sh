#!/bin/bash

# Git Flow Utilities - Shared functions and configurations
# Centralized utilities to avoid code duplication across Git Flow scripts

# ============================================================================
# COLOR DEFINITIONS
# ============================================================================

# Colors for output (only if terminal supports it)
if [[ -t 1 ]] && command -v tput >/dev/null 2>&1; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    PURPLE='\033[0;35m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    PURPLE=''
    CYAN=''
    BOLD=''
    NC=''
fi

# ============================================================================
# CONFIGURATION
# ============================================================================

# Default configuration (can be overridden by environment variables or config file)
DEFAULT_MAIN_BRANCH="main"
DEFAULT_DEVELOP_BRANCH="develop"
DEFAULT_PROTECTED_BRANCHES=("main" "develop" "master")
DEFAULT_BRANCH_PREFIXES=("feat/" "fix/" "chore/" "hotfix/")

# Load configuration from environment variables or use defaults
MAIN_BRANCH="${GIT_FLOW_MAIN_BRANCH:-$DEFAULT_MAIN_BRANCH}"
DEVELOP_BRANCH="${GIT_FLOW_DEVELOP_BRANCH:-$DEFAULT_DEVELOP_BRANCH}"

# Load protected branches from env var (comma-separated) or use defaults
if [ -n "${GIT_FLOW_PROTECTED_BRANCHES:-}" ]; then
    IFS=',' read -ra PROTECTED_BRANCHES <<< "$GIT_FLOW_PROTECTED_BRANCHES"
else
    PROTECTED_BRANCHES=("${DEFAULT_PROTECTED_BRANCHES[@]}")
fi

# Load branch prefixes from env var (comma-separated) or use defaults
if [ -n "${GIT_FLOW_BRANCH_PREFIXES:-}" ]; then
    IFS=',' read -ra BRANCH_PREFIXES <<< "$GIT_FLOW_BRANCH_PREFIXES"
else
    BRANCH_PREFIXES=("${DEFAULT_BRANCH_PREFIXES[@]}")
fi

# Configuration file path
CONFIG_FILE="${GIT_FLOW_CONFIG_FILE:-$HOME/.gitflow-config}"

# ============================================================================
# CONFIGURATION LOADING
# ============================================================================

# Load configuration from file if it exists
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        # Source the config file safely
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^[[:space:]]*# ]] && continue
            [[ -z $key ]] && continue
            
            # Remove quotes from value
            value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
            
            case $key in
                "MAIN_BRANCH") MAIN_BRANCH="$value" ;;
                "DEVELOP_BRANCH") DEVELOP_BRANCH="$value" ;;
                "PROTECTED_BRANCHES") IFS=',' read -ra PROTECTED_BRANCHES <<< "$value" ;;
                "BRANCH_PREFIXES") IFS=',' read -ra BRANCH_PREFIXES <<< "$value" ;;
            esac
        done < "$CONFIG_FILE"
    fi
}

# ============================================================================
# STATUS PRINTING FUNCTIONS
# ============================================================================

# Function to print colored status messages
print_status() {
    local msg_type=$1
    local message=$2
    case $msg_type in
        "ERROR")   echo -e "${RED}❌ $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "SUCCESS") echo -e "${GREEN}✅ $message${NC}" ;;
        "INFO")    echo -e "${BLUE}ℹ️  $message${NC}" ;;
        "HEADER")  echo -e "${BOLD}${CYAN}$message${NC}" ;;
        "SECTION") echo -e "${BOLD}${CYAN}$message${NC}" ;;
    esac
}

# Function to print section headers
print_section() {
    local title=$1
    echo -e "${BOLD}${CYAN}$title${NC}"
}

# Function to print main headers
print_header() {
    local title=$1
    echo -e "${BOLD}${CYAN}$title${NC}"
    echo -e "${CYAN}$(printf '═%.0s' $(seq 1 ${#title}))${NC}"
}

# ============================================================================
# DEPENDENCY CHECKING
# ============================================================================

# Required dependencies for Git Flow operations
REQUIRED_DEPS=("git")
OPTIONAL_DEPS=("gh" "jq" "curl")

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required dependencies
check_required_dependencies() {
    local missing_deps=()
    
    for dep in "${REQUIRED_DEPS[@]}"; do
        if ! command_exists "$dep"; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_status "ERROR" "Missing required dependencies: ${missing_deps[*]}"
        echo -e "${YELLOW}💡 Please install the missing dependencies:${NC}"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "git") echo "   - Git: https://git-scm.com/downloads" ;;
                *) echo "   - $dep" ;;
            esac
        done
        return 1
    fi
    
    return 0
}

# Check optional dependencies and warn if missing
check_optional_dependencies() {
    local missing_optional=()
    
    for dep in "${OPTIONAL_DEPS[@]}"; do
        if ! command_exists "$dep"; then
            missing_optional+=("$dep")
        fi
    done
    
    if [ ${#missing_optional[@]} -gt 0 ]; then
        print_status "WARNING" "Optional dependencies not found: ${missing_optional[*]}"
        echo -e "${YELLOW}💡 Some features may be limited. Consider installing:${NC}"
        for dep in "${missing_optional[@]}"; do
            case $dep in
                "gh") echo "   - GitHub CLI: https://cli.github.com/" ;;
                "jq") echo "   - jq: https://stedolan.github.io/jq/" ;;
                "curl") echo "   - curl: Usually pre-installed on most systems" ;;
                *) echo "   - $dep" ;;
            esac
        done
        echo ""
    fi
}

# Comprehensive dependency check
check_dependencies() {
    print_section "🔍 Dependency Check"
    
    if ! check_required_dependencies; then
        return 1
    fi
    
    check_optional_dependencies
    
    print_status "SUCCESS" "All required dependencies available"
    return 0
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Get current Git branch
get_current_branch() {
    git branch --show-current 2>/dev/null || echo ""
}

# Check if current directory is a Git repository
is_git_repo() {
    git rev-parse --git-dir >/dev/null 2>&1
}

# Get project root directory
get_project_root() {
    git rev-parse --show-toplevel 2>/dev/null || pwd
}

# Check if branch exists
branch_exists() {
    local branch=$1
    git show-ref --verify --quiet "refs/heads/$branch"
}

# Check if remote branch exists
remote_branch_exists() {
    local branch=$1
    git show-ref --verify --quiet "refs/remotes/origin/$branch"
}

# Check if branch is protected
is_protected_branch() {
    local branch=$1
    for protected in "${PROTECTED_BRANCHES[@]}"; do
        if [ "$branch" = "$protected" ]; then
            return 0
        fi
    done
    return 1
}

# Check if branch follows naming convention
is_valid_branch_name() {
    local branch=$1
    for prefix in "${BRANCH_PREFIXES[@]}"; do
        if [[ "$branch" =~ ^$prefix ]]; then
            return 0
        fi
    done
    return 1
}

# ============================================================================
# CONFIGURATION MANAGEMENT
# ============================================================================

# Create default configuration file
create_default_config() {
    cat > "$CONFIG_FILE" << EOF
# Git Flow Configuration
# Customize your Git Flow settings here

# Main branches
MAIN_BRANCH=main
DEVELOP_BRANCH=develop

# Protected branches (comma-separated)
PROTECTED_BRANCHES=main,develop,master

# Valid branch prefixes (comma-separated)
BRANCH_PREFIXES=feat/,fix/,chore/,hotfix/

# You can also set these as environment variables:
# export GIT_FLOW_MAIN_BRANCH=main
# export GIT_FLOW_DEVELOP_BRANCH=develop
# export GIT_FLOW_PROTECTED_BRANCHES=main,develop
# export GIT_FLOW_BRANCH_PREFIXES=feat/,fix/,chore/,hotfix/
EOF
    
    print_status "SUCCESS" "Created default configuration: $CONFIG_FILE"
}

# Show current configuration
show_config() {
    print_header "🔧 Git Flow Configuration"
    echo ""
    echo -e "${CYAN}Main Branch:${NC} $MAIN_BRANCH"
    echo -e "${CYAN}Develop Branch:${NC} $DEVELOP_BRANCH"
    echo -e "${CYAN}Protected Branches:${NC} ${PROTECTED_BRANCHES[*]}"
    echo -e "${CYAN}Branch Prefixes:${NC} ${BRANCH_PREFIXES[*]}"
    echo ""
    echo -e "${YELLOW}Configuration Sources:${NC}"
    echo "  1. Environment variables (highest priority)"
    echo "  2. Config file: $CONFIG_FILE"
    echo "  3. Built-in defaults (lowest priority)"
    echo ""
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "${GREEN}✅ Config file exists${NC}"
    else
        echo -e "${YELLOW}⚠️  No config file found${NC}"
        echo -e "${YELLOW}💡 Run 'create-config' to create one${NC}"
    fi
}

# ============================================================================
# INITIALIZATION
# ============================================================================

# Initialize Git Flow utilities
init_git_flow_utils() {
    # Load configuration
    load_config
    
    # Verify we're in a Git repository
    if ! is_git_repo; then
        print_status "ERROR" "Not in a Git repository"
        return 1
    fi
    
    return 0
}

# Export functions and variables for use by other scripts
export -f print_status print_section print_header
export -f command_exists check_dependencies
export -f get_current_branch is_git_repo get_project_root
export -f branch_exists remote_branch_exists
export -f is_protected_branch is_valid_branch_name
export -f show_config create_default_config

export RED GREEN YELLOW BLUE PURPLE CYAN BOLD NC
export MAIN_BRANCH DEVELOP_BRANCH PROTECTED_BRANCHES BRANCH_PREFIXES
