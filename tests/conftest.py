"""
Pytest configuration and fixtures for the Pokedex application
"""
import os
import sys
import tempfile
import pytest
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import the Flask app and models
try:
    # Try importing from backend module (local development)
    from backend.app import app as flask_app
    from backend.database import db
    from backend.models import User, Pokemon, UserPokemon
except ImportError:
    # Try importing directly (Docker environment)
    from app import app as flask_app
    from database import db
    from models import User, Pokemon, UserPokemon


@pytest.fixture(scope='session')
def app():
    """Create and configure a test Flask application"""
    # Create a temporary file to serve as the database
    db_fd, db_path = tempfile.mkstemp()
    
    # Configure the app for testing
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'JWT_SECRET_KEY': 'test-secret-key',
        'JWT_ACCESS_TOKEN_EXPIRES': False,  # No expiration for tests
        'RATELIMIT_STORAGE_URL': 'memory://',
        'REDIS_URL': 'redis://localhost:6379/1'  # Use different Redis DB for tests
    })
    
    with flask_app.app_context():
        # Create all database tables
        db.create_all()
        
        # Seed test data
        _seed_test_data()
        
        yield flask_app
        
        # Clean up
        db.session.remove()
        db.drop_all()
    
    # Close the temporary file
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture(scope='session')
def client(app):
    """Create a test client for the Flask application"""
    return app.test_client()


@pytest.fixture(scope='function')
def db_session(app):
    """Provide a clean database session for each test"""
    with app.app_context():
        # Ensure we're using the same session for all operations
        db.session.begin()
        yield db.session
        # Rollback after each test to maintain isolation
        db.session.rollback()


@pytest.fixture(scope='function')
def ensure_db_commit(app):
    """Ensure database changes are committed and visible across API calls"""
    def commit_changes():
        with app.app_context():
            db.session.commit()
    return commit_changes


@pytest.fixture(scope='session')
def runner(app):
    """Create a test CLI runner for the Flask application"""
    return app.test_cli_runner()


@pytest.fixture
def auth_headers(client):
    """Create authentication headers for testing"""
    # Register a test user
    response = client.post('/api/v1/auth/register', json={
        'username': 'testuser',
        'password': 'password123',
        'email': 'test@example.com'
    })
    
    if response.status_code == 201:
        token = response.json['access_token']
        return {'Authorization': f'Bearer {token}'}
    else:
        # If registration fails, try to login
        response = client.post('/api/v1/auth/login', json={
            'username': 'testuser',
            'password': 'password123'
        })
        token = response.json['access_token']
        return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def test_user_id(client, auth_headers):
    """Get the test user ID"""
    response = client.get('/api/v1/auth/profile', headers=auth_headers)
    return response.json['id']


def _seed_test_data():
    """Seed the test database with sample data"""
    # Check if Pokemon already exist to avoid duplicates
    existing_pokemon_ids = {p.pokemon_id for p in Pokemon.query.all()}
    
    # Create test Pokemon only if they don't exist
    test_pokemon_data = [
        {
            'pokemon_id': 1,
            'name': 'bulbasaur',
            'height': 7,
            'weight': 69,
            'base_experience': 64,
            'types': ['grass', 'poison'],
            'abilities': ['overgrow', 'chlorophyll'],
            'stats': {
                'hp': 45,
                'attack': 49,
                'defense': 49,
                'special-attack': 65,
                'special-defense': 65,
                'speed': 45
            },
            'sprites': {
                'front_default': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
            }
        },
        {
            'pokemon_id': 25,
            'name': 'pikachu',
            'height': 4,
            'weight': 60,
            'base_experience': 112,
            'types': ['electric'],
            'abilities': ['static', 'lightning-rod'],
            'stats': {
                'hp': 35,
                'attack': 55,
                'defense': 40,
                'special-attack': 50,
                'special-defense': 50,
                'speed': 90
            },
            'sprites': {
                'front_default': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
            }
        },
        {
            'pokemon_id': 4,
            'name': 'charmander',
            'height': 6,
            'weight': 85,
            'base_experience': 62,
            'types': ['fire'],
            'abilities': ['blaze', 'solar-power'],
            'stats': {
                'hp': 39,
                'attack': 52,
                'defense': 43,
                'special-attack': 60,
                'special-defense': 50,
                'speed': 65
            },
            'sprites': {
                'front_default': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png'
            }
        }
    ]
    
    for pokemon_data in test_pokemon_data:
        if pokemon_data['pokemon_id'] not in existing_pokemon_ids:
            pokemon = Pokemon(**pokemon_data)
            db.session.add(pokemon)
    
    db.session.commit()


@pytest.fixture(autouse=True)
def clean_database():
    """Clean the database before each test"""
    # This runs before each test
    # Clean up any test data that might have been created from previous tests
    with flask_app.app_context():
        UserPokemon.query.delete()
        User.query.delete()
        db.session.commit()
    yield
    # This runs after each test
    # Clean up any test data that might have been created
    with flask_app.app_context():
        UserPokemon.query.delete()
        User.query.delete()
        db.session.commit()
