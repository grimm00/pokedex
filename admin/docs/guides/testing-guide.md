# Comprehensive Testing Guide

## Overview
This guide covers all aspects of testing the Pokedex API, including unit tests, integration tests, security tests, and performance tests. It reflects the current state after implementing Option B (Complete Setup).

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [Security Testing](#security-testing)
5. [Performance Testing](#performance-testing)
6. [API Testing](#api-testing)
7. [Database Testing](#database-testing)
8. [Test Automation](#test-automation)

## Testing Strategy

### Testing Pyramid
```
    /\
   /  \
  / E2E \     <- End-to-End Tests (Few)
 /______\
/        \
/Integration\ <- Integration Tests (Some)
/____________\
/              \
/   Unit Tests   \ <- Unit Tests (Many)
/________________\
```

### Test Categories
1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test component interactions
3. **API Tests**: Test HTTP endpoints
4. **Security Tests**: Test security features
5. **Performance Tests**: Test response times and throughput
6. **Database Tests**: Test data persistence and queries

## Unit Testing

### Test Setup
```python
import unittest
from unittest.mock import patch, MagicMock
from backend.app import app
from backend.database import db
from backend.models import User, Pokemon, AuditLog

class TestUserModel(unittest.TestCase):
    def setUp(self):
        """Set up test database"""
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        """Clean up after tests"""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_user_creation(self):
        """Test user creation with valid data"""
        user = User(
            username='testuser',
            email='test@example.com'
        )
        user.set_password('password123')
        
        db.session.add(user)
        db.session.commit()
        
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('password123'))
        self.assertFalse(user.check_password('wrongpassword'))
    
    def test_user_password_hashing(self):
        """Test password hashing and verification"""
        user = User(username='test', email='test@example.com')
        user.set_password('password123')
        
        # Password should be hashed
        self.assertNotEqual(user.password_hash, 'password123')
        self.assertTrue(user.check_password('password123'))
        self.assertFalse(user.check_password('wrongpassword'))
    
    def test_user_favorites(self):
        """Test user favorites functionality"""
        user = User(username='test', email='test@example.com')
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
        
        pokemon = Pokemon(
            pokemon_id=25,
            name='Pikachu',
            types=['Electric'],
            abilities=['Static'],
            stats={'hp': 35, 'attack': 55},
            sprites={'front_default': 'pikachu.png'}
        )
        db.session.add(pokemon)
        db.session.commit()
        
        # Test adding favorite
        self.assertTrue(user.add_favorite(pokemon))
        self.assertTrue(user.has_favorite(pokemon))
        self.assertEqual(len(user.favorites), 1)
        
        # Test removing favorite
        self.assertTrue(user.remove_favorite(pokemon))
        self.assertFalse(user.has_favorite(pokemon))
        self.assertEqual(len(user.favorites), 0)
```

### Pokemon Model Tests
```python
class TestPokemonModel(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_pokemon_creation(self):
        """Test Pokemon creation with JSON data"""
        pokemon = Pokemon(
            pokemon_id=25,
            name='Pikachu',
            types=['Electric'],
            abilities=['Static', 'Lightning Rod'],
            stats={'hp': 35, 'attack': 55, 'defense': 40},
            sprites={'front_default': 'pikachu.png', 'back_default': 'pikachu_back.png'}
        )
        
        db.session.add(pokemon)
        db.session.commit()
        
        self.assertEqual(pokemon.pokemon_id, 25)
        self.assertEqual(pokemon.name, 'Pikachu')
        self.assertEqual(pokemon.types, ['Electric'])
        self.assertEqual(len(pokemon.abilities), 2)
        self.assertIn('Static', pokemon.abilities)
    
    def test_pokemon_serialization(self):
        """Test Pokemon to_dict method"""
        pokemon = Pokemon(
            pokemon_id=25,
            name='Pikachu',
            types=['Electric'],
            abilities=['Static'],
            stats={'hp': 35},
            sprites={'front_default': 'pikachu.png'}
        )
        
        pokemon_dict = pokemon.to_dict()
        
        self.assertEqual(pokemon_dict['pokemon_id'], 25)
        self.assertEqual(pokemon_dict['name'], 'Pikachu')
        self.assertEqual(pokemon_dict['types'], ['Electric'])
        self.assertIsInstance(pokemon_dict['stats'], dict)
```

## Integration Testing

### API Integration Tests
```python
class TestAPIIntegration(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Create test user
        self.user = User(username='testuser', email='test@example.com')
        self.user.set_password('password123')
        db.session.add(self.user)
        db.session.commit()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        response = self.app.post('/api/v1/auth/register', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'password123'
        })
        
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('user', data)
        self.assertEqual(data['user']['username'], 'newuser')
    
    def test_user_login(self):
        """Test user login endpoint"""
        response = self.app.post('/api/v1/auth/login', json={
            'username': 'testuser',
            'password': 'password123'
        })
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('access_token', data)
        self.assertIn('refresh_token', data)
    
    def test_protected_endpoint(self):
        """Test protected endpoint with JWT token"""
        # Login to get token
        login_response = self.app.post('/api/v1/auth/login', json={
            'username': 'testuser',
            'password': 'password123'
        })
        token = login_response.get_json()['access_token']
        
        # Access protected endpoint
        response = self.app.get('/api/v1/auth/profile', 
                              headers={'Authorization': f'Bearer {token}'})
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['username'], 'testuser')
    
    def test_pokemon_list(self):
        """Test Pokemon list endpoint"""
        # Create test Pokemon
        pokemon = Pokemon(
            pokemon_id=25,
            name='Pikachu',
            types=['Electric'],
            abilities=['Static'],
            stats={'hp': 35},
            sprites={'front_default': 'pikachu.png'}
        )
        db.session.add(pokemon)
        db.session.commit()
        
        response = self.app.get('/api/v1/pokemon')
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('pokemon', data)
        self.assertEqual(len(data['pokemon']), 1)
        self.assertEqual(data['pokemon'][0]['name'], 'Pikachu')
```

## Security Testing

### Rate Limiting Tests
```python
class TestRateLimiting(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_auth_rate_limiting(self):
        """Test rate limiting on authentication endpoints"""
        # Make multiple requests to login endpoint
        for i in range(6):  # Exceed 5 per minute limit
            response = self.app.post('/api/v1/auth/login', json={
                'username': 'testuser',
                'password': 'password123'
            })
            
            if i < 5:
                # First 5 requests should work (or fail with auth error)
                self.assertIn(response.status_code, [200, 401])
            else:
                # 6th request should be rate limited
                self.assertEqual(response.status_code, 429)
                data = response.get_json()
                self.assertEqual(data['error']['code'], 'RATE_LIMIT_EXCEEDED')
    
    def test_api_rate_limiting(self):
        """Test rate limiting on general API endpoints"""
        # Create test Pokemon
        pokemon = Pokemon(
            pokemon_id=25,
            name='Pikachu',
            types=['Electric'],
            abilities=['Static'],
            stats={'hp': 35},
            sprites={'front_default': 'pikachu.png'}
        )
        db.session.add(pokemon)
        db.session.commit()
        
        # Make many requests to Pokemon list
        for i in range(101):  # Exceed 100 per minute limit
            response = self.app.get('/api/v1/pokemon')
            
            if i < 100:
                self.assertEqual(response.status_code, 200)
            else:
                self.assertEqual(response.status_code, 429)
```

### Security Headers Tests
```python
class TestSecurityHeaders(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()
    
    def test_security_headers(self):
        """Test that security headers are present"""
        response = self.app.get('/')
        
        # Check essential security headers
        self.assertEqual(response.headers['X-Content-Type-Options'], 'nosniff')
        self.assertEqual(response.headers['X-Frame-Options'], 'DENY')
        self.assertEqual(response.headers['X-XSS-Protection'], '1; mode=block')
        self.assertIn('Content-Security-Policy', response.headers)
        self.assertIn('Referrer-Policy', response.headers)
    
    def test_cors_headers(self):
        """Test CORS configuration"""
        response = self.app.get('/api/v1/pokemon')
        
        # Check CORS headers
        self.assertIn('Access-Control-Allow-Origin', response.headers)
        self.assertIn('Access-Control-Allow-Methods', response.headers)
```

### Input Validation Tests
```python
class TestInputValidation(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_invalid_username(self):
        """Test registration with invalid username"""
        response = self.app.post('/api/v1/auth/register', json={
            'username': '<script>alert("xss")</script>',
            'email': 'test@example.com',
            'password': 'password123'
        })
        
        self.assertEqual(response.status_code, 422)
        data = response.get_json()
        self.assertEqual(data['error']['code'], 'VALIDATION_ERROR')
    
    def test_invalid_email(self):
        """Test registration with invalid email"""
        response = self.app.post('/api/v1/auth/register', json={
            'username': 'testuser',
            'email': 'invalid-email',
            'password': 'password123'
        })
        
        self.assertEqual(response.status_code, 422)
        data = response.get_json()
        self.assertEqual(data['error']['code'], 'VALIDATION_ERROR')
    
    def test_weak_password(self):
        """Test registration with weak password"""
        response = self.app.post('/api/v1/auth/register', json={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': '123'  # Too short
        })
        
        self.assertEqual(response.status_code, 422)
        data = response.get_json()
        self.assertEqual(data['error']['code'], 'VALIDATION_ERROR')
```

## Performance Testing

### Response Time Tests
```python
import time

class TestPerformance(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Create test data
        self.create_test_pokemon()
    
    def create_test_pokemon(self):
        """Create test Pokemon data"""
        for i in range(100):
            pokemon = Pokemon(
                pokemon_id=i + 1,
                name=f'Pokemon{i}',
                types=['Normal'],
                abilities=['Ability1'],
                stats={'hp': 50},
                sprites={'front_default': f'pokemon{i}.png'}
            )
            db.session.add(pokemon)
        db.session.commit()
    
    def test_pokemon_list_performance(self):
        """Test Pokemon list response time"""
        start_time = time.time()
        response = self.app.get('/api/v1/pokemon')
        end_time = time.time()
        
        self.assertEqual(response.status_code, 200)
        response_time = end_time - start_time
        
        # Should respond within 100ms
        self.assertLess(response_time, 0.1)
        print(f"Pokemon list response time: {response_time:.4f}s")
    
    def test_pokemon_search_performance(self):
        """Test Pokemon search response time"""
        start_time = time.time()
        response = self.app.get('/api/v1/pokemon?search=Pokemon1')
        end_time = time.time()
        
        self.assertEqual(response.status_code, 200)
        response_time = end_time - start_time
        
        # Should respond within 200ms
        self.assertLess(response_time, 0.2)
        print(f"Pokemon search response time: {response_time:.4f}s")
```

## API Testing

### Complete API Test Suite
```python
class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
        
        # Create test user and get token
        self.user = User(username='testuser', email='test@example.com')
        self.user.set_password('password123')
        db.session.add(self.user)
        db.session.commit()
        
        # Login to get token
        response = self.app.post('/api/v1/auth/login', json={
            'username': 'testuser',
            'password': 'password123'
        })
        self.token = response.get_json()['access_token']
        self.headers = {'Authorization': f'Bearer {self.token}'}
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'healthy')
    
    def test_api_version(self):
        """Test API version endpoint"""
        response = self.app.get('/api/version')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['version'], '1.0.0')
    
    def test_pokemon_crud(self):
        """Test Pokemon CRUD operations"""
        # Create Pokemon
        pokemon_data = {
            'pokemon_id': 25,
            'name': 'Pikachu',
            'types': ['Electric'],
            'abilities': ['Static'],
            'stats': {'hp': 35, 'attack': 55},
            'sprites': {'front_default': 'pikachu.png'}
        }
        
        response = self.app.post('/api/v1/pokemon', 
                               json=pokemon_data, 
                               headers=self.headers)
        self.assertEqual(response.status_code, 201)
        
        pokemon_id = response.get_json()['id']
        
        # Read Pokemon
        response = self.app.get(f'/api/v1/pokemon/{pokemon_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['name'], 'Pikachu')
        
        # Update Pokemon
        update_data = {'name': 'Pikachu Updated'}
        response = self.app.put(f'/api/v1/pokemon/{pokemon_id}', 
                              json=update_data, 
                              headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        # Delete Pokemon
        response = self.app.delete(f'/api/v1/pokemon/{pokemon_id}', 
                                 headers=self.headers)
        self.assertEqual(response.status_code, 200)
        
        # Verify deletion
        response = self.app.get(f'/api/v1/pokemon/{pokemon_id}')
        self.assertEqual(response.status_code, 404)
```

## Database Testing

### Database Migration Tests
```python
class TestDatabaseMigrations(unittest.TestCase):
    def test_migration_upgrade(self):
        """Test database migration upgrade"""
        from flask_migrate import upgrade
        
        # This should not raise an exception
        upgrade()
        
        # Verify tables exist
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        expected_tables = ['pokemon', 'users', 'user_pokemon', 'audit_logs']
        for table in expected_tables:
            self.assertIn(table, tables)
    
    def test_migration_downgrade(self):
        """Test database migration downgrade"""
        from flask_migrate import downgrade
        
        # Upgrade first
        from flask_migrate import upgrade
        upgrade()
        
        # Then downgrade
        downgrade()
        
        # Verify tables are removed
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        # Should only have alembic_version table
        self.assertEqual(len(tables), 1)
        self.assertIn('alembic_version', tables)
```

## Test Automation

### Running Tests
```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/test_models.py

# Run with coverage
python -m pytest --cov=backend

# Run with verbose output
python -m pytest -v

# Run specific test
python -m pytest tests/test_models.py::TestUserModel::test_user_creation
```

### Test Configuration
```python
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

### Continuous Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.11
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov
    - name: Run tests
      run: pytest --cov=backend
```

## Test Data Management

### Test Fixtures
```python
import pytest

@pytest.fixture
def test_user():
    """Create a test user"""
    user = User(username='testuser', email='test@example.com')
    user.set_password('password123')
    return user

@pytest.fixture
def test_pokemon():
    """Create a test Pokemon"""
    return Pokemon(
        pokemon_id=25,
        name='Pikachu',
        types=['Electric'],
        abilities=['Static'],
        stats={'hp': 35},
        sprites={'front_default': 'pikachu.png'}
    )

@pytest.fixture
def test_app():
    """Create test app with test database"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()
```

## Testing Best Practices

### What to Test
1. **Happy Path**: Normal operation with valid data
2. **Edge Cases**: Boundary conditions and limits
3. **Error Conditions**: Invalid input and error handling
4. **Security**: Authentication, authorization, input validation
5. **Performance**: Response times and resource usage

### Test Organization
1. **One test per behavior**: Each test should verify one specific behavior
2. **Descriptive names**: Test names should clearly describe what they test
3. **Arrange-Act-Assert**: Structure tests with setup, execution, and verification
4. **Independent tests**: Tests should not depend on each other
5. **Clean up**: Always clean up test data

### Test Coverage Goals
- **Unit Tests**: >90% code coverage
- **Integration Tests**: Cover all API endpoints
- **Security Tests**: Cover all security features
- **Performance Tests**: Cover critical paths

---

**Last Updated**: 2025-09-11  
**Status**: Complete Implementation  
**Next Review**: Before production deployment

