#!/usr/bin/env python3
"""
Quick test script for Flask-RESTful API with SQLite
This allows us to test our implementation without PostgreSQL setup
"""

import os
import sys
import tempfile
from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_restx import Api as RestXApi
from flask_jwt_extended import JWTManager
from datetime import timedelta

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Create a temporary SQLite database
db_fd, db_path = tempfile.mkstemp()

# Initialize Flask app with test configuration
app = Flask(__name__)

# Test configuration
app.config['SECRET_KEY'] = 'test-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['TESTING'] = True

# JWT Configuration
app.config['JWT_SECRET_KEY'] = 'test-jwt-secret'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)
jwt = JWTManager(app)

# Initialize Flask-RESTful API with versioning
api = Api(app, prefix='/api/v1')

# Initialize Flask-RESTX for documentation
restx_api = RestXApi(
    app,
    version='1.0',
    title='Pokedex API v1 (Test)',
    description='A comprehensive Pokemon API for learning full-stack development',
    doc='/docs/',
    prefix='/api/v1'
)

# We'll define the models directly here to avoid circular imports
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, UniqueConstraint
from datetime import datetime, timezone
import bcrypt

# Use Flask-SQLAlchemy's model base
class Pokemon(db.Model):
    __tablename__ = 'pokemon'

    id = Column(Integer, primary_key=True)
    pokemon_id = Column(Integer, unique=True, nullable=False)  # PokeAPI ID
    name = Column(String(100), nullable=False)
    height = Column(Integer)  # in decimeters
    weight = Column(Integer)  # in hectograms
    base_experience = Column(Integer)
    types = Column(JSON)  # Store as JSON array
    abilities = Column(JSON)  # Store as JSON array
    stats = Column(JSON)  # Store as JSON object
    sprites = Column(JSON)  # Store as JSON object
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'pokemon_id': self.pokemon_id,
            'name': self.name,
            'height': self.height,
            'weight': self.weight,
            'base_experience': self.base_experience,
            'types': self.types,
            'abilities': self.abilities,
            'stats': self.stats,
            'sprites': self.sprites,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Pokemon: {self.name} (ID: {self.pokemon_id})>'

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        """Hash and set password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

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

    def __repr__(self):
        return f'<User {self.username}>'

class UserPokemon(db.Model):
    __tablename__ = 'user_pokemon'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    pokemon_id = Column(Integer, ForeignKey('pokemon.pokemon_id'), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Ensure a user can only favorite a specific pokemon once
    __table_args__ = (UniqueConstraint('user_id', 'pokemon_id', name='_user_pokemon_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'pokemon_id': self.pokemon_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<UserPokemon: User {self.user_id} - Pokemon {self.pokemon_id}>'

# We'll bind the models in the create_tables function

# Import routes (we'll create simplified versions)
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from flask import request, jsonify

# Define simplified test routes
class PokemonList(Resource):
    def get(self):
        """Get all Pokemon"""
        pokemon_list = Pokemon.query.all()
        return {
            'pokemon': [pokemon.to_dict() for pokemon in pokemon_list],
            'count': len(pokemon_list)
        }

class PokemonDetail(Resource):
    def get(self, pokemon_id):
        """Get specific Pokemon by ID"""
        pokemon = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
        if not pokemon:
            return {'error': 'Pokemon not found'}, 404
        return pokemon.to_dict()

class AuthRegister(Resource):
    def post(self):
        """Register a new user"""
        data = request.get_json()
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return {'error': 'Missing required fields'}, 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return {'error': 'Username already exists'}, 400
        if User.query.filter_by(email=data['email']).first():
            return {'error': 'Email already exists'}, 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return {'message': 'User created successfully', 'user': user.to_dict()}, 201

class AuthLogin(Resource):
    def post(self):
        """Login user and return JWT token"""
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return {'error': 'Missing username or password'}, 400
        
        user = User.query.filter_by(username=data['username']).first()
        if not user or not user.check_password(data['password']):
            return {'error': 'Invalid credentials'}, 401
        
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }

class AuthProfile(Resource):
    @jwt_required()
    def get(self):
        """Get current user profile"""
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return user.to_dict()

class UserList(Resource):
    @jwt_required()
    def get(self):
        """Get all users (admin only)"""
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.is_admin:
            return {'error': 'Admin access required'}, 403
        
        users = User.query.all()
        return {
            'users': [user.to_dict() for user in users],
            'count': len(users)
        }

# Register API routes
# Public routes (no authentication required)
api.add_resource(PokemonList, '/pokemon')
api.add_resource(PokemonDetail, '/pokemon/<int:pokemon_id>')
api.add_resource(AuthRegister, '/auth/register')
api.add_resource(AuthLogin, '/auth/login')

# Protected routes (authentication required)
api.add_resource(AuthProfile, '/auth/profile')
api.add_resource(UserList, '/users')

# Health check endpoint
@app.route('/')
def health_check():
    return {
        'status': 'healthy',
        'message': 'Pokedex API is running (TEST MODE)',
        'version': '1.0.0',
        'api_version': 'v1',
        'docs': '/docs/',
        'database': 'SQLite (Test)',
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
        'database': 'SQLite (Test)',
        'endpoints': {
            'v1': {
                'pokemon': '/api/v1/pokemon',
                'users': '/api/v1/users',
                'docs': '/docs/'
            }
        }
    }

def create_tables():
    """Create database tables for testing"""
    with app.app_context():
        # Create all tables using Flask-SQLAlchemy
        db.create_all()
        print("✅ Database tables created successfully")

def cleanup():
    """Clean up temporary database file"""
    os.close(db_fd)
    os.unlink(db_path)
    print("🧹 Temporary database cleaned up")

if __name__ == '__main__':
    try:
        print("🚀 Starting Pokedex API Test Server...")
        print(f"📁 Using temporary SQLite database: {db_path}")
        
        # Create tables
        create_tables()
        
        print("\n🌐 Server starting on http://localhost:5001")
        print("📚 API Documentation: http://localhost:5001/docs/")
        print("🔍 Health Check: http://localhost:5001/")
        print("📊 API Version: http://localhost:5001/api/version")
        print("\n⏹️  Press Ctrl+C to stop the server")
        
        # Start the server
        app.run(debug=True, host='0.0.0.0', port=5001)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cleanup()
