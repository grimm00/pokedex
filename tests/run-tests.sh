#!/bin/bash

# Pokedex Test Runner
# Comprehensive test execution script

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
    
    if [ ! -d "../backend" ]; then
        print_error "Backend directory not found!"
        return 1
    fi
    
    cd ../backend
    
    # Check if virtual environment exists
    if [ ! -d "../venv" ]; then
        print_warning "Virtual environment not found. Creating one..."
        python3 -m venv ../venv
        source ../venv/bin/activate
        pip install -r requirements.txt
    else
        source ../venv/bin/activate
    fi
    
    # Run tests
    if command_exists pytest; then
        pytest tests/ -v --tb=short
        print_success "Backend tests completed"
    else
        print_error "pytest not found. Please install it: pip install pytest"
        return 1
    fi
    
    cd ../tests
}

# Function to run frontend tests
run_frontend_tests() {
    print_status "Running frontend tests..."
    
    if [ ! -d "../frontend" ]; then
        print_error "Frontend directory not found!"
        return 1
    fi
    
    cd ../frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "Node modules not found. Installing dependencies..."
        npm install
    fi
    
    # Run tests
    if command_exists npm; then
        npm test
        print_success "Frontend tests completed"
    else
        print_error "npm not found. Please install Node.js"
        return 1
    fi
    
    cd ../tests
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    # Run legacy integration tests
    if [ -d "integration/legacy" ]; then
        cd integration/legacy
        if [ -f "run_test.sh" ]; then
            chmod +x run_test.sh
            ./run_test.sh
            print_success "Legacy integration tests completed"
        else
            print_warning "No integration test runner found"
        fi
        cd ../..
    fi
}

# Function to run performance tests
run_performance_tests() {
    print_status "Running performance tests..."
    
    if [ -f "performance/test_performance.py" ]; then
        python3 performance/test_performance.py
        print_success "Performance tests completed"
    else
        print_warning "Performance tests not found"
    fi
}

# Function to run Docker tests
run_docker_tests() {
    print_status "Running Docker tests..."
    
    if [ -f "docker/docker-compose.test.yml" ]; then
        if command_exists docker; then
            docker compose -f docker/docker-compose.test.yml up --build --abort-on-container-exit
            print_success "Docker tests completed"
        else
            print_error "Docker not found. Please install Docker"
            return 1
        fi
    else
        print_warning "Docker test configuration not found"
    fi
}

# Main function
main() {
    echo "🧪 Pokedex Test Runner"
    echo "======================"
    echo ""
    
    # Parse command line arguments
    case "${1:-all}" in
        "backend")
            run_backend_tests
            ;;
        "frontend")
            run_frontend_tests
            ;;
        "integration")
            run_integration_tests
            ;;
        "performance")
            run_performance_tests
            ;;
        "docker")
            run_docker_tests
            ;;
        "all")
            print_status "Running all tests..."
            run_backend_tests
            echo ""
            run_frontend_tests
            echo ""
            run_integration_tests
            echo ""
            run_performance_tests
            echo ""
            run_docker_tests
            print_success "All tests completed!"
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [test_type]"
            echo ""
            echo "Test types:"
            echo "  backend      - Run backend tests only"
            echo "  frontend     - Run frontend tests only"
            echo "  integration  - Run integration tests only"
            echo "  performance  - Run performance tests only"
            echo "  docker       - Run Docker tests only"
            echo "  all          - Run all tests (default)"
            echo "  help         - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Run all tests"
            echo "  $0 backend           # Run backend tests only"
            echo "  $0 frontend          # Run frontend tests only"
            ;;
        *)
            print_error "Unknown test type: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
