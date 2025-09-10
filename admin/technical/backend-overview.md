# Backend Technology Stack Overview

## Overview
This document provides a detailed breakdown of each backend component from our ADR-001, explaining what each technology does, why we chose it, and how it fits into our Pokedex project.

## Core Backend Components

### 1. Python 3.11+
**What it is**: Programming language for our backend
**Why we chose it**: 
- Your most-used language (focus on concepts, not syntax)
- Widely used in DevOps tooling and automation
- Excellent ecosystem for data processing and APIs
- Great for learning web development fundamentals

**How it fits**: 
- Powers our Flask web framework
- Handles all server-side logic
- Integrates with databases and external APIs
- Runs our business logic and data processing

**Learning value**: 
- Understanding web server concepts
- API development patterns
- Database integration
- Error handling and logging

---

### 2. Flask with Flask-RESTful
**What it is**: Lightweight web framework for building APIs
**Why we chose it**:
- Simple and minimal (teaches fundamentals without magic)
- Easy to understand request/response cycle
- Flexible and extensible
- Great for learning web development concepts

**How it fits**:
- Handles HTTP requests from frontend
- Routes requests to appropriate handlers
- Manages request/response lifecycle
- Provides middleware and extensions

**Key concepts to learn**:
- HTTP methods (GET, POST, PUT, DELETE)
- URL routing and parameters
- Request/response handling
- Middleware and decorators

**Current status**: ⚠️ We're using basic Flask, need to migrate to Flask-RESTful

---

### 3. PostgreSQL with SQLAlchemy ORM
**What it is**: 
- **PostgreSQL**: Relational database management system
- **SQLAlchemy**: Object-Relational Mapping tool

**Why we chose it**:
- **PostgreSQL**: ACID compliance, JSON support, production-ready
- **SQLAlchemy**: Industry standard, teaches database concepts, excellent Python integration

**How it fits**:
- Stores Pokemon data, user accounts, and favorites
- Handles data relationships and constraints
- Provides data persistence and retrieval
- Manages database transactions

**Key concepts to learn**:
- Database design and normalization
- SQL queries and relationships
- ORM patterns and migrations
- Data validation and constraints

**Current status**: ✅ Models created, need to set up database

---

### 4. Flask-Migrate
**What it is**: Database migration tool for SQLAlchemy
**Why we chose it**:
- Tracks database schema changes
- Version controls database structure
- Enables safe database updates
- Essential for production deployments

**How it fits**:
- Manages database schema evolution
- Handles table creation and modifications
- Tracks migration history
- Enables rollback capabilities

**Key concepts to learn**:
- Database versioning
- Schema migration patterns
- Production deployment safety
- Team collaboration on database changes

**Current status**: ⚠️ Not yet configured

---

### 5. Flask-RESTX (Swagger Documentation)
**What it is**: API documentation and validation tool
**Why we chose it**:
- Auto-generates API documentation
- Provides interactive API testing interface
- Validates request/response data
- Improves API usability and testing

**How it fits**:
- Documents all API endpoints
- Provides Swagger UI for testing
- Validates incoming requests
- Generates client SDKs

**Key concepts to learn**:
- API documentation standards
- Request/response validation
- API testing and debugging
- Client integration patterns

**Current status**: ❌ Not yet implemented

---

### 6. Flask-JWT-Extended + bcrypt (Security)
**What it is**: JWT authentication and password hashing
**Why we chose it**:
- Industry standard for API authentication
- Secure token-based authentication
- Password hashing with bcrypt
- Role-based access control

**How it fits**:
- Protects user endpoints with JWT tokens
- Hashes passwords securely
- Implements admin vs user permissions
- Manages token expiration and refresh

**Key concepts to learn**:
- JWT token authentication
- Password hashing and verification
- Role-based access control
- API security best practices

**Current status**: ✅ Implemented

### 7. pytest + Flask-Testing
**What it is**: Testing framework for Python applications
**Why we chose it**:
- Industry standard for Python testing
- Excellent Flask integration
- Supports unit, integration, and API testing
- Enables test-driven development

**How it fits**:
- Tests business logic and API endpoints
- Validates database operations
- Ensures code quality and reliability
- Enables continuous integration

**Key concepts to learn**:
- Unit testing principles
- Test-driven development
- Mocking and test fixtures
- Test coverage and quality metrics

**Current status**: ❌ Not yet implemented

---

## Additional Backend Components

### 7. Redis (Caching)
**What it is**: In-memory data store for caching
**Why we chose it**:
- Improves API performance
- Reduces database load
- Handles session storage
- Industry standard for caching

**How it fits**:
- Caches Pokemon data from PokeAPI
- Stores user sessions
- Handles rate limiting
- Improves response times

**Key concepts to learn**:
- Caching strategies and patterns
- Performance optimization
- Session management
- Data expiration and invalidation

**Current status**: ❌ Not yet implemented

---

### 8. Marshmallow (Serialization)
**What it is**: Data serialization and validation library
**Why we chose it**:
- Validates incoming request data
- Serializes response data
- Handles data transformation
- Integrates well with Flask

**How it fits**:
- Validates API request payloads
- Serializes database models to JSON
- Handles data type conversion
- Provides error handling for invalid data

**Key concepts to learn**:
- Data validation patterns
- Serialization/deserialization
- Error handling and validation
- API contract enforcement

**Current status**: ❌ Not yet implemented

---

## Backend Architecture Flow

```
Frontend Request → Flask-RESTful → Marshmallow Validation → Business Logic → SQLAlchemy → PostgreSQL
                     ↓
                Flask-RESTX Documentation
                     ↓
                Redis Cache (optional)
```

## Current Implementation Status

### ✅ Completed
- Basic Flask app structure
- SQLAlchemy models (Pokemon, User)
- Requirements.txt with basic dependencies

### ⚠️ Needs Updates
- Migrate from basic Flask to Flask-RESTful
- Add missing dependencies to requirements.txt
- Set up database configuration

### ❌ Not Started
- Flask-RESTX for API documentation
- Marshmallow for serialization
- Redis for caching
- Testing framework setup
- Database migrations

## Next Steps

1. **Update requirements.txt** - Add Flask-RESTful, Flask-RESTX, Marshmallow
2. **Migrate app.py** - Convert to Flask-RESTful structure
3. **Set up database** - Configure PostgreSQL and migrations
4. **Add API documentation** - Implement Flask-RESTX
5. **Set up testing** - Configure pytest and test structure

## Learning Objectives

By the end of backend development, you should understand:
- How web APIs work and handle requests
- Database design and ORM patterns
- API documentation and testing
- Caching and performance optimization
- Error handling and validation
- Production deployment considerations

## Questions for Deeper Learning

- **Flask-RESTful**: How do resource classes work? What's the difference between GET and POST?
- **SQLAlchemy**: How do relationships work? What's the difference between lazy and eager loading?
- **PostgreSQL**: How do indexes improve performance? What's the difference between INNER and LEFT JOIN?
- **Testing**: How do you test database operations? What's the difference between unit and integration tests?
- **Caching**: When should you cache data? How do you handle cache invalidation?

---

*This overview provides the foundation for understanding our backend architecture. Each component can be explored in detail as we implement it.*
