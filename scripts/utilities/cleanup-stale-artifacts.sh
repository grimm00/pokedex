#!/usr/bin/env bash
#
# Cleanup Stale Build Artifacts
#
# Purpose: Remove stale build artifacts from project root that may have been
#          created before project structure cleanup.
#
# Usage:
#   ./scripts/utilities/cleanup-stale-artifacts.sh [--dry-run] [--verbose]
#
# Options:
#   --dry-run    Show what would be removed without actually removing
#   --verbose    Show detailed output
#   --help       Show this help message
#
# Exit codes:
#   0 - Success (artifacts cleaned or none found)
#   1 - Error occurred during cleanup
#
# Related:
#   - Troubleshooting: admin/docs/troubleshooting/root-dist-directory-cleanup.md
#   - CI Validation: .github/workflows/validate-structure.yml

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script configuration
DRY_RUN=false
VERBOSE=false

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Artifacts to check and clean
readonly ROOT_ARTIFACTS=(
    "dist"
    "build"
    ".next"
    ".nuxt"
)

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to show help
show_help() {
    cat << EOF
Cleanup Stale Build Artifacts

Usage: $(basename "$0") [OPTIONS]

Removes stale build artifacts from the project root that shouldn't exist
after project structure cleanup.

OPTIONS:
    --dry-run       Show what would be removed without actually removing
    --verbose       Show detailed output
    --help          Show this help message

CHECKED ARTIFACTS:
    - dist/         Frontend production builds
    - build/        Alternative build output
    - .next/        Next.js builds
    - .nuxt/        Nuxt.js builds

EXPECTED LOCATIONS:
    - frontend/dist/        ✅ Correct location for frontend builds
    - frontend/build/       ✅ Alternative frontend output
    - backend/build/        ✅ Backend build artifacts (if any)

EXIT CODES:
    0   Success (cleaned or nothing to clean)
    1   Error during cleanup

EXAMPLES:
    # Check what would be cleaned
    $(basename "$0") --dry-run

    # Clean artifacts with verbose output
    $(basename "$0") --verbose

    # Run as pre-build check
    npm run pre-build  # (if configured in package.json)

RELATED:
    - Troubleshooting: admin/docs/troubleshooting/root-dist-directory-cleanup.md
    - CI Validation: .github/workflows/validate-structure.yml

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_status "$RED" "❌ Unknown option: $1"
                echo "Run with --help for usage information"
                exit 1
                ;;
        esac
    done
}

# Function to check if directory exists in project root
check_artifact() {
    local artifact=$1
    local artifact_path="$PROJECT_ROOT/$artifact"
    
    if [ -d "$artifact_path" ]; then
        return 0  # Exists
    else
        return 1  # Does not exist
    fi
}

# Function to get artifact size
get_artifact_size() {
    local artifact_path=$1
    du -sh "$artifact_path" 2>/dev/null | cut -f1
}

# Function to remove artifact
remove_artifact() {
    local artifact=$1
    local artifact_path="$PROJECT_ROOT/$artifact"
    
    if [ "$DRY_RUN" = true ]; then
        print_status "$YELLOW" "  [DRY RUN] Would remove: $artifact/"
        if [ "$VERBOSE" = true ]; then
            local size=$(get_artifact_size "$artifact_path")
            print_status "$BLUE" "    Size: $size"
            print_status "$BLUE" "    Path: $artifact_path"
        fi
    else
        if [ "$VERBOSE" = true ]; then
            local size=$(get_artifact_size "$artifact_path")
            print_status "$BLUE" "  Removing: $artifact/ ($size)"
        else
            print_status "$YELLOW" "  Removing: $artifact/"
        fi
        
        if rm -rf "$artifact_path"; then
            print_status "$GREEN" "  ✅ Removed successfully"
        else
            print_status "$RED" "  ❌ Failed to remove"
            return 1
        fi
    fi
    
    return 0
}

# Main cleanup function
main() {
    parse_args "$@"
    
    print_status "$BLUE" "🧹 Cleanup Stale Build Artifacts"
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        print_status "$YELLOW" "📋 DRY RUN MODE - No files will be removed"
        echo ""
    fi
    
    if [ "$VERBOSE" = true ]; then
        print_status "$BLUE" "📍 Project root: $PROJECT_ROOT"
        echo ""
    fi
    
    # Check for stale artifacts
    local found_artifacts=()
    local total_artifacts=0
    
    print_status "$BLUE" "🔍 Checking for stale artifacts in project root..."
    echo ""
    
    for artifact in "${ROOT_ARTIFACTS[@]}"; do
        if check_artifact "$artifact"; then
            found_artifacts+=("$artifact")
            ((total_artifacts++))
            print_status "$YELLOW" "⚠️  Found: $artifact/"
        elif [ "$VERBOSE" = true ]; then
            print_status "$GREEN" "✅ Not found: $artifact/ (expected)"
        fi
    done
    
    echo ""
    
    # Clean artifacts if found
    if [ $total_artifacts -gt 0 ]; then
        if [ "$DRY_RUN" = true ]; then
            print_status "$YELLOW" "📋 Would clean $total_artifacts artifact(s):"
        else
            print_status "$YELLOW" "🧹 Cleaning $total_artifacts artifact(s):"
        fi
        echo ""
        
        local errors=0
        for artifact in "${found_artifacts[@]}"; do
            if ! remove_artifact "$artifact"; then
                ((errors++))
            fi
        done
        
        echo ""
        
        if [ $errors -gt 0 ]; then
            print_status "$RED" "❌ Cleanup completed with $errors error(s)"
            exit 1
        else
            if [ "$DRY_RUN" = true ]; then
                print_status "$GREEN" "✅ Dry run complete - $total_artifacts artifact(s) would be removed"
            else
                print_status "$GREEN" "✅ Cleanup complete - $total_artifacts artifact(s) removed"
            fi
        fi
    else
        print_status "$GREEN" "✅ No stale artifacts found - project structure is clean!"
    fi
    
    echo ""
    
    # Show expected locations
    if [ "$VERBOSE" = true ] || [ $total_artifacts -gt 0 ]; then
        print_status "$BLUE" "📝 Expected artifact locations:"
        print_status "$BLUE" "   ✅ frontend/dist/  - Frontend production builds"
        print_status "$BLUE" "   ✅ frontend/build/ - Alternative frontend output"
        echo ""
    fi
    
    exit 0
}

# Run main function
main "$@"

