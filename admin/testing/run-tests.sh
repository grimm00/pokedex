#!/bin/bash

# Pokedex Testing Suite Runner
# This script runs all tests from the organized testing structure

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

# Function to run backend tests
run_backend_tests() {
    print_status "Running backend tests..."
    
    if command_exists python3; then
        # Get the directory where this script is located
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        cd "$SCRIPT_DIR/test-scripts"
        
        # Check if requests is installed
        if ! python3 -c "import requests" 2>/dev/null; then
            print_status "Installing requests module..."
            pip3 install --user requests || pip3 install --break-system-packages requests
        fi
        
        python3 test_app_running.py
        print_success "Backend tests completed"
    else
        print_error "Python3 not found. Please install Python 3 to run backend tests."
        return 1
    fi
}

# Function to run frontend tests
run_frontend_tests() {
    print_status "Running frontend tests..."
    
    if command_exists npm; then
        # Get the directory where this script is located
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        
        # Check if we're in the right directory structure
        if [ ! -f "$SCRIPT_DIR/../../frontend/package.json" ]; then
            print_error "Frontend package.json not found. Please run from project root."
            return 1
        fi
        
        # Run the simple frontend test script
        cd "$SCRIPT_DIR/frontend"
        ./simple-frontend-test.sh
        print_success "Frontend tests completed"
    else
        print_error "npm not found. Please install Node.js to run frontend tests."
        return 1
    fi
}

# Function to run performance tests
run_performance_tests() {
    print_status "Running performance tests..."
    
    if command_exists python3; then
        # Get the directory where this script is located
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        cd "$SCRIPT_DIR/performance"
        
        if [ -f "run_performance_tests.sh" ]; then
            chmod +x run_performance_tests.sh
            ./run_performance_tests.sh
            print_success "Performance tests completed"
        else
            print_warning "Performance test script not found"
        fi
    else
        print_error "Python3 not found. Please install Python 3 to run performance tests."
        return 1
    fi
}

# Function to show help
show_help() {
    echo "Pokedex Testing Suite Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -a, --all          Run all tests (backend, frontend, performance)"
    echo "  -b, --backend      Run backend tests only"
    echo "  -f, --frontend     Run frontend tests only"
    echo "  -p, --performance  Run performance tests only"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --all           # Run all tests"
    echo "  $0 --backend       # Run only backend tests"
    echo "  $0 --frontend      # Run only frontend tests"
    echo ""
}

# Main execution
main() {
    # Get the directory where this script is located
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Check if we're in the project root
    if [ ! -f "$SCRIPT_DIR/../../docker-compose.yml" ] && [ ! -f "$SCRIPT_DIR/../../frontend/package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Parse arguments
    case "${1:-}" in
        -a|--all)
            print_status "Running all tests..."
            run_backend_tests
            run_frontend_tests
            run_performance_tests
            print_success "All tests completed!"
            ;;
        -b|--backend)
            run_backend_tests
            ;;
        -f|--frontend)
            run_frontend_tests
            ;;
        -p|--performance)
            run_performance_tests
            ;;
        -h|--help)
            show_help
            ;;
        "")
            print_status "No test type specified. Running all tests..."
            run_backend_tests
            run_frontend_tests
            run_performance_tests
            print_success "All tests completed!"
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
