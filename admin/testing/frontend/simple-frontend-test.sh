#!/bin/bash

# Simple Frontend Test Runner
# This script just checks if the frontend is accessible

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

# Function to test an endpoint
test_endpoint() {
    local url="$1"
    local name="$2"
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        print_success "$name: Accessible"
        return 0
    else
        print_error "$name: Not accessible"
        return 1
    fi
}

# Main execution
main() {
    print_status "Running simple frontend tests..."
    
    # Test Docker frontend
    print_status "Testing Docker frontend..."
    if test_endpoint "http://localhost/" "Docker Frontend"; then
        print_success "Frontend tests passed!"
        exit 0
    else
        print_error "Frontend tests failed!"
        exit 1
    fi
}

# Run main function
main "$@"
