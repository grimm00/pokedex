"""
Cache Management Routes
Provides endpoints for cache statistics and management
"""

from flask_restful import Resource
from flask import jsonify
from backend.services.cache import cache_manager, pokemon_cache, pokeapi_cache, get_cache_stats, clear_all_cache
from backend.services.security import limiter
import logging

# Cache logger
cache_logger = logging.getLogger('cache')

class CacheStats(Resource):
    """Handle GET /api/v1/cache/stats - Get cache statistics"""
    
    @limiter.limit("10 per minute")
    def get(self):
        """Get Redis cache statistics"""
        try:
            stats = get_cache_stats()
            return jsonify({
                'status': 'success',
                'cache_stats': stats
            })
        except Exception as e:
            cache_logger.error(f"Error getting cache stats: {e}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to get cache statistics'
            }), 500

class CacheManagement(Resource):
    """Handle cache management operations"""
    
    @limiter.limit("5 per minute")
    def delete(self):
        """Clear all cache data"""
        try:
            results = clear_all_cache()
            cache_logger.info(f"Cache cleared: {results}")
            return jsonify({
                'status': 'success',
                'message': 'Cache cleared successfully',
                'results': results
            })
        except Exception as e:
            cache_logger.error(f"Error clearing cache: {e}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to clear cache'
            }), 500

class PokemonCacheManagement(Resource):
    """Handle Pokemon-specific cache management"""
    
    @limiter.limit("10 per minute")
    def delete(self):
        """Clear Pokemon cache data"""
        try:
            results = {
                'pokemon_cache': pokemon_cache.clear_all_pokemon_cache(),
                'pokeapi_cache': pokeapi_cache.clear_pokeapi_cache()
            }
            cache_logger.info(f"Pokemon cache cleared: {results}")
            return jsonify({
                'status': 'success',
                'message': 'Pokemon cache cleared successfully',
                'results': results
            })
        except Exception as e:
            cache_logger.error(f"Error clearing Pokemon cache: {e}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to clear Pokemon cache'
            }), 500

class CacheHealth(Resource):
    """Handle GET /api/v1/cache/health - Check cache health"""
    
    def get(self):
        """Check if Redis cache is available and healthy"""
        try:
            is_available = cache_manager.is_available()
            if is_available:
                return jsonify({
                    'status': 'healthy',
                    'message': 'Redis cache is available and responding',
                    'available': True
                })
            else:
                return jsonify({
                    'status': 'unhealthy',
                    'message': 'Redis cache is not available',
                    'available': False
                }), 503
        except Exception as e:
            cache_logger.error(f"Error checking cache health: {e}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to check cache health',
                'available': False
            }), 500
