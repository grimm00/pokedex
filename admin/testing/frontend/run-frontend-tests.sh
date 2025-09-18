#!/bin/bash

# Frontend Test Runner
# This script runs frontend tests from the organized testing structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main execution
main() {
    print_status "Starting frontend test runner..."
    
    # Get the directory where this script is located
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Check if we're in the right directory structure
    if [ ! -f "$SCRIPT_DIR/../../../frontend/package.json" ]; then
        print_error "Frontend package.json not found. Please run from project root."
        exit 1
    fi
    
    # Check if npm is available
    if ! command_exists npm; then
        print_error "npm not found. Please install Node.js to run frontend tests."
        exit 1
    fi
    
    # Navigate to frontend directory
    cd "$SCRIPT_DIR/../../../frontend"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Check if vitest is available
    if ! npm list vitest >/dev/null 2>&1; then
        print_status "Installing vitest for testing..."
        npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
    fi
    
    # Copy test files to frontend directory temporarily
    print_status "Setting up test files..."
    
    # Create test directories in frontend
    mkdir -p src/__tests__/components/pokemon
    mkdir -p src/__tests__/pages
    mkdir -p src/__tests__/test-utils
    
    # Copy test files
    cp "$SCRIPT_DIR/components/pokemon"/*.test.tsx src/__tests__/components/pokemon/
    cp "$SCRIPT_DIR/pages"/*.test.tsx src/__tests__/pages/
    cp "$SCRIPT_DIR/test-utils"/*.ts src/__tests__/test-utils/
    cp "$SCRIPT_DIR/vitest.config.ts" ./
    
    # Update package.json to include test script if not present
    if ! grep -q '"test"' package.json; then
        print_status "Adding test script to package.json..."
        # Use a temporary file to modify package.json
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.test = 'vitest';
        pkg.scripts['test:ui'] = 'vitest --ui';
        pkg.scripts['test:coverage'] = 'vitest --coverage';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
    fi
    
    # Run tests
    print_status "Running frontend tests..."
    npm test
    
    # Clean up test files
    print_status "Cleaning up test files..."
    rm -rf src/__tests__
    rm -f vitest.config.ts
    
    print_success "Frontend tests completed!"
}

# Run main function
main "$@"
