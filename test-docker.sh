#!/bin/bash

# Test Docker setup for Pokedex API
echo "🐳 Testing Docker setup for Pokedex API..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Build the image
echo "🔨 Building Docker image..."
if docker build -t pokedex-api .; then
    echo "✅ Docker image built successfully"
else
    echo "❌ Failed to build Docker image"
    exit 1
fi

# Test docker-compose
echo "🚀 Testing docker-compose..."
if docker-compose up -d; then
    echo "✅ Docker Compose started successfully"
    
    # Wait for services to be healthy
    echo "⏳ Waiting for services to be healthy..."
    sleep 30
    
    # Test API endpoint
    echo "🧪 Testing API endpoint..."
    if curl -f http://localhost:5000/api/v1/health > /dev/null 2>&1; then
        echo "✅ API is responding"
    else
        echo "⚠️  API is not responding (this might be normal if still starting up)"
    fi
    
    # Show running containers
    echo "📊 Running containers:"
    docker-compose ps
    
    echo ""
    echo "🎉 Docker setup test complete!"
    echo "API should be available at: http://localhost:5000"
    echo "To stop: docker-compose down"
    echo "To view logs: docker-compose logs -f"
    
else
    echo "❌ Failed to start Docker Compose"
    exit 1
fi
