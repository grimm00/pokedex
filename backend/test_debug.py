import pytest
import time

# Add a small delay to avoid import conflicts
time.sleep(0.1)

from app import app

@pytest.fixture
def client():
    """Create test client"""
    return app.test_client()

def test_database_config():
    """Test what database the app is using"""
    print(f"App database URI: {app.config.get('SQLALCHEMY_DATABASE_URI')}")
    print(f"App testing mode: {app.config.get('TESTING')}")

def test_pokemon_count(client):
    """Test Pokemon count in database"""
    from database import db
    from models.pokemon import Pokemon
    
    with app.app_context():
        count = Pokemon.query.count()
        print(f"Pokemon count in database: {count}")
        assert count > 0, f"Expected Pokemon count > 0, got {count}"

def test_pokemon_list_debug(client):
    """Test Pokemon list endpoint with debug info"""
    response = client.get('/api/v1/pokemon')
    print(f"Response status: {response.status_code}")
    print(f"Response data: {response.json}")
    assert response.status_code == 200

