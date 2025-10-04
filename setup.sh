#!/bin/bash

# Pokehub Development Environment Setup
# This script sets up the complete development environment for Pokehub
# Supports: Backend (Flask/Python), Frontend (React/Node), and Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
REQUIRED_PYTHON_VERSION="3.9"
REQUIRED_NODE_VERSION="18"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print functions
print_header() {
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${CYAN}$(printf '═%.0s' $(seq 1 ${#1}))${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Compare versions
version_ge() {
    printf '%s\n%s' "$2" "$1" | sort -V -C
}

# Main setup
main() {
    print_header "🚀 Pokehub Development Environment Setup"
    echo ""
    
    # Parse arguments
    SETUP_BACKEND=true
    SETUP_FRONTEND=true
    SKIP_REDIS=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only)
                SETUP_FRONTEND=false
                shift
                ;;
            --frontend-only)
                SETUP_BACKEND=false
                shift
                ;;
            --skip-redis)
                SKIP_REDIS=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Run with --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Run setup steps
    check_prerequisites
    
    if [ "$SETUP_BACKEND" = true ]; then
        setup_backend
    fi
    
    if [ "$SETUP_FRONTEND" = true ]; then
        setup_frontend
    fi
    
    setup_environment
    show_completion_message
}

show_help() {
    cat << EOF
Pokehub Development Environment Setup

Usage: ./setup.sh [OPTIONS]

OPTIONS:
    --backend-only      Set up backend only (Python/Flask)
    --frontend-only     Set up frontend only (React/Node)
    --skip-redis        Skip Redis installation (for Docker-only setups)
    --help              Show this help message

EXAMPLES:
    # Full setup (backend + frontend)
    ./setup.sh

    # Backend only
    ./setup.sh --backend-only

    # Frontend only
    ./setup.sh --frontend-only

    # Skip Redis (using Docker)
    ./setup.sh --skip-redis

WHAT THIS SCRIPT DOES:
    1. Checks prerequisites (Python, Node, Redis)
    2. Sets up Python virtual environment
    3. Installs backend dependencies
    4. Sets up database and seeds Pokemon data
    5. Installs frontend dependencies
    6. Creates .env file from template
    7. Provides startup instructions

For more details, see: DEVELOPMENT.md

EOF
}

check_prerequisites() {
    print_header "📋 Checking Prerequisites"
    echo ""
    
    local missing_required=()
    
    # Check Python
    if ! command_exists python3; then
        print_error "Python 3 is required but not installed"
        missing_required+=("Python 3.9+")
    else
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        if version_ge "$PYTHON_VERSION" "$REQUIRED_PYTHON_VERSION"; then
            print_success "Python $PYTHON_VERSION found"
        else
            print_error "Python $REQUIRED_PYTHON_VERSION or higher required. Found: $PYTHON_VERSION"
            missing_required+=("Python $REQUIRED_PYTHON_VERSION+")
        fi
    fi
    
    # Check Node.js (if setting up frontend)
    if [ "$SETUP_FRONTEND" = true ]; then
        if ! command_exists node; then
            print_error "Node.js is required but not installed"
            missing_required+=("Node.js $REQUIRED_NODE_VERSION+")
        else
            NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
            if [ "$NODE_VERSION" -ge "$REQUIRED_NODE_VERSION" ]; then
                print_success "Node.js v$(node -v | sed 's/v//') found"
            else
                print_error "Node.js $REQUIRED_NODE_VERSION or higher required. Found: v$(node -v | sed 's/v//')"
                missing_required+=("Node.js $REQUIRED_NODE_VERSION+")
            fi
        fi
        
        # Check npm
        if ! command_exists npm; then
            print_error "npm is required but not installed"
            missing_required+=("npm")
        else
            print_success "npm $(npm -v) found"
        fi
    fi
    
    # Check Redis (if not skipped)
    if [ "$SKIP_REDIS" = false ] && [ "$SETUP_BACKEND" = true ]; then
        if ! command_exists redis-server; then
            print_warning "Redis is not installed"
            print_info "Redis is required for caching. Install it or use --skip-redis for Docker-only setup"
            
            # Offer to install Redis
            read -p "Would you like to install Redis now? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                install_redis
            else
                print_warning "Skipping Redis installation. You'll need to run Redis separately or use Docker."
            fi
        else
            print_success "Redis found"
        fi
    fi
    
    # Check Git
    if ! command_exists git; then
        print_error "Git is required but not installed"
        missing_required+=("Git")
    else
        print_success "Git $(git --version | cut -d' ' -f3) found"
    fi
    
    # Exit if missing required dependencies
    if [ ${#missing_required[@]} -gt 0 ]; then
        echo ""
        print_error "Missing required dependencies:"
        for dep in "${missing_required[@]}"; do
            echo "  - $dep"
        done
        echo ""
        print_info "Please install missing dependencies and try again"
        exit 1
    fi
    
    echo ""
}

install_redis() {
    print_step "Installing Redis..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install redis
            print_success "Redis installed via Homebrew"
        else
            print_error "Homebrew is required to install Redis on macOS"
            print_info "Install Homebrew: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists apt-get; then
            sudo apt-get update
            sudo apt-get install -y redis-server
            print_success "Redis installed via apt-get"
        elif command_exists yum; then
            sudo yum install -y redis
            print_success "Redis installed via yum"
        else
            print_error "Package manager not found. Please install Redis manually"
            exit 1
        fi
    else
        print_error "Unsupported operating system: $OSTYPE"
        print_info "Please install Redis manually"
        exit 1
    fi
}

setup_backend() {
    print_header "🐍 Backend Setup (Python/Flask)"
    echo ""
    
    # Create .env file FIRST (needed for all subsequent steps)
    if [ ! -f ".env" ]; then
        print_step "Creating .env file from template..."
        cp env.example .env
        print_success ".env file created"
        print_warning "Please update .env with your actual configuration values"
    else
        print_info ".env file already exists"
        
        # Check if env.example is newer than .env (indicates stale config)
        if [ env.example -nt .env ]; then
            print_warning ".env file is older than env.example - consider updating"
            print_info "Run: diff .env env.example to see changes"
        fi
    fi
    
    echo ""
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_step "Creating virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_info "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    print_step "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    print_step "Upgrading pip..."
    pip install --upgrade pip --quiet
    print_success "pip upgraded"
    
    # Install dependencies
    print_step "Installing Python dependencies..."
    pip install -r backend/requirements.txt --quiet
    print_success "Python dependencies installed"
    
    # Create backend instance directory
    print_step "Creating backend instance directory..."
    mkdir -p backend/instance
    print_success "Backend instance directory created"
    
    # Initialize database
    print_step "Initializing database..."
    cd "$PROJECT_ROOT/backend"
    export FLASK_APP=app
    python -m flask db upgrade
    cd "$PROJECT_ROOT"
    print_success "Database initialized"
    
    # Seed Pokemon data
    print_step "Seeding Pokemon data (this may take a minute)..."
    python -c "
from backend.app import app
from backend.utils.pokemon_seeder import pokemon_seeder
with app.app_context():
    result = pokemon_seeder.seed_all_generations()
    print(f'✅ Seeded {result[\"successful\"]} Pokemon')
" || {
    print_warning "Pokemon seeding failed or partially completed"
    print_info "You can seed data later with: python -c \"from backend.app import app; from backend.utils.pokemon_seeder import pokemon_seeder; app.app_context().push(); pokemon_seeder.seed_all_generations()\""
}
    
    # Start Redis if not running
    if [ "$SKIP_REDIS" = false ] && command_exists redis-server; then
        if ! pgrep -x "redis-server" > /dev/null; then
            print_step "Starting Redis server..."
            redis-server --daemonize yes
            print_success "Redis server started"
        else
            print_info "Redis server already running"
        fi
    fi
    
    echo ""
}

setup_frontend() {
    print_header "⚛️  Frontend Setup (React/Node)"
    echo ""
    
    cd "$PROJECT_ROOT/frontend"
    
    # Install dependencies
    print_step "Installing Node dependencies..."
    npm install --silent
    print_success "Node dependencies installed"
    
    cd "$PROJECT_ROOT"
    echo ""
}

setup_environment() {
    print_header "🔧 Environment Configuration"
    echo ""
    
    # .env file is now created at the beginning of backend setup
    # This section kept for any future environment-specific configuration
    print_info "Environment configuration complete (handled in backend setup)"
    
    echo ""
}

show_completion_message() {
    print_header "🎉 Setup Complete!"
    echo ""
    
    print_info "Your Pokehub development environment is ready!"
    echo ""
    
    if [ "$SETUP_BACKEND" = true ] && [ "$SETUP_FRONTEND" = true ]; then
        echo -e "${BOLD}To start development:${NC}"
        echo ""
        echo -e "${CYAN}Option 1: Full-Stack (Recommended)${NC}"
        echo "  # Terminal 1 - Backend"
        echo "  source venv/bin/activate"
        echo "  python -m backend.app"
        echo ""
        echo "  # Terminal 2 - Frontend"
        echo "  cd frontend && npm run dev"
        echo ""
        echo -e "${CYAN}Option 2: Docker (All-in-One)${NC}"
        echo "  docker compose up --build"
        echo ""
        echo -e "${BOLD}Access Points:${NC}"
        echo "  • Full Application: http://localhost"
        echo "  • Backend API: http://localhost/api/v1/"
        echo "  • Frontend Dev: http://localhost:5173 (if running separately)"
        echo ""
    elif [ "$SETUP_BACKEND" = true ]; then
        echo -e "${BOLD}To start the backend:${NC}"
        echo "  source venv/bin/activate"
        echo "  python -m backend.app"
        echo ""
        echo -e "${BOLD}Access Points:${NC}"
        echo "  • Backend API: http://localhost:5000"
        echo ""
    elif [ "$SETUP_FRONTEND" = true ]; then
        echo -e "${BOLD}To start the frontend:${NC}"
        echo "  cd frontend && npm run dev"
        echo ""
        echo -e "${BOLD}Access Points:${NC}"
        echo "  • Frontend: http://localhost:5173"
        echo ""
    fi
    
    echo -e "${BOLD}Useful Commands:${NC}"
    echo "  • Run tests: cd backend && pytest"
    echo "  • Check status: ./scripts/workflow-helper.sh status"
    echo "  • View logs: docker compose logs -f (if using Docker)"
    echo ""
    
    echo -e "${BOLD}Documentation:${NC}"
    echo "  • Development Guide: DEVELOPMENT.md"
    echo "  • Contributing: CONTRIBUTING.md"
    echo "  • API Docs: http://localhost/api/docs (when running)"
    echo ""
    
    print_success "Happy coding! 🚀"
}

# Run main function
main "$@"