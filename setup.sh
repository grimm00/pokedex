#!/bin/bash

# Pokedex API Setup Script
# This script sets up the development environment for the Pokedex API

set -e

echo "🚀 Setting up Pokedex API development environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.9 or higher and try again."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
REQUIRED_VERSION="3.9"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Python $REQUIRED_VERSION or higher is required. Found: $PYTHON_VERSION"
    exit 1
fi

echo "✅ Python $PYTHON_VERSION found"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check for Redis
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis is not installed. Installing Redis..."
    
    # Detect OS and install Redis
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install redis
        else
            echo "❌ Homebrew is required to install Redis on macOS."
            echo "Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y redis-server
        elif command -v yum &> /dev/null; then
            sudo yum install -y redis
        else
            echo "❌ Package manager not found. Please install Redis manually."
            exit 1
        fi
    else
        echo "❌ Unsupported operating system: $OSTYPE"
        echo "Please install Redis manually and try again."
        exit 1
    fi
fi

echo "✅ Redis found"

# Start Redis if not running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "🔄 Starting Redis server..."
    redis-server --daemonize yes
fi

# Create instance directory for database
mkdir -p instance

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env with your actual configuration values"
fi

# Run database migrations
echo "🗄️  Setting up database..."
export DATABASE_URL="sqlite:///$(pwd)/instance/pokedex_dev.db"
python -m flask db upgrade

# Seed initial data
echo "🌱 Seeding initial Pokemon data..."
python -m backend.seed_pokemon

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  source venv/bin/activate"
echo "  export DATABASE_URL=\"sqlite:///\$(pwd)/instance/pokedex_dev.db\""
echo "  python -m backend.app"
echo ""
echo "Or use Docker:"
echo "  docker-compose up"
echo ""
echo "API will be available at: http://localhost:5000"
echo "API documentation at: http://localhost:5000/docs/"
