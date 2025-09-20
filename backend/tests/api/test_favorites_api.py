"""
API tests for Favorites endpoints
"""
import pytest


class TestFavoritesAPI:
    """Test Favorites API endpoints"""
    
    def test_add_favorite(self, client, auth_headers, test_user_id):
        """Test adding a favorite Pokemon"""
        response = client.post(f'/api/v1/users/{test_user_id}/favorites',
                             headers=auth_headers,
                             json={'pokemon_id': 25})
        
        assert response.status_code == 201
        data = response.json
        assert data['user_id'] == test_user_id
        assert data['pokemon_id'] == 25
        assert 'id' in data
        assert 'created_at' in data
    
    def test_add_favorite_duplicate(self, client, auth_headers, test_user_id):
        """Test adding duplicate favorite"""
        # Add first time
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 25})
        
        # Try to add again
        response = client.post(f'/api/v1/users/{test_user_id}/favorites',
                             headers=auth_headers,
                             json={'pokemon_id': 25})
        
        assert response.status_code == 400
        assert 'already' in response.json['message'].lower()
    
    def test_add_favorite_invalid_pokemon(self, client, auth_headers, test_user_id):
        """Test adding favorite with invalid Pokemon ID"""
        response = client.post(f'/api/v1/users/{test_user_id}/favorites',
                             headers=auth_headers,
                             json={'pokemon_id': 99999})
        
        assert response.status_code == 404
        assert 'not found' in response.json['message'].lower()
    
    def test_add_favorite_unauthenticated(self, client):
        """Test adding favorite without authentication"""
        response = client.post('/api/v1/users/1/favorites',
                             json={'pokemon_id': 25})
        
        assert response.status_code == 401
    
    def test_get_favorites(self, client, auth_headers, test_user_id):
        """Test getting user favorites"""
        # Add some favorites
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 25})
        
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 150})
        
        # Get favorites
        response = client.get(f'/api/v1/users/{test_user_id}/favorites',
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert 'favorites' in data
        assert len(data['favorites']) == 2
        
        # Check Pokemon data is included
        pokemon_ids = [fav['pokemon']['pokemon_id'] for fav in data['favorites']]
        assert 25 in pokemon_ids
        assert 150 in pokemon_ids
    
    def test_get_favorites_empty(self, client, auth_headers, test_user_id):
        """Test getting favorites when user has none"""
        response = client.get(f'/api/v1/users/{test_user_id}/favorites',
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert 'favorites' in data
        assert len(data['favorites']) == 0
    
    def test_remove_favorite(self, client, auth_headers, test_user_id):
        """Test removing a favorite Pokemon"""
        # Add favorite first
        add_response = client.post(f'/api/v1/users/{test_user_id}/favorites',
                                 headers=auth_headers,
                                 json={'pokemon_id': 25})
        
        favorite_id = add_response.json['id']
        
        # Remove favorite
        response = client.delete(f'/api/v1/users/{test_user_id}/favorites/{favorite_id}',
                               headers=auth_headers)
        
        assert response.status_code == 200
        assert 'removed' in response.json['message'].lower()
    
    def test_remove_favorite_nonexistent(self, client, auth_headers, test_user_id):
        """Test removing non-existent favorite"""
        response = client.delete(f'/api/v1/users/{test_user_id}/favorites/99999',
                               headers=auth_headers)
        
        assert response.status_code == 404
        assert 'not found' in response.json['message'].lower()
    
    def test_remove_favorite_wrong_user(self, client, auth_headers, test_user_id):
        """Test removing favorite from wrong user"""
        # Create another user
        client.post('/api/v1/auth/register', json={
            'username': 'otheruser',
            'password': 'password123',
            'email': 'other@example.com'
        })
        
        # Try to remove from wrong user
        response = client.delete(f'/api/v1/users/999/favorites/1',
                               headers=auth_headers)
        
        assert response.status_code == 403
        assert 'forbidden' in response.json['message'].lower()
    
    def test_favorites_user_isolation(self, client, auth_headers, test_user_id):
        """Test that users only see their own favorites"""
        # Add favorite for test user
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 25})
        
        # Create another user
        other_response = client.post('/api/v1/auth/register', json={
            'username': 'isolationuser',
            'password': 'password123',
            'email': 'isolation@example.com'
        })
        
        other_token = other_response.json['access_token']
        other_headers = {'Authorization': f'Bearer {other_token}'}
        
        # Add different favorite for other user
        client.post('/api/v1/users/2/favorites',
                   headers=other_headers,
                   json={'pokemon_id': 150})
        
        # Check test user only sees their favorites
        response = client.get(f'/api/v1/users/{test_user_id}/favorites',
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json
        assert len(data['favorites']) == 1
        assert data['favorites'][0]['pokemon']['pokemon_id'] == 25
