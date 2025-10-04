from flask import Flask
from flask_restful import Api
from flask_migrate import Migrate
from flask_cors import CORS
# from flask_restx import Api as RestXApi  # Not needed for simple Swagger UI
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta
from dotenv import load_dotenv
from database import db
from services.security import (
    create_limiter, setup_security_headers, setup_rate_limiting,
    create_error_handlers, setup_request_logging, log_security_event
)
from services.cache import cache_manager

# Load environment variables
load_dotenv()

# Initialize Flask app without instance path
# Explicitly disable instance folder to prevent Flask from creating one
app = Flask(__name__, instance_relative_config=False)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

# Database configuration - ensure absolute path
env_database_url = os.environ.get('DATABASE_URL', '')
if env_database_url.startswith('sqlite:///'):
    # Convert relative SQLite path to absolute path
    relative_path = env_database_url.replace('sqlite:///', '')
    if not os.path.isabs(relative_path):
        # Make it relative to the project root
        absolute_path = os.path.join(os.getcwd(), relative_path)
        database_url = f'sqlite:///{absolute_path}'
    else:
        database_url = env_database_url
else:
    # Default to backend/instance/pokehub_dev.db (Flask standard)
    default_path = os.path.join(os.getcwd(), 'backend', 'instance', 'pokehub_dev.db')
    database_url = f'sqlite:///{default_path}'

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
CORS(app, origins=[
    'http://localhost:3000',  # React dev server
    'http://localhost:3001',  # React dev server (alternative port)
    'http://localhost:5173',  # Vite dev server
    'https://pokedex.example.com'  # Production domain
])
jwt = JWTManager(app)

# JWT identity loader
@jwt.user_identity_loader
def user_identity_lookup(user_id):
    return str(user_id)

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()

# Initialize security features
limiter = create_limiter(app)
setup_security_headers(app)
setup_rate_limiting(limiter)
create_error_handlers(app)
setup_request_logging(app)

# Add cache-busting headers for API responses
@app.after_request
def add_cache_headers(response):
    """Add appropriate cache headers to API responses"""
    # Don't cache API responses
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    # Add version header for cache invalidation
    response.headers['X-API-Version'] = 'v1'
    response.headers['X-Build-Date'] = os.environ.get('BUILD_DATE', 'unknown')
    
    return response

# Initialize Flask-RESTful API with versioning
api = Api(app, prefix='/api/v1')

# API Documentation endpoint (for frontend consumption)
@app.route('/api/docs')
def api_docs():
    """Simple API documentation endpoint that returns basic endpoint information"""
    return {
        'title': 'Pokedex API Documentation',
        'version': '1.0.0',
        'description': 'A comprehensive Pokemon API with user management, favorites, and caching',
        'base_url': 'http://localhost:5000',
        'endpoints': {
            'health': {
                'method': 'GET',
                'path': '/',
                'description': 'Get API health status and basic information'
            },
            'pokemon_list': {
                'method': 'GET',
                'path': '/api/v1/pokemon',
                'description': 'Get a paginated list of Pokemon with optional search and filtering',
                'parameters': {
                    'page': {'type': 'integer', 'default': 1, 'description': 'Page number'},
                    'per_page': {'type': 'integer', 'default': 20, 'description': 'Items per page (max 100)'},
                    'search': {'type': 'string', 'description': 'Search Pokemon by name'},
                    'type': {'type': 'string', 'description': 'Filter by Pokemon type'}
                }
            },
            'pokemon_detail': {
                'method': 'GET',
                'path': '/api/v1/pokemon/{pokemon_id}',
                'description': 'Get a specific Pokemon by PokeAPI ID',
                'parameters': {
                    'pokemon_id': {'type': 'integer', 'required': True, 'description': 'PokeAPI Pokemon ID'}
                }
            },
            'pokemon_types': {
                'method': 'GET',
                'path': '/api/v1/pokemon/types',
                'description': 'Get all available Pokemon types for filtering'
            },
            'cache_stats': {
                'method': 'GET',
                'path': '/api/v1/cache/stats',
                'description': 'Get Redis cache performance statistics'
            },
            'cache_clear': {
                'method': 'POST',
                'path': '/api/v1/cache/clear',
                'description': 'Clear all cache data'
            },
            'auth_register': {
                'method': 'POST',
                'path': '/api/v1/auth/register',
                'description': 'Register a new user account'
            },
            'auth_login': {
                'method': 'POST',
                'path': '/api/v1/auth/login',
                'description': 'Login with username and password'
            }
        },
        'openapi_spec': '/api/v1/swagger.json',
        'frontend_docs': 'Documentation will be available in the frontend application'
    }

# Import models and routes
from models import pokemon, user
from models.user import User
from routes import pokemon_routes, user_routes, auth_routes, cache_routes

# Register API routes
# Public routes (no authentication required)
api.add_resource(pokemon_routes.PokemonList, '/pokemon')
api.add_resource(pokemon_routes.PokemonDetail, '/pokemon/<int:pokemon_id>')
api.add_resource(pokemon_routes.PokemonTypes, '/pokemon/types')
api.add_resource(pokemon_routes.GenerationList, '/pokemon/generations')
api.add_resource(auth_routes.AuthRegister, '/auth/register')
api.add_resource(auth_routes.AuthLogin, '/auth/login')

# Protected routes (authentication required)
api.add_resource(auth_routes.AuthRefresh, '/auth/refresh')
api.add_resource(auth_routes.AuthLogout, '/auth/logout')
api.add_resource(auth_routes.AuthProfile, '/auth/profile')
api.add_resource(user_routes.UserList, '/users')
api.add_resource(user_routes.UserDetail, '/users/<int:user_id>')
api.add_resource(user_routes.UserFavorites, '/users/<int:user_id>/favorites')

# Cache management routes
api.add_resource(cache_routes.CacheStats, '/cache/stats')
api.add_resource(cache_routes.CacheManagement, '/cache/clear')
api.add_resource(cache_routes.PokemonCacheManagement, '/cache/pokemon/clear')
api.add_resource(cache_routes.CacheHealth, '/cache/health')

# Health check endpoint
@app.route('/')
def health_check():
    cache_status = "available" if cache_manager.is_available() else "unavailable"
    return {
        'status': 'healthy',
        'message': 'Pokedex API is running',
        'version': '1.0.0',
        'api_version': 'v1',
        'cache_status': cache_status,
        'docs': '/api/docs',
        'endpoints': {
            'pokemon': '/api/v1/pokemon',
            'users': '/api/v1/users',
            'cache': '/api/v1/cache/stats',
            'health': '/'
        }
    }

# OpenAPI JSON endpoint for Swagger UI
@app.route('/api/v1/swagger.json')
def swagger_spec():
    """Generate OpenAPI 3.0 specification for our API"""
    
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "Pokedex API",
            "version": "1.0.0",
            "description": "A comprehensive Pokemon API with user management, favorites, and caching",
            "contact": {
                "name": "grimm00",
                "url": "https://github.com/grimm00"
            },
            "license": {
                "name": "MIT",
                "url": "https://opensource.org/licenses/MIT"
            }
        },
        "servers": [
            {
                "url": "http://localhost:5000",
                "description": "Development server"
            }
        ],
        "paths": {
            "/": {
                "get": {
                    "summary": "Health Check",
                    "description": "Get API health status and basic information",
                    "responses": {
                        "200": {
                            "description": "API is healthy",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "status": {"type": "string", "example": "healthy"},
                                            "message": {"type": "string", "example": "Pokedex API is running"},
                                            "version": {"type": "string", "example": "1.0.0"},
                                            "api_version": {"type": "string", "example": "v1"},
                                            "cache_status": {"type": "string", "example": "available"},
                                            "docs": {"type": "string", "example": "/docs/"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/v1/pokemon": {
                "get": {
                    "summary": "Get all Pokemon",
                    "description": "Get a paginated list of Pokemon with optional search and filtering",
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "description": "Page number",
                            "required": False,
                            "schema": {"type": "integer", "default": 1}
                        },
                        {
                            "name": "per_page",
                            "in": "query",
                            "description": "Items per page (max 100)",
                            "required": False,
                            "schema": {"type": "integer", "default": 20}
                        },
                        {
                            "name": "search",
                            "in": "query",
                            "description": "Search Pokemon by name",
                            "required": False,
                            "schema": {"type": "string"}
                        },
                        {
                            "name": "type",
                            "in": "query",
                            "description": "Filter by Pokemon type",
                            "required": False,
                            "schema": {"type": "string"}
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "List of Pokemon",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "pokemon": {
                                                "type": "array",
                                                "items": {"$ref": "#/components/schemas/Pokemon"}
                                            },
                                            "pagination": {"$ref": "#/components/schemas/Pagination"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/v1/pokemon/{pokemon_id}": {
                "get": {
                    "summary": "Get Pokemon by ID",
                    "description": "Get a specific Pokemon by PokeAPI ID",
                    "parameters": [
                        {
                            "name": "pokemon_id",
                            "in": "path",
                            "description": "PokeAPI Pokemon ID",
                            "required": True,
                            "schema": {"type": "integer"}
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Pokemon details",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Pokemon"}
                                }
                            }
                        },
                        "404": {
                            "description": "Pokemon not found",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        }
                    }
                }
            },
            "/api/v1/cache/stats": {
                "get": {
                    "summary": "Get cache statistics",
                    "description": "Get Redis cache performance statistics",
                    "responses": {
                        "200": {
                            "description": "Cache statistics",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "cache_stats": {"$ref": "#/components/schemas/CacheStats"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "components": {
            "schemas": {
                "Pokemon": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer", "description": "Internal database ID", "example": 1},
                        "pokemon_id": {"type": "integer", "description": "PokeAPI Pokemon ID", "example": 1},
                        "name": {"type": "string", "description": "Pokemon name", "example": "bulbasaur"},
                        "height": {"type": "integer", "description": "Height in decimeters", "example": 7},
                        "weight": {"type": "integer", "description": "Weight in hectograms", "example": 69},
                        "base_experience": {"type": "integer", "description": "Base experience points", "example": 64},
                        "types": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Pokemon types",
                            "example": ["grass", "poison"]
                        },
                        "abilities": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Pokemon abilities",
                            "example": ["overgrow", "chlorophyll"]
                        },
                        "stats": {
                            "type": "object",
                            "description": "Base stats",
                            "example": {"hp": 45, "attack": 49, "defense": 49}
                        },
                        "sprites": {
                            "type": "object",
                            "description": "Pokemon sprites/images",
                            "example": {"front_default": "https://..."}
                        }
                    }
                },
                "Pagination": {
                    "type": "object",
                    "properties": {
                        "page": {"type": "integer", "description": "Current page number", "example": 1},
                        "per_page": {"type": "integer", "description": "Items per page", "example": 20},
                        "total": {"type": "integer", "description": "Total number of items", "example": 50},
                        "pages": {"type": "integer", "description": "Total number of pages", "example": 3},
                        "has_next": {"type": "boolean", "description": "Has next page", "example": True},
                        "has_prev": {"type": "boolean", "description": "Has previous page", "example": False}
                    }
                },
                "CacheStats": {
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "description": "Cache status", "example": "available"},
                        "redis_version": {"type": "string", "description": "Redis version", "example": "8.0.2"},
                        "used_memory": {"type": "string", "description": "Memory usage", "example": "853.47K"},
                        "connected_clients": {"type": "integer", "description": "Connected clients", "example": 2},
                        "total_commands_processed": {"type": "integer", "description": "Total commands", "example": 61},
                        "keyspace_hits": {"type": "integer", "description": "Cache hits", "example": 6},
                        "keyspace_misses": {"type": "integer", "description": "Cache misses", "example": 4},
                        "hit_rate": {"type": "number", "description": "Cache hit rate", "example": 0.6}
                    }
                },
                "Error": {
                    "type": "object",
                    "properties": {
                        "message": {"type": "string", "description": "Error message", "example": "Resource not found"},
                        "status": {"type": "integer", "description": "HTTP status code", "example": 404},
                        "error": {"type": "string", "description": "Error type", "example": "Not Found"}
                    }
                }
            }
        }
    }
    
    return jsonify(spec)

# API version info endpoint
@app.route('/api/version')
def api_version():
    return {
        'current_version': 'v1',
        'api_version': '1.0.0',
        'supported_versions': ['v1'],
        'deprecated_versions': [],
        'endpoints': {
            'v1': {
                'pokemon': '/api/v1/pokemon',
                'users': '/api/v1/users',
                'docs': '/api/docs'
            }
        }
    }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
