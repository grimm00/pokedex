"""
Integration tests for favorites sorting functionality
"""
import pytest


class TestFavoritesSortingIntegration:
    """Test favorites sorting integration scenarios"""
    
    def test_favorites_sorting_single_user(self, client, auth_headers, test_user_id):
        """Test favorites sorting with single user"""
        # Add multiple favorites
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 25})  # Pikachu
        
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 150})  # Mewtwo
        
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 1})  # Bulbasaur
        
        # Test favorites sorting
        response = client.get('/api/v1/pokemon?sort=favorites', headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json
        pokemon_ids = [p['pokemon_id'] for p in data['pokemon']]
        
        # First three should be favorites in order
        assert pokemon_ids[0] == 1  # Bulbasaur
        assert pokemon_ids[1] == 25  # Pikachu
        assert pokemon_ids[2] == 150  # Mewtwo
    
    def test_favorites_sorting_multiple_users(self, client, test_user_id):
        """Test favorites sorting with multiple users"""
        # Create two users
        user1_response = client.post('/api/v1/auth/register', json={
            'username': 'user1',
            'password': 'password123',
            'email': 'user1@example.com'
        })
        user1_token = user1_response.json['access_token']
        user1_headers = {'Authorization': f'Bearer {user1_token}'}
        
        user2_response = client.post('/api/v1/auth/register', json={
            'username': 'user2',
            'password': 'password123',
            'email': 'user2@example.com'
        })
        user2_token = user2_response.json['access_token']
        user2_headers = {'Authorization': f'Bearer {user2_token}'}
        
        # User 1 favorites
        client.post('/api/v1/users/2/favorites',
                   headers=user1_headers,
                   json={'pokemon_id': 25})  # Pikachu
        
        # User 2 favorites
        client.post('/api/v1/users/3/favorites',
                   headers=user2_headers,
                   json={'pokemon_id': 150})  # Mewtwo
        
        # Test user 1 sees their favorites first
        response = client.get('/api/v1/pokemon?sort=favorites', headers=user1_headers)
        assert response.status_code == 200
        
        data = response.json
        assert data['pokemon'][0]['pokemon_id'] == 25  # Pikachu
        
        # Test user 2 sees their favorites first
        response = client.get('/api/v1/pokemon?sort=favorites', headers=user2_headers)
        assert response.status_code == 200
        
        data = response.json
        assert data['pokemon'][0]['pokemon_id'] == 150  # Mewtwo
    
    def test_favorites_sorting_with_search(self, client, auth_headers, test_user_id):
        """Test favorites sorting combined with search"""
        # Add favorite
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 25})  # Pikachu
        
        # Test favorites + search
        response = client.get('/api/v1/pokemon?sort=favorites&search=pika',
                            headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json
        assert len(data['pokemon']) == 1
        assert data['pokemon'][0]['pokemon_id'] == 25
    
    def test_favorites_sorting_with_type_filter(self, client, auth_headers, test_user_id):
        """Test favorites sorting combined with type filter"""
        # Add favorite
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 25})  # Pikachu (electric)
        
        # Test favorites + type filter
        response = client.get('/api/v1/pokemon?sort=favorites&type=electric',
                            headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json
        assert data['pokemon'][0]['pokemon_id'] == 25  # Pikachu should be first
    
    def test_favorites_sorting_pagination(self, client, auth_headers, test_user_id):
        """Test favorites sorting with pagination"""
        # Add multiple favorites
        for pokemon_id in [1, 25, 150, 151]:
            client.post(f'/api/v1/users/{test_user_id}/favorites',
                       headers=auth_headers,
                       json={'pokemon_id': pokemon_id})
        
        # Test first page
        response = client.get('/api/v1/pokemon?sort=favorites&page=1&per_page=2',
                            headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json
        assert len(data['pokemon']) == 2
        assert data['pokemon'][0]['pokemon_id'] == 1  # First favorite
        assert data['pokemon'][1]['pokemon_id'] == 25  # Second favorite
        
        # Test second page
        response = client.get('/api/v1/pokemon?sort=favorites&page=2&per_page=2',
                            headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json
        assert len(data['pokemon']) == 2
        assert data['pokemon'][0]['pokemon_id'] == 150  # Third favorite
        assert data['pokemon'][1]['pokemon_id'] == 151  # Fourth favorite
    
    def test_favorites_sorting_no_favorites(self, client, auth_headers):
        """Test favorites sorting when user has no favorites"""
        response = client.get('/api/v1/pokemon?sort=favorites', headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json
        # Should return default order
        pokemon_ids = [p['pokemon_id'] for p in data['pokemon']]
        assert pokemon_ids == sorted(pokemon_ids)
    
    def test_favorites_sorting_invalid_token(self, client):
        """Test favorites sorting with invalid token"""
        response = client.get('/api/v1/pokemon?sort=favorites',
                            headers={'Authorization': 'Bearer invalid_token'})
        assert response.status_code == 422  # JWT decode error
    
    def test_favorites_sorting_missing_token(self, client):
        """Test favorites sorting without token"""
        response = client.get('/api/v1/pokemon?sort=favorites')
        assert response.status_code == 200
        
        # Should fall back to default sorting
        data = response.json
        pokemon_ids = [p['pokemon_id'] for p in data['pokemon']]
        assert pokemon_ids == sorted(pokemon_ids)

