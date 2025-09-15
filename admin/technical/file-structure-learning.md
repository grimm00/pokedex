# Backend File Structure Learning Guide

## Overview
This document explains the purpose and structure of each file in our Flask backend, from top to bottom in order of creation.

## File Creation Order & Purpose

### 1. `requirements.txt` ✅ CREATED
**Purpose**: Python package dependencies
**What it does**: 
- Lists all Python packages needed for the project
- Allows `pip install -r requirements.txt` to install everything
- Ensures consistent environment across machines
**Key packages**:
- `Flask` - Web framework
- `Flask-SQLAlchemy` - Database ORM
- `Flask-Migrate` - Database migrations
- `Flask-CORS` - Cross-origin requests
- `psycopg2-binary` - PostgreSQL adapter

### 2. `backend/__init__.py` ✅ CREATED
**Purpose**: Makes `backend/` a Python package
**What it does**: 
- Tells Python this directory is a package
- Allows imports like `from backend.app import db`
- Required for any Python directory to be importable

### 3. `backend/app.py` ✅ CREATED
**Purpose**: Main Flask application entry point
**What it does**:
- Creates the Flask app instance
- Configures database connection
- Sets up CORS for frontend communication
- Registers all routes and blueprints
- Defines the health check endpoint
**Key components**:
- App configuration (database URL, secret key)
- Extension initialization (SQLAlchemy, Migrate, CORS)
- Blueprint registration
- Main execution block

### 4. `backend/models/__init__.py` ✅ CREATED
**Purpose**: Makes `models/` a Python package
**What it does**: 
- Allows importing models from the models directory
- Required for `from backend.models import pokemon, user`

### 5. `backend/services/` ✅ CREATED
**Purpose**: Business logic services directory
**What it does**:
- Contains core business logic and external integrations
- Separates concerns from routes and models
- Houses cache, security, and external API clients

### 6. `backend/utils/` ✅ CREATED
**Purpose**: Utility scripts and tools directory
**What it does**:
- Contains data seeding and maintenance scripts
- Houses development and deployment utilities
- Separates utility code from core application logic

### 7. `backend/models/pokemon.py` ✅ CREATED
**Purpose**: Pokemon database model
**What it does**:
- Defines the Pokemon table structure
- Maps Python objects to database rows
- Provides data validation and relationships
- Includes methods to convert to JSON for API responses
**Key features**:
- Stores Pokemon data from PokeAPI
- JSON fields for complex data (types, abilities, stats)
- Timestamps for tracking changes
- `to_dict()` method for API serialization

### 6. `backend/models/user.py` ✅ CREATED
**Purpose**: User and user-pokemon relationship models
**What it does**:
- Defines User table for authentication
- Defines UserPokemon table for favorites
- Establishes relationships between users and pokemon
- Provides user management functionality
**Key features**:
- User account information
- Many-to-many relationship with Pokemon
- Favorites tracking system

## Files Still Needed (In Order)

### 7. `backend/routes/__init__.py` (Next)
**Purpose**: Makes `routes/` a Python package
**What it does**: 
- Allows importing routes from the routes directory
- Required for `from backend.routes import api`

### 8. `backend/routes/api.py` (After __init__.py)
**Purpose**: API endpoint definitions
**What it does**:
- Defines all REST API endpoints
- Handles HTTP requests and responses
- Connects frontend to database through models
- Implements CRUD operations for Pokemon
**Key endpoints**:
- `GET /api/pokemon` - List all Pokemon
- `GET /api/pokemon/<id>` - Get specific Pokemon
- `POST /api/pokemon` - Create new Pokemon
- `PUT /api/pokemon/<id>` - Update Pokemon
- `DELETE /api/pokemon/<id>` - Delete Pokemon

### 9. `.env` (After routes)
**Purpose**: Environment variables
**What it does**:
- Stores sensitive configuration data
- Keeps secrets out of code
- Allows different configs for dev/prod
**Key variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Flask session encryption
- `POKEAPI_BASE_URL` - External API endpoint

### 10. `backend/config.py` (After .env)
**Purpose**: Configuration management
**What it does**:
- Centralizes all app configuration
- Handles different environments (dev, test, prod)
- Validates required environment variables
- Provides default values

## Learning Points

### Why This Order?
1. **Dependencies First**: `requirements.txt` before any code
2. **Package Structure**: `__init__.py` files to make directories importable
3. **Core App**: Main application file with basic setup
4. **Data Layer**: Models define the database structure
5. **API Layer**: Routes handle HTTP requests
6. **Configuration**: Environment and config management

### Key Concepts
- **Models**: Define database tables and relationships
- **Routes**: Handle HTTP requests and return responses
- **Blueprints**: Organize routes into modules
- **Migrations**: Track database schema changes
- **Environment Variables**: Secure configuration management

### Next Steps
1. Create `backend/routes/__init__.py`
2. Create `backend/routes/api.py` with Pokemon endpoints
3. Set up environment configuration
4. Test the complete backend

This structure follows Flask best practices and makes the code maintainable and scalable.

