#!/usr/bin/env python3
"""
Test script for Flask-RESTful API with real Pokemon data
Uses the main database with seeded Pokemon data
"""

import os
import sys
from flask import Flask

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

# Import the main app
from backend.app import app

if __name__ == '__main__':
    print("🚀 Starting Pokedex API Test Server with Real Data...")
    print("📁 Using main SQLite database with seeded Pokemon data")
    print("🌐 Server starting on http://localhost:5001")
    print("📚 API Documentation: http://localhost:5001/docs/")
    print("🔍 Health Check: http://localhost:5001/")
    print("📊 API Version: http://localhost:5001/api/version")
    print("⏹️  Press Ctrl+C to stop the server")
    
    # Run the app
    app.run(host='0.0.0.0', port=5001, debug=True)

