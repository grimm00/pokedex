# Backend Testing Framework

This directory contains comprehensive tests for the Pokedex backend API.

## Test Structure

```
tests/
├── conftest.py              # Pytest configuration and fixtures
├── api/                     # API endpoint tests
│   ├── test_pokemon_api.py  # Pokemon API tests
│   ├── test_auth_api.py     # Authentication API tests
│   └── test_favorites_api.py # Favorites API tests
├── integration/             # Integration tests
│   └── test_favorites_sorting.py # Favorites sorting integration
├── performance/             # Performance tests
│   └── test_api_performance.py # API performance tests
└── README.md               # This file
```

## Running Tests

### Install Dependencies
```bash
cd backend
pip install -r requirements-test.txt
```

### Run All Tests
```bash
pytest
```

### Run Specific Test Categories
```bash
# API tests only
pytest tests/api/

# Integration tests only
pytest tests/integration/

# Performance tests only
pytest tests/performance/

# Skip slow tests
pytest -m "not slow"
```

### Run with Coverage
```bash
pytest --cov=backend --cov-report=html
```

### Run in Parallel
```bash
pytest -n auto  # Uses pytest-xdist
```

## Test Categories

### API Tests (`tests/api/`)
- **Pokemon API**: CRUD operations, pagination, search, filtering, sorting
- **Auth API**: Registration, login, logout, token refresh, profile
- **Favorites API**: Add/remove favorites, user isolation, validation

### Integration Tests (`tests/integration/`)
- **Favorites Sorting**: End-to-end favorites sorting scenarios
- **Multi-user Scenarios**: User data isolation and concurrent access
- **Complex Queries**: Combined search, filter, and sort operations

### Performance Tests (`tests/performance/`)
- **Response Times**: API endpoint performance benchmarks
- **Concurrent Requests**: Load testing with multiple simultaneous requests
- **Scalability**: Large dataset and pagination performance

## Test Data

Tests use a separate test database and are isolated from development data:
- Test database is created in memory or temporary file
- Test data is seeded automatically via fixtures
- Each test runs in isolation with clean state

## Fixtures

### `app`
- Creates test Flask application with test database
- Seeds test data (Pokemon, Users)
- Provides clean environment for each test

### `client`
- Flask test client for making HTTP requests
- Automatically configured with test app

### `auth_headers`
- Creates authenticated user and returns JWT headers
- Reusable across tests that need authentication

### `test_user_id`
- Returns the ID of the test user
- Useful for user-specific operations

## Writing New Tests

### API Test Example
```python
def test_get_pokemon_list(self, client):
    """Test getting Pokemon list"""
    response = client.get('/api/v1/pokemon')
    assert response.status_code == 200
    assert 'pokemon' in response.json
```

### Integration Test Example
```python
def test_favorites_sorting_with_search(self, client, auth_headers, test_user_id):
    """Test favorites sorting combined with search"""
    # Setup
    client.post(f'/api/v1/users/{test_user_id}/favorites',
               headers=auth_headers,
               json={'pokemon_id': 25})
    
    # Test
    response = client.get('/api/v1/pokemon?sort=favorites&search=pika',
                        headers=auth_headers)
    assert response.status_code == 200
    assert response.json['pokemon'][0]['pokemon_id'] == 25
```

### Performance Test Example
```python
def test_response_time(self, client):
    """Test API response time"""
    start_time = time.time()
    response = client.get('/api/v1/pokemon')
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 1.0
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (most tests < 1 second)
- Isolated and deterministic
- Comprehensive coverage of critical paths
- Performance benchmarks for regression detection

## Debugging Tests

### Verbose Output
```bash
pytest -v -s
```

### Stop on First Failure
```bash
pytest -x
```

### Run Specific Test
```bash
pytest tests/api/test_pokemon_api.py::TestPokemonAPI::test_get_pokemon_list
```

### Debug with PDB
```bash
pytest --pdb
```
