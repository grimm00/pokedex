"""
Performance tests for API endpoints
"""
import pytest
import time
import concurrent.futures


class TestAPIPerformance:
    """Test API performance and load handling"""
    
    def test_pokemon_list_response_time(self, client):
        """Test Pokemon list response time"""
        start_time = time.time()
        response = client.get('/api/v1/pokemon?page=1&per_page=20')
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = end_time - start_time
        assert response_time < 1.0  # Should respond within 1 second
    
    def test_favorites_sorting_response_time(self, client, auth_headers, test_user_id):
        """Test favorites sorting response time"""
        # Add some favorites
        client.post(f'/api/v1/users/{test_user_id}/favorites',
                   headers=auth_headers,
                   json={'pokemon_id': 25})
        
        start_time = time.time()
        response = client.get('/api/v1/pokemon?sort=favorites', headers=auth_headers)
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = end_time - start_time
        assert response_time < 2.0  # Favorites sorting might take longer
    
    def test_concurrent_requests(self, client, auth_headers, test_user_id):
        """Test handling concurrent requests"""
        def make_request():
            return client.get('/api/v1/pokemon?page=1&per_page=10', headers=auth_headers)
        
        # Make 5 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(5)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # All requests should succeed
        for response in results:
            assert response.status_code == 200
    
    def test_favorites_sorting_concurrent_users(self, client):
        """Test favorites sorting with concurrent users"""
        def create_user_and_test(user_num):
            # Create user
            response = client.post('/api/v1/auth/register', json={
                'username': f'perfuser{user_num}',
                'password': 'password123',
                'email': f'perfuser{user_num}@example.com'
            })
            token = response.json['access_token']
            headers = {'Authorization': f'Bearer {token}'}
            user_id = response.json['user']['id']
            
            # Add favorite
            client.post(f'/api/v1/users/{user_id}/favorites',
                       headers=headers,
                       json={'pokemon_id': 25})
            
            # Test favorites sorting
            start_time = time.time()
            response = client.get('/api/v1/pokemon?sort=favorites', headers=headers)
            end_time = time.time()
            
            return response.status_code == 200, end_time - start_time
        
        # Create 3 concurrent users
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(create_user_and_test, i) for i in range(3)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # All should succeed
        for success, response_time in results:
            assert success
            assert response_time < 3.0  # Should complete within 3 seconds
    
    def test_large_pagination(self, client):
        """Test performance with large page sizes"""
        start_time = time.time()
        response = client.get('/api/v1/pokemon?page=1&per_page=100')
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = end_time - start_time
        assert response_time < 2.0  # Large pages should still be fast
    
    def test_search_performance(self, client):
        """Test search performance with various queries"""
        search_queries = ['pika', 'char', 'mew', 'bulba']
        
        for query in search_queries:
            start_time = time.time()
            response = client.get(f'/api/v1/pokemon?search={query}')
            end_time = time.time()
            
            assert response.status_code == 200
            response_time = end_time - start_time
            assert response_time < 1.0  # Search should be fast
    
    def test_type_filter_performance(self, client):
        """Test type filter performance"""
        types = ['electric', 'fire', 'water', 'psychic']
        
        for pokemon_type in types:
            start_time = time.time()
            response = client.get(f'/api/v1/pokemon?type={pokemon_type}')
            end_time = time.time()
            
            assert response.status_code == 200
            response_time = end_time - start_time
            assert response_time < 1.0  # Type filtering should be fast
