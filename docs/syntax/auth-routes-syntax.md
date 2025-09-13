# Authentication Routes Syntax Guide

## Overview
This document explains the `backend/routes/auth_routes.py` file, including JWT authentication, user registration, login, and profile management endpoints.

## File Structure
```python
# Imports
from flask_restful import Resource, reqparse, abort
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from backend.app import db
from backend.models.user import User
from datetime import datetime, timezone, timedelta

# Authentication Resource Classes
class AuthRegister(Resource):    # User registration
class AuthLogin(Resource):      # User login
class AuthRefresh(Resource):    # Token refresh
class AuthLogout(Resource):     # User logout
class AuthProfile(Resource):    # Profile management
```

## Imports Section (Lines 1-9)

### **Flask-RESTful Imports**
```python
from flask_restful import Resource, reqparse, abort
```
- **Resource**: Base class for API endpoints
- **reqparse**: Request argument parsing and validation
- **abort**: Clean error handling with HTTP status codes

### **JWT Imports**
```python
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
```
- **create_access_token**: Creates short-lived access tokens
- **create_refresh_token**: Creates long-lived refresh tokens
- **jwt_required**: Decorator for protecting endpoints
- **get_jwt_identity**: Gets current user ID from token
- **get_jwt**: Gets full JWT payload

### **Database and Model Imports**
```python
from backend.app import db
from backend.models.user import User
from datetime import datetime, timezone, timedelta
```
- **db**: SQLAlchemy database instance
- **User**: User model for database operations
- **datetime, timezone**: For timestamp handling
- **timedelta**: For token expiration configuration

## AuthRegister Class (Lines 11-50)

### **Class Definition and Method**
```python
class AuthRegister(Resource):
    """Handle POST /api/v1/auth/register"""
    
    def post(self):
        """Register a new user"""
```

**Purpose**: Handles user registration with password hashing and validation

### **Request Parsing (Lines 15-19)**
```python
parser = reqparse.RequestParser()
parser.add_argument('username', type=str, required=True, help='Username is required')
parser.add_argument('email', type=str, required=True, help='Email is required')
parser.add_argument('password', type=str, required=True, help='Password is required')
args = parser.parse_args()
```

**What this does:**
- **RequestParser**: Validates and extracts request data
- **add_argument**: Defines expected fields with validation rules
- **required=True**: Field must be present in request
- **help**: Error message if validation fails
- **parse_args()**: Extracts and validates data from request

### **Password Validation (Lines 21-23)**
```python
# Validate password strength
if len(args['password']) < 6:
    return {'message': 'Password must be at least 6 characters long'}, 400
```

**Purpose**: Enforces minimum password strength
**Security**: Prevents weak passwords from being accepted
**Response**: Returns 400 Bad Request with error message

### **Duplicate Check (Lines 25-32)**
```python
# Check if username or email already exists
existing_user = User.query.filter(
    (User.username == args['username']) | (User.email == args['email'])
).first()

if existing_user:
    return {'message': 'Username or email already exists'}, 409
```

**What this does:**
- **Database Query**: Checks for existing username or email
- **OR Condition**: Uses `|` operator for either username OR email
- **first()**: Gets first matching record or None
- **Conflict Response**: Returns 409 Conflict if user exists

### **User Creation (Lines 34-42)**
```python
# Create new user
user = User(
    username=args['username'],
    email=args['email']
)
user.set_password(args['password'])

db.session.add(user)
db.session.commit()
```

**Process:**
1. **Create User Object**: Initialize with username and email
2. **Hash Password**: Use `set_password()` method with bcrypt
3. **Add to Session**: Stage user for database insertion
4. **Commit**: Save changes to database

### **Token Generation and Response (Lines 44-50)**
```python
# Create access token
access_token = create_access_token(identity=user.id)
refresh_token = create_refresh_token(identity=user.id)

return {
    'message': 'User registered successfully',
    'user': user.to_dict(),
    'access_token': access_token,
    'refresh_token': refresh_token
}, 201
```

**What this does:**
- **Access Token**: Short-lived token for API access (1 hour)
- **Refresh Token**: Long-lived token for renewal (30 days)
- **identity=user.id**: User ID stored in token payload
- **Success Response**: Returns user data and tokens with 201 Created

## AuthLogin Class (Lines 52-75)

### **Class Definition and Method**
```python
class AuthLogin(Resource):
    """Handle POST /api/v1/auth/login"""
    
    def post(self):
        """Login user and return tokens"""
```

**Purpose**: Authenticates users and returns JWT tokens

### **Request Parsing (Lines 58-61)**
```python
parser = reqparse.RequestParser()
parser.add_argument('username', type=str, required=True, help='Username is required')
parser.add_argument('password', type=str, required=True, help='Password is required')
args = parser.parse_args()
```

**Note**: Accepts username OR email for login flexibility

### **User Lookup (Lines 63-67)**
```python
# Find user by username or email
user = User.query.filter(
    (User.username == args['username']) | (User.email == args['username'])
).first()

if not user or not user.check_password(args['password']):
    return {'message': 'Invalid username or password'}, 401
```

**Security Features:**
- **Flexible Login**: Accepts username or email
- **Password Verification**: Uses `check_password()` method
- **Generic Error**: Same error message for user not found or wrong password
- **Unauthorized Response**: Returns 401 Unauthorized

### **Token Generation and Response (Lines 69-75)**
```python
# Create tokens
access_token = create_access_token(identity=user.id)
refresh_token = create_refresh_token(identity=user.id)

return {
    'message': 'Login successful',
    'user': user.to_dict(),
    'access_token': access_token,
    'refresh_token': refresh_token
}, 200
```

**Same pattern as registration**: Returns user data and tokens

## AuthRefresh Class (Lines 77-90)

### **Class Definition and Method**
```python
class AuthRefresh(Resource):
    """Handle POST /api/v1/auth/refresh"""
    
    @jwt_required(refresh=True)
    def post(self):
        """Refresh access token using refresh token"""
```

**Key Points:**
- **@jwt_required(refresh=True)**: Requires refresh token (not access token)
- **Purpose**: Generates new access token without re-authentication

### **Token Refresh Logic (Lines 82-90)**
```python
current_user_id = get_jwt_identity()
user = User.query.get(current_user_id)

if not user:
    return {'message': 'User not found'}, 404

# Create new access token
access_token = create_access_token(identity=current_user_id)

return {
    'access_token': access_token
}, 200
```

**Process:**
1. **Get User ID**: Extract from refresh token
2. **Verify User**: Check if user still exists
3. **Generate Token**: Create new access token
4. **Return Token**: Send new access token to client

## AuthLogout Class (Lines 92-100)

### **Class Definition and Method**
```python
class AuthLogout(Resource):
    """Handle POST /api/v1/auth/logout"""
    
    @jwt_required()
    def post(self):
        """Logout user (in a real app, you'd blacklist the token)"""
```

**Note**: Current implementation is basic; production would blacklist tokens

### **Logout Response (Lines 99-100)**
```python
# In a production app, you'd add the token to a blacklist
# For now, we'll just return a success message
return {'message': 'Logout successful'}, 200
```

**Future Enhancement**: Implement token blacklisting for security

## AuthProfile Class (Lines 102-180)

### **Class Definition and Methods**
```python
class AuthProfile(Resource):
    """Handle GET /api/v1/auth/profile"""
    
    @jwt_required()
    def get(self):
        """Get current user's profile"""
    
    @jwt_required()
    def put(self):
        """Update current user's profile"""
```

**Purpose**: Profile management for authenticated users

### **Get Profile Method (Lines 108-116)**
```python
@jwt_required()
def get(self):
    """Get current user's profile"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return {'message': 'User not found'}, 404
    
    return user.to_dict(), 200
```

**Process:**
1. **Get User ID**: From JWT token
2. **Find User**: Query database for user
3. **Return Data**: User profile information

### **Update Profile Method (Lines 118-180)**

#### **Request Parsing (Lines 125-129)**
```python
parser = reqparse.RequestParser()
parser.add_argument('username', type=str, help='Username')
parser.add_argument('email', type=str, help='Email')
parser.add_argument('password', type=str, help='New password')
args = parser.parse_args()
```

**Note**: All fields are optional for partial updates

#### **Duplicate Check (Lines 131-150)**
```python
# Check if new username or email already exists (excluding current user)
if args['username'] and args['username'] != user.username:
    existing_user = User.query.filter(
        (User.username == args['username']) & (User.id != current_user_id)
    ).first()
    if existing_user:
        return {'message': 'Username already exists'}, 409

if args['email'] and args['email'] != user.email:
    existing_user = User.query.filter(
        (User.email == args['email']) & (User.id != current_user_id)
    ).first()
    if existing_user:
        return {'message': 'Email already exists'}, 409
```

**Security**: Prevents users from taking existing usernames/emails

#### **Update Logic (Lines 152-165)**
```python
# Update user data
if args['username']:
    user.username = args['username']
if args['email']:
    user.email = args['email']
if args['password']:
    if len(args['password']) < 6:
        return {'message': 'Password must be at least 6 characters long'}, 400
    user.set_password(args['password'])

db.session.commit()

return user.to_dict(), 200
```

**Features:**
- **Partial Updates**: Only updates provided fields
- **Password Validation**: Enforces minimum length
- **Secure Hashing**: Uses `set_password()` method
- **Database Commit**: Saves changes

## JWT Token Flow

### **Registration/Login Flow**
```
1. User submits credentials
2. Validate credentials
3. Create access_token (1 hour)
4. Create refresh_token (30 days)
5. Return tokens to client
```

### **API Request Flow**
```
1. Client includes token in Authorization header
2. @jwt_required() validates token
3. get_jwt_identity() gets user ID
4. Process request with user context
```

### **Token Refresh Flow**
```
1. Access token expires
2. Client sends refresh token
3. @jwt_required(refresh=True) validates refresh token
4. Generate new access token
5. Return new access token
```

## Security Features

### **Password Security**
- **Hashing**: bcrypt with salt
- **Validation**: Minimum length requirement
- **Verification**: Secure password checking

### **Token Security**
- **Short-lived Access**: 1 hour expiration
- **Long-lived Refresh**: 30 days expiration
- **Identity Storage**: User ID in token payload
- **Automatic Expiration**: Tokens expire automatically

### **Input Validation**
- **Required Fields**: Username, email, password validation
- **Duplicate Prevention**: Username/email uniqueness
- **Password Strength**: Minimum length enforcement
- **Error Handling**: Clear error messages

## Usage Examples

### **User Registration**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### **User Login**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepassword123"
  }'
```

### **Access Protected Endpoint**
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:5000/api/v1/auth/profile
```

### **Refresh Token**
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

This authentication system provides secure, production-ready user management with JWT tokens, password hashing, and comprehensive profile management.

