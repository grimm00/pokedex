# Flask app.py Syntax Guide (Updated with Security)

## Overview
This document explains every line of code in `backend/app.py` after our security implementation, including JWT authentication, role-based access control, and API versioning.

## Line-by-Line Breakdown

### Imports Section (Lines 1-10)
```python
from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_restx import Api as RestXApi
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta
from dotenv import load_dotenv
```

**What each import does:**
- `Flask` - The main web framework class
- `Api` - Flask-RESTful API manager for structured endpoints
- `SQLAlchemy` - Database ORM (Object-Relational Mapping)
- `Migrate` - Database schema migration tool
- `CORS` - Cross-Origin Resource Sharing for frontend communication
- `RestXApi` - API documentation generator (Swagger)
- `JWTManager` - JWT authentication manager
- `os` - Operating system interface for environment variables
- `timedelta` - Time duration for JWT token expiration
- `load_dotenv` - Loads environment variables from .env file

### Environment Setup (Lines 12-13)
```python
# Load environment variables
load_dotenv()
```
**Purpose:** Loads variables from `.env` file into the environment so we can access them with `os.environ.get()`

### Flask App Initialization (Lines 15-16)
```python
# Initialize Flask app
app = Flask(__name__)
```
**Purpose:** Creates the main Flask application instance
- `__name__` tells Flask where to find templates and static files
- `app` is our main application object that we'll configure and run

### Configuration Section (Lines 18-28)
```python
# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 
    'postgresql://localhost/pokedex_dev'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
```

**What each config does:**
- `SECRET_KEY` - Used for session encryption and security
- `SQLALCHEMY_DATABASE_URI` - Database connection string
- `SQLALCHEMY_TRACK_MODIFICATIONS` - Disables SQLAlchemy's change tracking (performance optimization)
- `JWT_SECRET_KEY` - Secret key for JWT token signing and verification
- `JWT_ACCESS_TOKEN_EXPIRES` - Access tokens expire after 1 hour
- `JWT_REFRESH_TOKEN_EXPIRES` - Refresh tokens expire after 30 days

### Extension Initialization (Lines 30-35)
```python
# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)
jwt = JWTManager(app)
```

**What each extension does:**
- `db = SQLAlchemy(app)` - Creates database object linked to our Flask app
- `migrate = Migrate(app, db)` - Sets up database migration system
- `CORS(app)` - Enables cross-origin requests (frontend can call backend)
- `jwt = JWTManager(app)` - Initializes JWT authentication system

### API Initialization (Lines 37-47)
```python
# Initialize Flask-RESTful API with versioning
api = Api(app, prefix='/api/v1')

# Initialize Flask-RESTX for documentation
restx_api = RestXApi(
    app, 
    version='1.0', 
    title='Pokedex API v1',
    description='A comprehensive Pokemon API for learning full-stack development',
    doc='/docs/',
    prefix='/api/v1'
)
```

**What this does:**
- `api = Api(app, prefix='/api/v1')` - Creates RESTful API with versioned URLs
- `restx_api = RestXApi(...)` - Sets up auto-generated API documentation
- All endpoints will be prefixed with `/api/v1/`
- Documentation available at `/docs/`

### Route Registration (Lines 49-67)
```python
# Import models and routes
from backend.models import pokemon, user
from backend.routes import pokemon_routes, user_routes, auth_routes

# Register API routes
# Public routes (no authentication required)
api.add_resource(pokemon_routes.PokemonList, '/pokemon')
api.add_resource(pokemon_routes.PokemonDetail, '/pokemon/<int:pokemon_id>')
api.add_resource(auth_routes.AuthRegister, '/auth/register')
api.add_resource(auth_routes.AuthLogin, '/auth/login')

# Protected routes (authentication required)
api.add_resource(auth_routes.AuthRefresh, '/auth/refresh')
api.add_resource(auth_routes.AuthLogout, '/auth/logout')
api.add_resource(auth_routes.AuthProfile, '/auth/profile')
api.add_resource(user_routes.UserList, '/users')
api.add_resource(user_routes.UserDetail, '/users/<int:user_id>')
api.add_resource(user_routes.UserFavorites, '/users/<int:user_id>/favorites')
```

**What this does:**
- **Imports**: Brings in our models and route modules
- **Public Routes**: No authentication required (Pokemon data, auth endpoints)
- **Protected Routes**: Authentication required (User data, profile management)
- **Resource Registration**: Each `add_resource()` call creates an endpoint

### Health Check Endpoints (Lines 69-84)
```python
# Health check endpoint
@app.route('/')
def health_check():
    return {
        'status': 'healthy',
        'message': 'Pokedex API is running',
        'version': '1.0.0',
        'api_version': 'v1',
        'docs': '/docs/',
        'endpoints': {
            'pokemon': '/api/v1/pokemon',
            'users': '/api/v1/users',
            'health': '/'
        }
    }

# API version info endpoint
@app.route('/api/version')
def api_version():
    return {
        'current_version': 'v1',
        'api_version': '1.0.0',
        'supported_versions': ['v1'],
        'deprecated_versions': [],
        'endpoints': {
            'v1': {
                'pokemon': '/api/v1/pokemon',
                'users': '/api/v1/users',
                'docs': '/docs/'
            }
        }
    }
```

**What these do:**
- **Health Check** (`/`): Shows API status and available endpoints
- **Version Info** (`/api/version`): Displays API version information
- **No Authentication**: These are public endpoints for monitoring

### Main Execution Block (Lines 86-88)
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

## Key Security Concepts

### **JWT Authentication Flow**
1. **User Registration/Login** → JWT tokens generated
2. **Client Request** → Includes token in Authorization header
3. **Token Validation** → `@jwt_required()` decorator validates token
4. **User Identity** → `get_jwt_identity()` gets current user ID
5. **Permission Check** → Route logic checks user permissions

### **Role-Based Access Control**
- **Admin Users**: Full access to all endpoints
- **Regular Users**: Access to own data only
- **Public Endpoints**: No authentication required

### **Token Management**
- **Access Tokens**: Short-lived (1 hour) for API access
- **Refresh Tokens**: Long-lived (30 days) for token renewal
- **Automatic Expiration**: Tokens expire automatically for security

## API Endpoint Structure

### **Public Endpoints** (No Authentication):
- `GET /` - Health check
- `GET /api/version` - Version information
- `GET /api/v1/pokemon` - List Pokemon
- `GET /api/v1/pokemon/<id>` - Get specific Pokemon
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### **Protected Endpoints** (Authentication Required):
- `GET /api/v1/users` - List users (admin only)
- `GET /api/v1/users/<id>` - Get user (own data or admin)
- `PUT /api/v1/users/<id>` - Update user (own data only)
- `DELETE /api/v1/users/<id>` - Delete user (admin only)
- `GET /api/v1/users/<id>/favorites` - Get favorites (own data only)
- `POST /api/v1/users/<id>/favorites` - Add favorite (own data only)
- `DELETE /api/v1/users/<id>/favorites` - Remove favorite (own data only)
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/profile` - Get profile
- `PUT /api/v1/auth/profile` - Update profile

## How It All Works Together

1. **App starts** - Flask application is created
2. **Configuration loaded** - Database, JWT, and security settings applied
3. **Extensions initialized** - Database, migrations, CORS, JWT set up
4. **API configured** - RESTful API and documentation system initialized
5. **Routes registered** - All endpoints connected to the app
6. **Security enabled** - JWT authentication and authorization active
7. **Server starts** - Flask development server runs on port 5000

## Testing the Secure API

### **Start the Server**
```bash
cd /Users/cdwilson/Projects/pokedex
python backend/app.py
```

### **Test Public Endpoints**
```bash
# Health check
curl http://localhost:5000/

# Version info
curl http://localhost:5000/api/version

# Pokemon data (public)
curl http://localhost:5000/api/v1/pokemon
```

### **Test Authentication**
```bash
# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'

# Login user
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Use token for protected endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/v1/auth/profile
```

This updated app.py provides a secure, production-ready API foundation with comprehensive authentication, authorization, and documentation features.

