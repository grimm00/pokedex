"""
PokeAPI Client
Handles communication with the PokeAPI (https://pokeapi.co/)
"""

import requests
import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from backend.models.audit_log import log_system_event, AuditAction
from backend.cache import pokeapi_cache, cache_manager

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class PokeAPIMetrics:
    """Track PokeAPI usage metrics"""
    requests_count: int = 0
    success_count: int = 0
    error_count: int = 0
    total_time: float = 0.0
    rate_limit_remaining: int = 100
    rate_limit_reset: int = 0
    
    def get_success_rate(self) -> float:
        """Get success rate as percentage"""
        return (self.success_count / self.requests_count * 100) if self.requests_count > 0 else 0.0
    
    def get_average_response_time(self) -> float:
        """Get average response time in seconds"""
        return self.total_time / self.requests_count if self.requests_count > 0 else 0.0

class PokeAPIError(Exception):
    """Base exception for PokeAPI errors"""
    pass

class RateLimitError(PokeAPIError):
    """Rate limit exceeded"""
    pass

class APITimeoutError(PokeAPIError):
    """API request timeout"""
    pass

class PokemonNotFoundError(PokeAPIError):
    """Pokemon not found"""
    pass

class PokeAPIClient:
    """Client for interacting with the PokeAPI"""
    
    def __init__(self, base_url: str = "https://pokeapi.co/api/v2", timeout: int = 30):
        self.base_url = base_url
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Pokedex-App/1.0 (Learning Project)',
            'Accept': 'application/json'
        })
        self.metrics = PokeAPIMetrics()
        
        # Rate limiting configuration
        self.rate_limit_remaining = 100
        self.rate_limit_reset = 0
        self.min_request_interval = 0.1  # Minimum 100ms between requests
    
    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make a request to the PokeAPI with error handling and rate limiting"""
        
        # Check rate limiting
        if self.rate_limit_remaining <= 0:
            wait_time = self.rate_limit_reset - time.time()
            if wait_time > 0:
                logger.warning(f"Rate limit exceeded. Waiting {wait_time:.1f} seconds...")
                time.sleep(wait_time)
        
        # Ensure minimum interval between requests
        time.sleep(self.min_request_interval)
        
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        try:
            start_time = time.time()
            response = self.session.get(url, params=params, timeout=self.timeout)
            duration = time.time() - start_time
            
            # Update metrics
            self.metrics.requests_count += 1
            self.metrics.total_time += duration
            
            # Update rate limiting info from headers
            if 'X-Rate-Limit-Remaining' in response.headers:
                self.rate_limit_remaining = int(response.headers['X-Rate-Limit-Remaining'])
            if 'X-Rate-Limit-Reset' in response.headers:
                self.rate_limit_reset = int(response.headers['X-Rate-Limit-Reset'])
            
            # Handle different response codes
            if response.status_code == 200:
                self.metrics.success_count += 1
                return response.json()
            elif response.status_code == 404:
                self.metrics.error_count += 1
                raise PokemonNotFoundError(f"Pokemon not found: {url}")
            elif response.status_code == 429:
                self.metrics.error_count += 1
                raise RateLimitError("Rate limit exceeded")
            elif response.status_code >= 500:
                self.metrics.error_count += 1
                raise PokeAPIError(f"Server error: {response.status_code}")
            else:
                self.metrics.error_count += 1
                raise PokeAPIError(f"Unexpected response: {response.status_code}")
                
        except requests.exceptions.Timeout:
            self.metrics.error_count += 1
            raise APITimeoutError(f"Request timeout after {self.timeout} seconds")
        except requests.exceptions.ConnectionError:
            self.metrics.error_count += 1
            raise PokeAPIError("Connection error - check internet connection")
        except requests.exceptions.RequestException as e:
            self.metrics.error_count += 1
            raise PokeAPIError(f"Request failed: {str(e)}")
    
    def get_pokemon(self, pokemon_id: int) -> Dict[str, Any]:
        """Get Pokemon data by ID or name with caching"""
        # Check cache first
        cached_data = pokeapi_cache.get_pokemon_data(pokemon_id)
        if cached_data:
            logger.debug(f"Cache HIT for Pokemon {pokemon_id}")
            return cached_data
        
        try:
            data = self._make_request(f"pokemon/{pokemon_id}")
            
            # Cache the result for 24 hours
            pokeapi_cache.cache_pokemon_data(pokemon_id, data, ttl=86400)
            
            # Log successful Pokemon fetch
            log_system_event(
                action=AuditAction.EXTERNAL_API_CALL,
                details={
                    'api': 'pokeapi',
                    'endpoint': f'pokemon/{pokemon_id}',
                    'pokemon_name': data.get('name'),
                    'success': True,
                    'cached': False
                }
            )
            
            return data
            
        except Exception as e:
            # Log failed Pokemon fetch
            log_system_event(
                action=AuditAction.EXTERNAL_API_ERROR,
                details={
                    'api': 'pokeapi',
                    'endpoint': f'pokemon/{pokemon_id}',
                    'error': str(e),
                    'success': False
                }
            )
            raise
    
    def get_pokemon_list(self, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        """Get list of Pokemon with pagination"""
        try:
            params = {'limit': limit, 'offset': offset}
            data = self._make_request("pokemon", params)
            
            # Log successful list fetch
            log_system_event(
                action=AuditAction.EXTERNAL_API_CALL,
                details={
                    'api': 'pokeapi',
                    'endpoint': 'pokemon',
                    'limit': limit,
                    'offset': offset,
                    'count': len(data.get('results', [])),
                    'success': True
                }
            )
            
            return data
            
        except Exception as e:
            # Log failed list fetch
            log_system_event(
                action=AuditAction.EXTERNAL_API_ERROR,
                details={
                    'api': 'pokeapi',
                    'endpoint': 'pokemon',
                    'limit': limit,
                    'offset': offset,
                    'error': str(e),
                    'success': False
                }
            )
            raise
    
    def get_pokemon_species(self, pokemon_id: int) -> Dict[str, Any]:
        """Get Pokemon species data"""
        try:
            data = self._make_request(f"pokemon-species/{pokemon_id}")
            
            # Log successful species fetch
            log_system_event(
                action=AuditAction.EXTERNAL_API_CALL,
                details={
                    'api': 'pokeapi',
                    'endpoint': f'pokemon-species/{pokemon_id}',
                    'success': True
                }
            )
            
            return data
            
        except Exception as e:
            # Log failed species fetch
            log_system_event(
                action=AuditAction.EXTERNAL_API_ERROR,
                details={
                    'api': 'pokeapi',
                    'endpoint': f'pokemon-species/{pokemon_id}',
                    'error': str(e),
                    'success': False
                }
            )
            raise
    
    def get_pokemon_generation(self, generation: int) -> List[Dict[str, Any]]:
        """Get all Pokemon from a specific generation"""
        try:
            # PokeAPI generations endpoint
            generation_data = self._make_request(f"generation/{generation}")
            
            pokemon_species = generation_data.get('pokemon_species', [])
            pokemon_list = []
            
            # Fetch detailed data for each Pokemon
            for species in pokemon_species:
                pokemon_id = int(species['url'].split('/')[-2])
                try:
                    pokemon_data = self.get_pokemon(pokemon_id)
                    pokemon_list.append(pokemon_data)
                except Exception as e:
                    logger.warning(f"Failed to fetch Pokemon {pokemon_id}: {e}")
                    continue
            
            # Log successful generation fetch
            log_system_event(
                action=AuditAction.EXTERNAL_API_CALL,
                details={
                    'api': 'pokeapi',
                    'endpoint': f'generation/{generation}',
                    'pokemon_count': len(pokemon_list),
                    'success': True
                }
            )
            
            return pokemon_list
            
        except Exception as e:
            # Log failed generation fetch
            log_system_event(
                action=AuditAction.EXTERNAL_API_ERROR,
                details={
                    'api': 'pokeapi',
                    'endpoint': f'generation/{generation}',
                    'error': str(e),
                    'success': False
                }
            )
            raise
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        return {
            'requests_count': self.metrics.requests_count,
            'success_count': self.metrics.success_count,
            'error_count': self.metrics.error_count,
            'success_rate': self.metrics.get_success_rate(),
            'average_response_time': self.metrics.get_average_response_time(),
            'rate_limit_remaining': self.rate_limit_remaining,
            'rate_limit_reset': self.rate_limit_reset
        }
    
    def reset_metrics(self):
        """Reset metrics counters"""
        self.metrics = PokeAPIMetrics()
        self.rate_limit_remaining = 100
        self.rate_limit_reset = 0

# Global client instance
pokeapi_client = PokeAPIClient()
