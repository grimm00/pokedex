# User Routes Syntax Guide

## Overview
This document explains the `backend/routes/user_routes.py` file, including protected user endpoints, role-based access control, and favorites management.

## File Structure
```python
# Imports
from flask_restful import Resource, reqparse, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app import db
from backend.models.user import User, UserPokemon
from backend.models.pokemon import Pokemon

# Protected Resource Classes
class UserList(Resource):       # List users (admin only)
class UserDetail(Resource):     # Individual user management
class UserFavorites(Resource):  # Favorites management
```

## Imports Section (Lines 1-5)

### **Flask-RESTful Imports**
```python
from flask_restful import Resource, reqparse, abort
```
- **Resource**: Base class for API endpoints
- **reqparse**: Request argument parsing and validation
- **abort**: Clean error handling with HTTP status codes

### **JWT Security Imports**
```python
from flask_jwt_extended import jwt_required, get_jwt_identity
```
- **jwt_required**: Decorator for protecting endpoints
- **get_jwt_identity**: Gets current user ID from JWT token

### **Database and Model Imports**
```python
from backend.app import db
from backend.models.user import User, UserPokemon
from backend.models.pokemon import Pokemon
```
- **db**: SQLAlchemy database instance
- **User**: User model for user management
- **UserPokemon**: Junction table for user favorites
- **Pokemon**: Pokemon model for favorites validation

## UserList Class (Lines 7-35)

### **Class Definition and Method**
```python
class UserList(Resource):
    """Handle GET /api/users and POST /api/users"""
    
    @jwt_required()
    def get(self):
        """Get all users with optional pagination (admin only)"""
```

**Purpose**: Lists all users in the system (admin-only endpoint)

### **Admin Authorization Check (Lines 12-17)**
```python
current_user_id = get_jwt_identity()
current_user = User.query.get(current_user_id)

if not current_user or not current_user.is_admin:
    return {'message': 'Admin access required'}, 403
```

**Security Features:**
- **JWT Required**: `@jwt_required()` ensures user is authenticated
- **Admin Check**: Verifies user has admin privileges
- **Access Denied**: Returns 403 Forbidden if not admin
- **User Validation**: Ensures user still exists in database

### **Pagination Setup (Lines 19-22)**
```python
parser = reqparse.RequestParser()
parser.add_argument('page', type=int, default=1, help='Page number')
parser.add_argument('per_page', type=int, default=20, help='Items per page')
args = parser.parse_args()
```

**Features:**
- **Page Number**: Defaults to page 1
- **Items Per Page**: Defaults to 20 items
- **Type Validation**: Ensures numeric values
- **Help Messages**: Clear error messages for invalid input

### **Pagination Implementation (Lines 24-35)**
```python
# Apply pagination
page = args['page']
per_page = min(args['per_page'], 100)  # Limit max items per page

users_paginated = User.query.paginate(
    page=page, 
    per_page=per_page, 
    error_out=False
)

return {
    'users': [user.to_dict() for user in users_paginated.items],
    'pagination': {
        'page': page,
        'per_page': per_page,
        'total': users_paginated.total,
        'pages': users_paginated.pages,
        'has_next': users_paginated.has_next,
        'has_prev': users_paginated.has_prev
    }
}
```

**Pagination Features:**
- **Max Limit**: Caps at 100 items per page for performance
- **Error Handling**: `error_out=False` prevents crashes on invalid pages
- **Complete Info**: Returns pagination metadata
- **User Serialization**: Converts users to dictionary format

## UserDetail Class (Lines 37-155)

### **Class Definition and Methods**
```python
class UserDetail(Resource):
    """Handle GET /api/users/<id>, PUT /api/users/<id>, DELETE /api/users/<id>"""
    
    @jwt_required()
    def get(self, user_id):
        """Get a specific user by ID (own data or admin)"""
    
    @jwt_required()
    def put(self, user_id):
        """Update a user (own data only)"""
    
    @jwt_required()
    def delete(self, user_id):
        """Delete a user and their favorites (admin only)"""
```

**Purpose**: Individual user management with different access levels

### **Get User Method (Lines 43-55)**
```python
@jwt_required()
def get(self, user_id):
    """Get a specific user by ID (own data or admin)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    user = User.query.get(user_id)
    
    if not user:
        abort(404, message=f'User with ID {user_id} not found')
    
    # Users can only see their own data, admins can see anyone
    if current_user_id != user_id and not current_user.is_admin:
        return {'message': 'Access denied'}, 403
    
    return user.to_dict()
```

**Authorization Logic:**
- **User Exists**: Check if requested user exists
- **Own Data**: Users can access their own data
- **Admin Access**: Admins can access any user's data
- **Access Denied**: 403 Forbidden for unauthorized access

### **Update User Method (Lines 57-105)**
```python
@jwt_required()
def put(self, user_id):
    """Update a user (own data only)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        abort(404, message=f'User with ID {user_id} not found')
    
    # Users can only update their own data
    if current_user_id != user_id:
        return {'message': 'Access denied'}, 403
```

**Security Features:**
- **Own Data Only**: Users can only update their own profiles
- **User Validation**: Ensures user exists before processing
- **Access Control**: Prevents users from modifying other profiles

#### **Request Parsing (Lines 67-70)**
```python
parser = reqparse.RequestParser()
parser.add_argument('username', type=str, help='Username')
parser.add_argument('email', type=str, help='Email')
args = parser.parse_args()
```

**Note**: All fields are optional for partial updates

#### **Duplicate Check (Lines 72-85)**
```python
# Check if new username or email already exists (excluding current user)
if args['username'] and args['username'] != user.username:
    existing_user = User.query.filter(
        (User.username == args['username']) & (User.id != user_id)
    ).first()
    if existing_user:
        return {'message': 'Username already exists'}, 409

if args['email'] and args['email'] != user.email:
    existing_user = User.query.filter(
        (User.email == args['email']) & (User.id != user_id)
    ).first()
    if existing_user:
        return {'message': 'Email already exists'}, 409
```

**Validation Features:**
- **Uniqueness Check**: Prevents duplicate usernames/emails
- **Self Exclusion**: Allows user to keep their current username/email
- **Conflict Response**: Returns 409 Conflict for duplicates

#### **Update Logic (Lines 87-95)**
```python
# Update user data
if args['username']:
    user.username = args['username']
if args['email']:
    user.email = args['email']

db.session.commit()

return user.to_dict()
```

**Process:**
1. **Partial Updates**: Only updates provided fields
2. **Database Commit**: Saves changes to database
3. **Response**: Returns updated user data

### **Delete User Method (Lines 97-115)**
```python
@jwt_required()
def delete(self, user_id):
    """Delete a user and their favorites (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    user = User.query.get(user_id)
    
    if not user:
        abort(404, message=f'User with ID {user_id} not found')
    
    # Only admins can delete users
    if not current_user or not current_user.is_admin:
        return {'message': 'Admin access required'}, 403
```

**Security Features:**
- **Admin Only**: Only administrators can delete users
- **User Validation**: Ensures user exists before deletion
- **Access Control**: Prevents regular users from deleting accounts

#### **Cascade Deletion (Lines 105-115)**
```python
# Delete user's favorites first
UserPokemon.query.filter_by(user_id=user_id).delete()

# Delete user
db.session.delete(user)
db.session.commit()

return {'message': 'User deleted successfully'}, 200
```

**Data Integrity:**
- **Cascade Delete**: Removes user's favorites before deleting user
- **Referential Integrity**: Maintains database consistency
- **Success Response**: Confirms deletion

## UserFavorites Class (Lines 117-240)

### **Class Definition and Methods**
```python
class UserFavorites(Resource):
    """Handle GET /api/users/<id>/favorites and POST /api/users/<id>/favorites"""
    
    @jwt_required()
    def get(self, user_id):
        """Get user's favorite Pokemon (own data only)"""
    
    @jwt_required()
    def post(self, user_id):
        """Add Pokemon to user's favorites (own data only)"""
    
    @jwt_required()
    def delete(self, user_id):
        """Remove Pokemon from user's favorites (own data only)"""
```

**Purpose**: Manages user's favorite Pokemon with ownership validation

### **Get Favorites Method (Lines 123-140)**
```python
@jwt_required()
def get(self, user_id):
    """Get user's favorite Pokemon (own data only)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        abort(404, message=f'User with ID {user_id} not found')
    
    # Users can only see their own favorites
    if current_user_id != user_id:
        return {'message': 'Access denied'}, 403
    
    favorites = UserPokemon.query.filter_by(user_id=user_id).all()
    
    return {
        'user_id': user_id,
        'favorites': [favorite.to_dict() for favorite in favorites]
    }
```

**Features:**
- **Ownership Check**: Users can only see their own favorites
- **User Validation**: Ensures user exists
- **Favorites Query**: Gets all favorites for the user
- **Serialization**: Converts favorites to dictionary format

### **Add Favorite Method (Lines 142-200)**
```python
@jwt_required()
def post(self, user_id):
    """Add Pokemon to user's favorites (own data only)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        abort(404, message=f'User with ID {user_id} not found')
    
    # Users can only modify their own favorites
    if current_user_id != user_id:
        return {'message': 'Access denied'}, 403
```

**Security**: Same ownership validation as get method

#### **Request Parsing and Validation (Lines 150-160)**
```python
parser = reqparse.RequestParser()
parser.add_argument('pokemon_id', type=int, required=True, help='Pokemon ID is required')
args = parser.parse_args()

# Check if Pokemon exists
pokemon = Pokemon.query.filter_by(pokemon_id=args['pokemon_id']).first()
if not pokemon:
    return {'message': 'Pokemon not found'}, 404
```

**Validation Features:**
- **Required Field**: Pokemon ID must be provided
- **Pokemon Exists**: Validates Pokemon exists in database
- **Error Handling**: Clear error messages for missing data

#### **Duplicate Check and Creation (Lines 162-180)**
```python
# Check if already favorited
existing_favorite = UserPokemon.query.filter_by(
    user_id=user_id, 
    pokemon_id=args['pokemon_id']
).first()

if existing_favorite:
    return {'message': 'Pokemon already in favorites'}, 409

# Add to favorites
favorite = UserPokemon(
    user_id=user_id,
    pokemon_id=args['pokemon_id']
)

db.session.add(favorite)
db.session.commit()

return favorite.to_dict(), 201
```

**Process:**
1. **Duplicate Check**: Prevents adding same Pokemon twice
2. **Create Relationship**: New UserPokemon record
3. **Database Save**: Commit to database
4. **Success Response**: Return created favorite with 201 Created

### **Remove Favorite Method (Lines 202-240)**
```python
@jwt_required()
def delete(self, user_id):
    """Remove Pokemon from user's favorites (own data only)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        abort(404, message=f'User with ID {user_id} not found')
    
    # Users can only modify their own favorites
    if current_user_id != user_id:
        return {'message': 'Access denied'}, 403
```

**Same security pattern**: Ownership validation

#### **Remove Logic (Lines 220-240)**
```python
parser = reqparse.RequestParser()
parser.add_argument('pokemon_id', type=int, required=True, help='Pokemon ID is required')
args = parser.parse_args()

# Find and remove favorite
favorite = UserPokemon.query.filter_by(
    user_id=user_id, 
    pokemon_id=args['pokemon_id']
).first()

if not favorite:
    return {'message': 'Pokemon not in favorites'}, 404

db.session.delete(favorite)
db.session.commit()

return {'message': 'Pokemon removed from favorites'}, 200
```

**Process:**
1. **Find Favorite**: Locate the relationship record
2. **Validation**: Ensure favorite exists
3. **Delete**: Remove from database
4. **Confirm**: Return success message

## Security Patterns

### **Authentication Required**
- **@jwt_required()**: All endpoints require valid JWT token
- **get_jwt_identity()**: Gets current user ID from token
- **User Validation**: Ensures user still exists in database

### **Authorization Levels**
- **Admin Only**: UserList.get(), UserDetail.delete()
- **Own Data**: UserDetail.get/put(), UserFavorites.*
- **Public**: Pokemon endpoints (not in this file)

### **Data Ownership**
- **User ID Check**: `current_user_id != user_id`
- **Admin Override**: `current_user.is_admin`
- **Access Denied**: 403 Forbidden for unauthorized access

### **Input Validation**
- **Required Fields**: Clear error messages for missing data
- **Type Validation**: Ensures correct data types
- **Duplicate Prevention**: Checks for existing records
- **Existence Validation**: Verifies referenced records exist

## Usage Examples

### **Get User List (Admin Only)**
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/v1/users
```

### **Get User Profile (Own Data)**
```bash
curl -H "Authorization: Bearer USER_TOKEN" \
  http://localhost:5000/api/v1/users/1
```

### **Update User Profile (Own Data)**
```bash
curl -X PUT -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "new_username"}' \
  http://localhost:5000/api/v1/users/1
```

### **Add Pokemon to Favorites**
```bash
curl -X POST -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pokemon_id": 25}' \
  http://localhost:5000/api/v1/users/1/favorites
```

### **Get User Favorites**
```bash
curl -H "Authorization: Bearer USER_TOKEN" \
  http://localhost:5000/api/v1/users/1/favorites
```

This user routes system provides secure, role-based access control with comprehensive user management and favorites functionality.

