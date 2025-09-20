import pytest
import tempfile
import os
import time

# Add a small delay to avoid import conflicts
time.sleep(0.1)

from app import app
from database import db

@pytest.fixture
def client():
    """Create test client with test database"""
    # Create temporary database
    db_fd, db_path = tempfile.mkstemp()
    
    # Configure app for testing
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'JWT_SECRET_KEY': 'test-secret-key',
        'REDIS_URL': 'redis://localhost:6379/1'
    })
    
    # Initialize database with the test app
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()
    
    os.close(db_fd)
    os.unlink(db_path)

def test_app_creation():
    """Test that app is created"""
    assert app is not None

def test_client_creation(client):
    """Test that test client is created"""
    assert client is not None

def test_pokemon_list(client):
    """Test Pokemon list endpoint"""
    response = client.get('/api/v1/pokemon')
    assert response.status_code == 200
    data = response.json
    assert 'pokemon' in data
    assert len(data['pokemon']) > 0
