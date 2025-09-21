"""
API tests for Authentication endpoints
"""
import pytest


class TestAuthAPI:
    """Test Authentication API endpoints"""
    
    def test_register_user(self, client):
        """Test user registration"""
        response = client.post('/api/v1/auth/register', json={
            'username': 'newuser',
            'password': 'password123',
            'email': 'newuser@example.com'
        })
        
        assert response.status_code == 201
        data = response.json
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['username'] == 'newuser'
    
    def test_register_user_duplicate(self, client):
        """Test user registration with duplicate username"""
        # First registration
        client.post('/api/v1/auth/register', json={
            'username': 'duplicate',
            'password': 'password123',
            'email': 'duplicate1@example.com'
        })
        
        # Second registration with same username
        response = client.post('/api/v1/auth/register', json={
            'username': 'duplicate',
            'password': 'password123',
            'email': 'duplicate2@example.com'
        })
        
        assert response.status_code == 400
        assert 'already exists' in response.json['message'].lower()
    
    def test_login_user(self, client):
        """Test user login"""
        # First register
        client.post('/api/v1/auth/register', json={
            'username': 'loginuser',
            'password': 'password123',
            'email': 'loginuser@example.com'
        })
        
        # Then login
        response = client.post('/api/v1/auth/login', json={
            'username': 'loginuser',
            'password': 'password123'
        })
        
        assert response.status_code == 200
        data = response.json
        assert 'access_token' in data
        assert 'user' in data
    
    def test_login_user_invalid_credentials(self, client):
        """Test user login with invalid credentials"""
        response = client.post('/api/v1/auth/login', json={
            'username': 'nonexistent',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        assert 'invalid' in response.json['message'].lower()
    
    def test_get_profile_authenticated(self, client, auth_headers):
        """Test getting user profile when authenticated"""
        response = client.get('/api/v1/users/profile', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert 'id' in data
        assert 'username' in data
        assert 'email' in data
    
    def test_get_profile_unauthenticated(self, client):
        """Test getting user profile when not authenticated"""
        response = client.get('/api/v1/users/profile')
        
        assert response.status_code == 401
        assert 'missing' in response.json['msg'].lower()
    
    def test_refresh_token(self, client, auth_headers):
        """Test token refresh"""
        response = client.post('/api/v1/auth/refresh', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert 'access_token' in data
    
    def test_logout(self, client, auth_headers):
        """Test user logout"""
        response = client.post('/api/v1/auth/logout', headers=auth_headers)
        
        assert response.status_code == 200
        assert 'logged out' in response.json['message'].lower()

