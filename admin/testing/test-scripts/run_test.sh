#!/bin/bash

# Script to run Flask test app in background with proper process management

echo "🚀 Starting Pokedex API Test Server in background..."

# Kill any existing test processes
pkill -f test_app.py 2>/dev/null

# Start the Flask app in background and redirect output
nohup python test_app.py > test_server.log 2>&1 &

# Get the process ID
PID=$!

# Wait a moment for startup
sleep 2

# Check if the process is still running
if ps -p $PID > /dev/null; then
    echo "✅ Server started successfully (PID: $PID)"
    echo "📝 Logs are being written to: test_server.log"
    echo "🌐 Server should be available at: http://localhost:5001"
    echo ""
    echo "To stop the server, run: kill $PID"
    echo "To view logs: tail -f test_server.log"
    echo "To test endpoints: curl http://localhost:5001/"
else
    echo "❌ Server failed to start. Check test_server.log for errors."
    exit 1
fi
