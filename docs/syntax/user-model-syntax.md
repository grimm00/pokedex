# User Model Syntax Guide

## Overview
This document explains the `backend/models/user.py` file, including the User and UserPokemon models, password security, and relationship management.

## File Structure
```python
# Imports
from backend.app import db
from datetime import datetime, timezone
import bcrypt

# User Model
class User(db.Model):
    # Table definition
    # Password methods
    # Serialization method
    # String representation

# UserPokemon Model (Junction Table)
class UserPokemon(db.Model):
    # Table definition
    # Serialization method
    # String representation
```

## Imports Section (Lines 1-3)
```python
from backend.app import db
from datetime import datetime, timezone
import bcrypt
```

**What each import does:**
- `db` - SQLAlchemy database instance from our Flask app
- `datetime, timezone` - For creating timezone-aware timestamps
- `bcrypt` - For secure password hashing and verification

## User Model (Lines 5-45)

### **Table Definition (Lines 6-15)**
```python
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
```

**Field Explanations:**
- `id` - Primary key, auto-incrementing integer
- `username` - Unique username (max 80 characters)
- `email` - Unique email address (max 120 characters)
- `password_hash` - Hashed password (128 characters for bcrypt)
- `is_admin` - Boolean flag for admin privileges (defaults to False)
- `created_at` - Timestamp when user was created
- `updated_at` - Timestamp when user was last modified

**Key Concepts:**
- `unique=True` - Ensures no duplicate usernames or emails
- `nullable=False` - Field cannot be empty
- `default=False` - Admin flag defaults to regular user
- `lambda: datetime.now(timezone.utc)` - Creates timezone-aware timestamp

### **Relationship Definition (Lines 17-18)**
```python
# Relationship to user's favorite pokemon
favorite_pokemon = db.relationship('UserPokemon', backref='user', lazy=True)
```

**What this does:**
- **One-to-Many**: One user can have many favorite Pokemon
- **backref='user'**: Creates `user` attribute on UserPokemon objects
- **lazy=True**: Loads favorites only when accessed (performance optimization)

### **Password Security Methods (Lines 20-26)**
```python
def set_password(self, password):
    """Hash and set password"""
    salt = bcrypt.gensalt()
    self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(self, password):
    """Check if provided password matches hash"""
    return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
```

**set_password() Method:**
- **Purpose**: Securely hash and store password
- **Process**: Generate salt → Hash password with salt → Store hash
- **Security**: Salt prevents rainbow table attacks
- **Usage**: `user.set_password('mypassword')`

**check_password() Method:**
- **Purpose**: Verify password without storing plain text
- **Process**: Hash provided password → Compare with stored hash
- **Security**: Never stores or compares plain text passwords
- **Usage**: `user.check_password('mypassword')`

### **Serialization Method (Lines 28-42)**
```python
def to_dict(self, include_sensitive=False):
    data = {
        'id': self.id,
        'username': self.username,
        'email': self.email,
        'is_admin': self.is_admin,
        'created_at': self.created_at.isoformat() if self.created_at else None,
        'updated_at': self.updated_at.isoformat() if self.updated_at else None
    }
    
    # Only include sensitive data if explicitly requested
    if include_sensitive:
        data['password_hash'] = self.password_hash
        
    return data
```

**What this does:**
- **Default Behavior**: Excludes sensitive data (password_hash)
- **Security**: Prevents accidental password exposure in API responses
- **Flexibility**: Can include sensitive data if needed (admin functions)
- **ISO Format**: Converts datetime to string format for JSON

**Usage Examples:**
```python
# Safe for API responses
user_data = user.to_dict()  # No password_hash

# For admin functions
user_data = user.to_dict(include_sensitive=True)  # Includes password_hash
```

### **String Representation (Lines 44-45)**
```python
def __repr__(self):
    return f'<User {self.username}>'
```

**Purpose**: Provides readable string representation for debugging
**Example**: `<User john_doe>` instead of `<User object at 0x...>`

## UserPokemon Model (Lines 47-65)

### **Table Definition (Lines 48-52)**
```python
class UserPokemon(db.Model):
    __tablename__ = 'user_pokemon'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pokemon_id = db.Column(db.Integer, db.ForeignKey('pokemon.pokemon_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
```

**Field Explanations:**
- `id` - Primary key for the relationship
- `user_id` - Foreign key to users table
- `pokemon_id` - Foreign key to pokemon table (using pokemon_id, not id)
- `created_at` - When the favorite was added

**Key Concepts:**
- **Junction Table**: Links users to their favorite Pokemon
- **Foreign Keys**: Maintains referential integrity
- **Many-to-Many**: Users can favorite many Pokemon, Pokemon can be favorited by many users

### **Serialization Method (Lines 54-60)**
```python
def to_dict(self):
    return {
        'id': self.id,
        'user_id': self.user_id,
        'pokemon_id': self.pokemon_id,
        'created_at': self.created_at.isoformat() if self.created_at else None
    }
```

**Purpose**: Converts relationship object to dictionary for API responses
**Usage**: `favorite.to_dict()` returns JSON-serializable data

### **String Representation (Lines 62-63)**
```python
def __repr__(self):
    return f'<UserPokemon User:{self.user_id} Pokemon:{self.pokemon_id}>'
```

**Purpose**: Provides readable string representation for debugging
**Example**: `<UserPokemon User:1 Pokemon:25>` (User 1 favorited Pikachu)

## Database Relationships

### **User → UserPokemon (One-to-Many)**
```python
# Get user's favorites
user = User.query.get(1)
favorites = user.favorite_pokemon  # List of UserPokemon objects

# Add favorite
favorite = UserPokemon(user_id=1, pokemon_id=25)
db.session.add(favorite)
db.session.commit()
```

### **UserPokemon → User (Many-to-One)**
```python
# Get user from favorite
favorite = UserPokemon.query.get(1)
user = favorite.user  # User object
```

## Security Features

### **Password Security**
- **Hashing**: Passwords are hashed with bcrypt and salt
- **Verification**: Secure password checking without plain text storage
- **Exclusion**: Passwords never included in API responses by default

### **Data Protection**
- **Sensitive Data**: Password hashes excluded from serialization
- **Admin Control**: Sensitive data only available to admins
- **Input Validation**: Username and email uniqueness enforced

### **Access Control**
- **Admin Flag**: `is_admin` field controls access levels
- **Ownership**: Users can only access their own data
- **Relationships**: Favorites are tied to specific users

## Usage Examples

### **Creating a User**
```python
# Create new user
user = User(username='john_doe', email='john@example.com')
user.set_password('securepassword123')
db.session.add(user)
db.session.commit()
```

### **Authenticating a User**
```python
# Find user and check password
user = User.query.filter_by(username='john_doe').first()
if user and user.check_password('securepassword123'):
    print("Login successful!")
else:
    print("Invalid credentials")
```

### **Managing Favorites**
```python
# Add Pokemon to favorites
favorite = UserPokemon(user_id=user.id, pokemon_id=25)
db.session.add(favorite)
db.session.commit()

# Get user's favorites
favorites = user.favorite_pokemon
for fav in favorites:
    print(f"User {user.username} likes Pokemon {fav.pokemon_id}")
```

### **API Serialization**
```python
# Safe for API responses
user_data = user.to_dict()
# Returns: {'id': 1, 'username': 'john_doe', 'email': 'john@example.com', ...}

# For admin functions
admin_data = user.to_dict(include_sensitive=True)
# Returns: {'id': 1, 'username': 'john_doe', 'password_hash': '...', ...}
```

## Key Learning Points

### **Database Design**
- **Primary Keys**: Unique identifiers for each record
- **Foreign Keys**: Links between related tables
- **Junction Tables**: Many-to-many relationships
- **Timestamps**: Track record creation and modification

### **Security Patterns**
- **Password Hashing**: Never store plain text passwords
- **Salt Usage**: Prevent rainbow table attacks
- **Data Exclusion**: Hide sensitive data from API responses
- **Access Control**: Role-based permissions

### **SQLAlchemy Concepts**
- **Models**: Python classes representing database tables
- **Relationships**: Links between related models
- **Serialization**: Converting objects to JSON-serializable data
- **Lazy Loading**: Performance optimization for relationships

This User model provides a secure, well-structured foundation for user management in our Pokedex API.
