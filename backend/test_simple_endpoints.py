import pytest
import time

# Add a small delay to avoid import conflicts
time.sleep(0.1)

from app import app

@pytest.fixture
def client():
    """Create test client"""
    return app.test_client()

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

def test_pokemon_list_with_params(client):
    """Test Pokemon list endpoint with parameters"""
    response = client.get('/api/v1/pokemon?per_page=5&page=1')
    assert response.status_code == 200
    data = response.json
    assert 'pokemon' in data
    assert 'pagination' in data
    assert len(data['pokemon']) <= 5

