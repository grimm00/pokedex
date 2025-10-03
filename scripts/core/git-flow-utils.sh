#!/bin/bash

# Git Flow Utilities - Shared functions and configurations
# Centralized utilities to avoid code duplication across Git Flow scripts

# ============================================================================
# COLOR DEFINITIONS
# ============================================================================

# Colors for output (only if terminal supports it)
if [[ -t 1 ]] && command -v tput >/dev/null 2>&1; then
    GF_RED='\033[0;31m'
    GF_GREEN='\033[0;32m'
    GF_YELLOW='\033[1;33m'
    GF_BLUE='\033[0;34m'
    GF_PURPLE='\033[0;35m'
    GF_CYAN='\033[0;36m'
    GF_BOLD='\033[1m'
    GF_NC='\033[0m' # No Color
else
    GF_RED=''
    GF_GREEN=''
    GF_YELLOW=''
    GF_BLUE=''
    GF_PURPLE=''
    GF_CYAN=''
    GF_BOLD=''
    GF_NC=''
fi

# ============================================================================
# CONFIGURATION
# ============================================================================

# Default configuration (can be overridden by environment variables or config file)
DEFAULT_GF_MAIN_BRANCH="main"
DEFAULT_GF_DEVELOP_BRANCH="develop"
DEFAULT_GF_PROTECTED_BRANCHES=("main" "develop" "master")
DEFAULT_GF_BRANCH_PREFIXES=("feat/" "fix/" "chore/" "hotfix/")

# Load configuration from environment variables or use defaults
GF_MAIN_BRANCH="${GIT_FLOW_MAIN_BRANCH:-$DEFAULT_MAIN_BRANCH}"
GF_DEVELOP_BRANCH="${GIT_FLOW_DEVELOP_BRANCH:-$DEFAULT_DEVELOP_BRANCH}"

# Load protected branches from env var (comma-separated) or use defaults
if [ -n "${GIT_FLOW_PROTECTED_BRANCHES:-}" ]; then
    IFS=',' read -ra PROTECTED_BRANCHES <<< "$GIT_FLOW_PROTECTED_BRANCHES"
else
    GF_PROTECTED_BRANCHES=("${DEFAULT_PROTECTED_BRANCHES[@]}")
fi

# Load branch prefixes from env var (comma-separated) or use defaults
if [ -n "${GIT_FLOW_BRANCH_PREFIXES:-}" ]; then
    IFS=',' read -ra BRANCH_PREFIXES <<< "$GIT_FLOW_BRANCH_PREFIXES"
else
    GF_BRANCH_PREFIXES=("${DEFAULT_BRANCH_PREFIXES[@]}")
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
                "MAIN_BRANCH") GF_MAIN_BRANCH="$value" ;;
                "DEVELOP_BRANCH") GF_DEVELOP_BRANCH="$value" ;;
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
gf_print_status() {
    local msg_type=$1
    local message=$2
    case $msg_type in
        "ERROR")   echo -e "${GF_RED}❌ $message${GF_NC}" ;;
        "WARNING") echo -e "${GF_YELLOW}⚠️  $message${GF_NC}" ;;
        "SUCCESS") echo -e "${GF_GREEN}✅ $message${GF_NC}" ;;
        "INFO")    echo -e "${GF_BLUE}ℹ️  $message${GF_NC}" ;;
        "HEADER")  echo -e "${GF_BOLD}${GF_CYAN}$message${GF_NC}" ;;
        "SECTION") echo -e "${GF_BOLD}${GF_CYAN}$message${GF_NC}" ;;
    esac
}

# Function to print section headers
gf_print_section() {
    local title=$1
    echo -e "${GF_BOLD}${GF_CYAN}$title${GF_NC}"
}

# Function to print main headers
gf_print_header() {
    local title=$1
    echo -e "${GF_BOLD}${GF_CYAN}$title${GF_NC}"
    echo -e "${GF_CYAN}$(printf '═%.0s' $(seq 1 ${#title}))${GF_NC}"
}

# ============================================================================
# DEPENDENCY CHECKING
# ============================================================================

# Required dependencies for Git Flow operations
REQUIRED_DEPS=("git")
OPTIONAL_DEPS=("gh" "jq" "curl")

# Check if a command exists
gf_command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required dependencies
gf_check_required_dependencies() {
    local missing_deps=()
    
    for dep in "${REQUIRED_DEPS[@]}"; do
        if ! gf_command_exists "$dep"; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        gf_print_status "ERROR" "Missing required dependencies: ${missing_deps[*]}"
        echo -e "${GF_YELLOW}💡 Please install the missing dependencies:${GF_NC}"
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
gf_check_optional_dependencies() {
    local missing_optional=()
    
    for dep in "${OPTIONAL_DEPS[@]}"; do
        if ! gf_command_exists "$dep"; then
            missing_optional+=("$dep")
        fi
    done
    
    if [ ${#missing_optional[@]} -gt 0 ]; then
        gf_print_status "WARNING" "Optional dependencies not found: ${missing_optional[*]}"
        echo -e "${GF_YELLOW}💡 Some features may be limited. Consider installing:${GF_NC}"
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
gf_check_dependencies() {
    gf_print_section "🔍 Dependency Check"
    
    if ! gf_check_required_dependencies; then
        return 1
    fi
    
    gf_check_optional_dependencies
    
    gf_print_status "SUCCESS" "All required dependencies available"
    return 0
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Get current Git branch
gf_get_current_branch() {
    git branch --show-current 2>/dev/null || echo ""
}

# Check if current directory is a Git repository
gf_is_git_repo() {
    git rev-parse --git-dir >/dev/null 2>&1
}

# Get project root directory
gf_get_project_root() {
    git rev-parse --show-toplevel 2>/dev/null || pwd
}

# Check if branch exists
gf_branch_exists() {
    local branch=$1
    git show-ref --verify --quiet "refs/heads/$branch"
}

# Check if remote branch exists
gf_remote_branch_exists() {
    local branch=$1
    git show-ref --verify --quiet "refs/remotes/origin/$branch"
}

# Check if branch is protected
gf_is_protected_branch() {
    local branch=$1
    for protected in "${GF_PROTECTED_BRANCHES[@]}"; do
        if [ "$branch" = "$protected" ]; then
            return 0
        fi
    done
    return 1
}

# Check if branch follows naming convention
gf_is_valid_branch_name() {
    local branch=$1
    for prefix in "${GF_BRANCH_PREFIXES[@]}"; do
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
gf_create_default_config() {
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
    
    gf_print_status "SUCCESS" "Created default configuration: $CONFIG_FILE"
}

# Show current configuration
gf_show_config() {
    gf_print_header "🔧 Git Flow Configuration"
    echo ""
    echo -e "${GF_CYAN}Main Branch:${GF_NC} $GF_MAIN_BRANCH"
    echo -e "${GF_CYAN}Develop Branch:${GF_NC} $GF_DEVELOP_BRANCH"
    echo -e "${GF_CYAN}Protected Branches:${GF_NC} ${GF_PROTECTED_BRANCHES[*]}"
    echo -e "${GF_CYAN}Branch Prefixes:${GF_NC} ${GF_BRANCH_PREFIXES[*]}"
    echo ""
    echo -e "${GF_YELLOW}Configuration Sources:${GF_NC}"
    echo "  1. Environment variables (highest priority)"
    echo "  2. Config file: $CONFIG_FILE"
    echo "  3. Built-in defaults (lowest priority)"
    echo ""
    if [ -f "$CONFIG_FILE" ]; then
        echo -e "${GF_GREEN}✅ Config file exists${GF_NC}"
    else
        echo -e "${GF_YELLOW}⚠️  No config file found${GF_NC}"
        echo -e "${GF_YELLOW}💡 Run 'create-config' to create one${GF_NC}"
    fi
}

# ============================================================================
# INITIALIZATION
# ============================================================================

# Initialize Git Flow utilities
gf_init_git_flow_utils() {
    # Load configuration
    load_config
    
    # Verify we're in a Git repository
    if ! gf_is_git_repo; then
        gf_print_status "ERROR" "Not in a Git repository"
        return 1
    fi
    
    return 0
}

# Export functions and variables for use by other scripts
export -f gf_print_status gf_print_section gf_print_header
export -f gf_command_exists gf_check_dependencies
export -f gf_get_current_branch gf_is_git_repo gf_get_project_root
export -f gf_branch_exists gf_remote_branch_exists
export -f gf_is_protected_branch gf_is_valid_branch_name
export -f gf_show_config gf_create_default_config

export GF_RED GF_GREEN GF_YELLOW GF_BLUE GF_PURPLE GF_CYAN GF_BOLD GF_NC
export GF_MAIN_BRANCH GF_DEVELOP_BRANCH GF_PROTECTED_BRANCHES GF_BRANCH_PREFIXES
