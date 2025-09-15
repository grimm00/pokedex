"""
Redis Caching Module for Pokedex API

This module provides comprehensive caching functionality using Redis for:
- Pokemon data caching
- API response caching
- PokeAPI data caching
- User session caching
- Query result caching
"""

import redis
import json
import pickle
import hashlib
from typing import Any, Optional, Dict, List, Union
from datetime import datetime, timedelta
import logging
from functools import wraps

# Cache logger
cache_logger = logging.getLogger('cache')

class CacheManager:
    """Centralized cache management for the Pokedex API"""
    
    def __init__(self, host='localhost', port=6379, db=0, password=None):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.Redis(
                host=host,
                port=port,
                db=db,
                password=password,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test connection
            self.redis_client.ping()
            cache_logger.info("Redis connection established successfully")
        except Exception as e:
            cache_logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    def is_available(self) -> bool:
        """Check if Redis is available"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False
    
    def _generate_key(self, prefix: str, identifier: Union[str, int], *args) -> str:
        """Generate a consistent cache key"""
        key_parts = [prefix, str(identifier)]
        if args:
            key_parts.extend(str(arg) for arg in args)
        return ":".join(key_parts)
    
    def _serialize_data(self, data: Any) -> str:
        """Serialize data for storage in Redis"""
        try:
            return json.dumps(data, default=str)
        except (TypeError, ValueError):
            # Fallback to pickle for complex objects
            return pickle.dumps(data).hex()
    
    def _deserialize_data(self, data: str) -> Any:
        """Deserialize data from Redis"""
        try:
            return json.loads(data)
        except (json.JSONDecodeError, TypeError):
            try:
                return pickle.loads(bytes.fromhex(data))
            except:
                return data
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set a value in cache with optional TTL"""
        if not self.is_available():
            return False
        
        try:
            serialized_value = self._serialize_data(value)
            if ttl:
                result = self.redis_client.setex(key, ttl, serialized_value)
            else:
                result = self.redis_client.set(key, serialized_value)
            
            cache_logger.debug(f"Cache SET: {key} (TTL: {ttl})")
            return result
        except Exception as e:
            cache_logger.error(f"Cache SET error for key {key}: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get a value from cache"""
        if not self.is_available():
            return None
        
        try:
            data = self.redis_client.get(key)
            if data is None:
                cache_logger.debug(f"Cache MISS: {key}")
                return None
            
            deserialized_data = self._deserialize_data(data)
            cache_logger.debug(f"Cache HIT: {key}")
            return deserialized_data
        except Exception as e:
            cache_logger.error(f"Cache GET error for key {key}: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """Delete a key from cache"""
        if not self.is_available():
            return False
        
        try:
            result = self.redis_client.delete(key)
            cache_logger.debug(f"Cache DELETE: {key}")
            return bool(result)
        except Exception as e:
            cache_logger.error(f"Cache DELETE error for key {key}: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if a key exists in cache"""
        if not self.is_available():
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            cache_logger.error(f"Cache EXISTS error for key {key}: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching a pattern"""
        if not self.is_available():
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                result = self.redis_client.delete(*keys)
                cache_logger.info(f"Cache CLEAR: {len(keys)} keys matching pattern {pattern}")
                return result
            return 0
        except Exception as e:
            cache_logger.error(f"Cache CLEAR error for pattern {pattern}: {e}")
            return 0
    
    def get_ttl(self, key: str) -> int:
        """Get TTL for a key"""
        if not self.is_available():
            return -1
        
        try:
            return self.redis_client.ttl(key)
        except Exception as e:
            cache_logger.error(f"Cache TTL error for key {key}: {e}")
            return -1

class PokemonCache:
    """Specialized caching for Pokemon data"""
    
    def __init__(self, cache_manager: CacheManager):
        self.cache = cache_manager
        self.pokemon_prefix = "pokemon"
        self.list_prefix = "pokemon_list"
        self.search_prefix = "pokemon_search"
        self.type_prefix = "pokemon_type"
    
    def cache_pokemon(self, pokemon_id: int, pokemon_data: Dict[str, Any], ttl: int = 3600) -> bool:
        """Cache individual Pokemon data"""
        key = self.cache._generate_key(self.pokemon_prefix, pokemon_id)
        return self.cache.set(key, pokemon_data, ttl)
    
    def get_pokemon(self, pokemon_id: int) -> Optional[Dict[str, Any]]:
        """Get cached Pokemon data"""
        key = self.cache._generate_key(self.pokemon_prefix, pokemon_id)
        return self.cache.get(key)
    
    def cache_pokemon_list(self, params: Dict[str, Any], pokemon_list: List[Dict[str, Any]], ttl: int = 300) -> bool:
        """Cache Pokemon list with parameters"""
        # Create a hash of the parameters for the key
        param_str = json.dumps(params, sort_keys=True)
        param_hash = hashlib.md5(param_str.encode()).hexdigest()[:8]
        key = self.cache._generate_key(self.list_prefix, param_hash)
        return self.cache.set(key, pokemon_list, ttl)
    
    def get_pokemon_list(self, params: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """Get cached Pokemon list"""
        param_str = json.dumps(params, sort_keys=True)
        param_hash = hashlib.md5(param_str.encode()).hexdigest()[:8]
        key = self.cache._generate_key(self.list_prefix, param_hash)
        return self.cache.get(key)
    
    def cache_search_results(self, search_term: str, results: List[Dict[str, Any]], ttl: int = 300) -> bool:
        """Cache search results"""
        key = self.cache._generate_key(self.search_prefix, search_term.lower())
        return self.cache.set(key, results, ttl)
    
    def get_search_results(self, search_term: str) -> Optional[List[Dict[str, Any]]]:
        """Get cached search results"""
        key = self.cache._generate_key(self.search_prefix, search_term.lower())
        return self.cache.get(key)
    
    def cache_type_filter(self, pokemon_type: str, results: List[Dict[str, Any]], ttl: int = 300) -> bool:
        """Cache type filter results"""
        key = self.cache._generate_key(self.type_prefix, pokemon_type.lower())
        return self.cache.set(key, results, ttl)
    
    def get_type_filter(self, pokemon_type: str) -> Optional[List[Dict[str, Any]]]:
        """Get cached type filter results"""
        key = self.cache._generate_key(self.type_prefix, pokemon_type.lower())
        return self.cache.get(key)
    
    def clear_pokemon_cache(self, pokemon_id: Optional[int] = None) -> int:
        """Clear Pokemon cache"""
        if pokemon_id:
            key = self.cache._generate_key(self.pokemon_prefix, pokemon_id)
            return 1 if self.cache.delete(key) else 0
        else:
            return self.cache.clear_pattern(f"{self.pokemon_prefix}:*")
    
    def clear_list_cache(self) -> int:
        """Clear Pokemon list cache"""
        return self.cache.clear_pattern(f"{self.list_prefix}:*")
    
    def clear_search_cache(self) -> int:
        """Clear search cache"""
        return self.cache.clear_pattern(f"{self.search_prefix}:*")
    
    def clear_type_cache(self) -> int:
        """Clear type filter cache"""
        return self.cache.clear_pattern(f"{self.type_prefix}:*")
    
    def clear_all_pokemon_cache(self) -> int:
        """Clear all Pokemon-related cache"""
        total = 0
        total += self.clear_pokemon_cache()
        total += self.clear_list_cache()
        total += self.clear_search_cache()
        total += self.clear_type_cache()
        return total

class PokeAPICache:
    """Specialized caching for PokeAPI data"""
    
    def __init__(self, cache_manager: CacheManager):
        self.cache = cache_manager
        self.pokeapi_prefix = "pokeapi"
        self.pokemon_prefix = "pokeapi_pokemon"
        self.species_prefix = "pokeapi_species"
        self.evolution_prefix = "pokeapi_evolution"
    
    def cache_pokemon_data(self, pokemon_id: int, pokemon_data: Dict[str, Any], ttl: int = 86400) -> bool:
        """Cache raw PokeAPI Pokemon data (24 hour TTL)"""
        key = self.cache._generate_key(self.pokemon_prefix, pokemon_id)
        return self.cache.set(key, pokemon_data, ttl)
    
    def get_pokemon_data(self, pokemon_id: int) -> Optional[Dict[str, Any]]:
        """Get cached PokeAPI Pokemon data"""
        key = self.cache._generate_key(self.pokemon_prefix, pokemon_id)
        return self.cache.get(key)
    
    def cache_species_data(self, pokemon_id: int, species_data: Dict[str, Any], ttl: int = 86400) -> bool:
        """Cache PokeAPI species data"""
        key = self.cache._generate_key(self.species_prefix, pokemon_id)
        return self.cache.set(key, species_data, ttl)
    
    def get_species_data(self, pokemon_id: int) -> Optional[Dict[str, Any]]:
        """Get cached PokeAPI species data"""
        key = self.cache._generate_key(self.species_prefix, pokemon_id)
        return self.cache.get(key)
    
    def cache_evolution_chain(self, chain_id: int, evolution_data: Dict[str, Any], ttl: int = 86400) -> bool:
        """Cache PokeAPI evolution chain data"""
        key = self.cache._generate_key(self.evolution_prefix, chain_id)
        return self.cache.set(key, evolution_data, ttl)
    
    def get_evolution_chain(self, chain_id: int) -> Optional[Dict[str, Any]]:
        """Get cached PokeAPI evolution chain data"""
        key = self.cache._generate_key(self.evolution_prefix, chain_id)
        return self.cache.get(key)
    
    def clear_pokeapi_cache(self) -> int:
        """Clear all PokeAPI cache"""
        return self.cache.clear_pattern(f"{self.pokeapi_prefix}:*")

def cache_result(ttl: int = 300, key_prefix: str = "api"):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key_parts = [key_prefix, func.__name__]
            cache_key_parts.extend(str(arg) for arg in args)
            cache_key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = ":".join(cache_key_parts)
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                cache_logger.debug(f"Cache HIT for function {func.__name__}")
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl)
            cache_logger.debug(f"Cache SET for function {func.__name__}")
            return result
        return wrapper
    return decorator

# Global cache instances
cache_manager = CacheManager()
pokemon_cache = PokemonCache(cache_manager)
pokeapi_cache = PokeAPICache(cache_manager)

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    if not cache_manager.is_available():
        return {"status": "unavailable", "message": "Redis not available"}
    
    try:
        info = cache_manager.redis_client.info()
        return {
            "status": "available",
            "redis_version": info.get("redis_version"),
            "used_memory": info.get("used_memory_human"),
            "connected_clients": info.get("connected_clients"),
            "total_commands_processed": info.get("total_commands_processed"),
            "keyspace_hits": info.get("keyspace_hits", 0),
            "keyspace_misses": info.get("keyspace_misses", 0),
            "hit_rate": info.get("keyspace_hits", 0) / max(info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0), 1)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def clear_all_cache() -> Dict[str, int]:
    """Clear all cache data"""
    results = {
        "pokemon_cache": pokemon_cache.clear_all_pokemon_cache(),
        "pokeapi_cache": pokeapi_cache.clear_pokeapi_cache(),
        "total_keys": 0
    }
    results["total_keys"] = sum(results.values())
    return results
