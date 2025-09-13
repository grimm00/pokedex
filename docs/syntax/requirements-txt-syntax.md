# requirements.txt Syntax Guide

## Overview
This document explains the `requirements.txt` file and each dependency in our Pokedex project, including their purpose and how they work together.

## File Purpose
The `requirements.txt` file lists all Python packages needed for the project. It allows anyone to install all dependencies with one command: `pip install -r requirements.txt`

## Dependencies Breakdown

### **Core Flask Framework**
```txt
Flask==2.3.3
```
**What it is**: The main web framework
**Purpose**: Handles HTTP requests, routing, and web server functionality
**Why this version**: Stable, well-tested version with good security patches

### **API Structure & Documentation**
```txt
Flask-RESTful==0.3.10
Flask-RESTX==1.3.0
```
**Flask-RESTful**: Structured API development
- **Purpose**: Creates RESTful APIs with resource classes
- **Benefits**: Clean endpoint organization, built-in request parsing
- **Usage**: `api.add_resource(ResourceClass, '/endpoint')`

**Flask-RESTX**: API documentation and validation
- **Purpose**: Auto-generates Swagger documentation
- **Benefits**: Interactive API testing, request/response validation
- **Usage**: Provides `/docs/` endpoint for API exploration

### **Database & ORM**
```txt
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.5
psycopg2-binary==2.9.7
```
**Flask-SQLAlchemy**: Database ORM (Object-Relational Mapping)
- **Purpose**: Maps Python objects to database tables
- **Benefits**: Type-safe database queries, relationship management
- **Usage**: `db.Model`, `db.Column`, `db.relationship()`

**Flask-Migrate**: Database schema management
- **Purpose**: Tracks and applies database schema changes
- **Benefits**: Version control for database, safe updates
- **Usage**: `flask db migrate`, `flask db upgrade`

**psycopg2-binary**: PostgreSQL database adapter
- **Purpose**: Connects Python to PostgreSQL database
- **Benefits**: High performance, full PostgreSQL feature support
- **Usage**: Required for `postgresql://` connection strings

### **Security & Authentication**
```txt
Flask-JWT-Extended==4.5.3
bcrypt==4.1.2
```
**Flask-JWT-Extended**: JWT authentication system
- **Purpose**: Secure token-based authentication
- **Benefits**: Stateless authentication, token expiration, refresh tokens
- **Usage**: `@jwt_required()`, `create_access_token()`, `get_jwt_identity()`

**bcrypt**: Password hashing
- **Purpose**: Securely hash and verify passwords
- **Benefits**: Salted hashing, slow hashing (prevents brute force)
- **Usage**: `bcrypt.hashpw()`, `bcrypt.checkpw()`

### **Cross-Origin & Environment**
```txt
Flask-CORS==4.0.0
python-dotenv==1.0.0
```
**Flask-CORS**: Cross-Origin Resource Sharing
- **Purpose**: Allows frontend to communicate with backend
- **Benefits**: Handles CORS headers automatically
- **Usage**: `CORS(app)` enables cross-origin requests

**python-dotenv**: Environment variable loading
- **Purpose**: Loads variables from `.env` file
- **Benefits**: Keeps secrets out of code, easy configuration
- **Usage**: `load_dotenv()` loads `.env` into `os.environ`

### **External APIs & Caching**
```txt
requests==2.31.0
redis==5.0.1
```
**requests**: HTTP client library
- **Purpose**: Makes HTTP requests to external APIs (PokeAPI)
- **Benefits**: Simple API, handles JSON responses
- **Usage**: `requests.get(url)`, `requests.post(url, json=data)`

**redis**: Redis database client
- **Purpose**: In-memory data store for caching
- **Benefits**: Fast data access, session storage, rate limiting
- **Usage**: `redis.Redis()`, `redis.set()`, `redis.get()`

### **Data Serialization**
```txt
marshmallow==3.20.1
```
**marshmallow**: Data serialization and validation
- **Purpose**: Validates request data, serializes response data
- **Benefits**: Type validation, error handling, data transformation
- **Usage**: Schema classes for request/response validation

### **Testing Framework**
```txt
pytest==7.4.2
pytest-flask==1.2.0
pytest-cov==4.1.0
```
**pytest**: Testing framework
- **Purpose**: Runs unit and integration tests
- **Benefits**: Simple syntax, powerful fixtures, good reporting
- **Usage**: `pytest tests/`, `def test_function():`

**pytest-flask**: Flask testing utilities
- **Purpose**: Flask-specific testing helpers
- **Benefits**: Test client, database fixtures, authentication helpers
- **Usage**: `@pytest.fixture`, `client.get('/endpoint')`

**pytest-cov**: Test coverage reporting
- **Purpose**: Measures how much code is tested
- **Benefits**: Identifies untested code, quality metrics
- **Usage**: `pytest --cov=backend/`

### **Code Quality Tools**
```txt
black==23.9.1
flake8==6.1.0
```
**black**: Code formatter
- **Purpose**: Automatically formats Python code
- **Benefits**: Consistent style, reduces formatting debates
- **Usage**: `black backend/` formats all Python files

**flake8**: Code linter
- **Purpose**: Checks code for style and errors
- **Benefits**: Catches bugs, enforces style guidelines
- **Usage**: `flake8 backend/` checks code quality

## Dependency Relationships

### **Core Stack**
```
Flask → Flask-RESTful → API Endpoints
Flask → Flask-SQLAlchemy → Database Models
Flask → Flask-Migrate → Database Migrations
```

### **Security Stack**
```
Flask → Flask-JWT-Extended → Authentication
bcrypt → Password Hashing
Flask-CORS → Cross-Origin Security
```

### **External Integration**
```
requests → PokeAPI Integration
redis → Caching Layer
marshmallow → Data Validation
```

### **Development Tools**
```
pytest → Testing Framework
black → Code Formatting
flake8 → Code Linting
```

## Installation Commands

### **Install All Dependencies**
```bash
pip install -r requirements.txt
```

### **Install in Virtual Environment**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### **Install Specific Categories**
```bash
# Core Flask stack
pip install Flask Flask-RESTful Flask-SQLAlchemy Flask-Migrate

# Security stack
pip install Flask-JWT-Extended bcrypt

# Development tools
pip install pytest black flake8
```

## Version Pinning Strategy

### **Why Pin Versions**
- **Reproducible Builds**: Same versions across environments
- **Stability**: Prevents breaking changes from updates
- **Security**: Control when to update vulnerable packages

### **Version Format**
```txt
package==1.2.3    # Exact version
package>=1.2.0    # Minimum version
package~=1.2.0    # Compatible version
```

### **Our Strategy**
- **Exact versions** (`==`) for all packages
- **Stable versions** that are well-tested
- **Security-focused** versions with recent patches
- **Compatible versions** that work together

## Common Issues & Solutions

### **Installation Issues**
```bash
# If psycopg2 fails, try:
pip install psycopg2-binary

# If bcrypt fails on Windows:
pip install --upgrade pip setuptools wheel
pip install bcrypt
```

### **Version Conflicts**
```bash
# Check for conflicts
pip check

# Resolve conflicts
pip install --upgrade package-name
```

### **Missing Dependencies**
```bash
# Install missing packages
pip install -r requirements.txt --force-reinstall
```

## Development Workflow

### **Adding New Dependencies**
1. Install package: `pip install new-package`
2. Add to requirements.txt: `new-package==1.0.0`
3. Test installation: `pip install -r requirements.txt`
4. Commit changes to version control

### **Updating Dependencies**
1. Check for updates: `pip list --outdated`
2. Update specific package: `pip install --upgrade package-name`
3. Update requirements.txt with new version
4. Test application still works
5. Commit updated requirements.txt

This requirements.txt file provides a complete, production-ready stack for building secure, scalable web APIs with Flask.
