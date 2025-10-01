# Flask app.py Syntax Guide

## Overview
This document explains every line of code in `backend/app.py` and what each part does in our Flask application.

## Line-by-Line Breakdown

### Imports Section (Lines 1-6)
```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os
from dotenv import load_dotenv
```

**What each import does:**
- `Flask` - The main web framework class
- `SQLAlchemy` - Database ORM (Object-Relational Mapping) for database operations
- `Migrate` - Handles database schema changes and migrations
- `CORS` - Cross-Origin Resource Sharing, allows frontend to talk to backend
- `os` - Python's operating system interface for environment variables
- `load_dotenv` - Loads environment variables from .env file

### Environment Setup (Lines 8-9)
```python
# Load environment variables
load_dotenv()
```
**Purpose:** Loads variables from `.env` file into the environment so we can access them with `os.environ.get()`

### Flask App Initialization (Lines 11-12)
```python
# Initialize Flask app
app = Flask(__name__)
```
**Purpose:** Creates the main Flask application instance
- `__name__` tells Flask where to find templates and static files
- `app` is our main application object that we'll configure and run

### Configuration Section (Lines 14-20)
```python
# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 
    'postgresql://localhost/pokedex_dev'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
```

**What each config does:**
- `SECRET_KEY` - Used for session encryption and security
  - `os.environ.get('SECRET_KEY', 'dev-secret-key')` - Gets from environment, uses default if not found
- `SQLALCHEMY_DATABASE_URI` - Database connection string
  - Points to PostgreSQL database named 'pokedex_dev'
- `SQLALCHEMY_TRACK_MODIFICATIONS` - Disables SQLAlchemy's change tracking (performance optimization)

### Extension Initialization (Lines 22-25)
```python
# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)
```

**What each extension does:**
- `db = SQLAlchemy(app)` - Creates database object linked to our Flask app
- `migrate = Migrate(app, db)` - Sets up database migration system
- `CORS(app)` - Enables cross-origin requests (frontend can call backend)

### Import Models and Routes (Lines 27-28)
```python
# Import models and routes
from backend.models import pokemon, user
from backend.routes import api
```

**Purpose:** Imports our data models and API routes
- `pokemon, user` - Our database model files
- `api` - Our API route definitions

### Blueprint Registration (Lines 30-31)
```python
# Register blueprints
app.register_blueprint(api.bp, url_prefix='/api')
```

**What this does:**
- Registers our API routes with the Flask app
- `url_prefix='/api'` means all our API endpoints will start with `/api/`
- So a route like `@api.bp.route('/pokemon')` becomes `/api/pokemon`

### Health Check Route (Lines 33-38)
```python
@app.route('/')
def health_check():
    return {
        'status': 'healthy',
        'message': 'Pokedex API is running',
        'version': '1.0.0'
    }
```

**What this does:**
- `@app.route('/')` - Decorator that creates a route at the root URL
- `def health_check():` - Function that handles requests to that route
- Returns JSON response with API status
- Useful for testing if the API is running

### Main Execution Block (Lines 40-44)
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

**What this does:**
- `if __name__ == '__main__':` - Only runs when file is executed directly (not imported)
- `app.run()` - Starts the Flask development server
- `debug=True` - Enables debug mode (auto-reload on changes, better error messages)
- `host='0.0.0.0'` - Makes server accessible from any IP address
- `port=5000` - Runs on port 5000

## Key Flask Concepts

### Decorators
- `@app.route('/')` - Creates URL routes
- `@api.bp.route('/pokemon')` - Creates routes within blueprints

### Configuration
- `app.config` - Dictionary for storing app settings
- Environment variables for sensitive data
- Default values for development

### Extensions
- SQLAlchemy - Database operations
- Migrate - Database schema changes
- CORS - Cross-origin requests

### Blueprints
- Organize routes into modules
- `url_prefix` adds common prefix to all routes
- Makes code more maintainable

## How It All Works Together

1. **App starts** - Flask application is created
2. **Configuration loaded** - Database and security settings applied
3. **Extensions initialized** - Database, migrations, CORS set up
4. **Models imported** - Database table definitions loaded
5. **Routes registered** - API endpoints connected to app
6. **Server starts** - Flask development server runs on port 5000

## Testing the App

Once running, you can test:
- `http://localhost:5000/` - Health check endpoint
- `http://localhost:5000/api/` - API endpoints (once routes are created)

This structure follows Flask best practices and makes the code organized and maintainable.

