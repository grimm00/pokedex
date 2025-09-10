from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_restx import Api as RestXApi
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 
    'postgresql://localhost/pokedex_dev'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)
jwt = JWTManager(app)

# Initialize Flask-RESTful API with versioning
api = Api(app, prefix='/api/v1')

# Initialize Flask-RESTX for documentation
restx_api = RestXApi(
    app, 
    version='1.0', 
    title='Pokedex API v1',
    description='A comprehensive Pokemon API for learning full-stack development',
    doc='/docs/',
    prefix='/api/v1'
)

# Import models and routes
from backend.models import pokemon, user
from backend.routes import pokemon_routes, user_routes, auth_routes

# Register API routes
# Public routes (no authentication required)
api.add_resource(pokemon_routes.PokemonList, '/pokemon')
api.add_resource(pokemon_routes.PokemonDetail, '/pokemon/<int:pokemon_id>')
api.add_resource(auth_routes.AuthRegister, '/auth/register')
api.add_resource(auth_routes.AuthLogin, '/auth/login')

# Protected routes (authentication required)
api.add_resource(auth_routes.AuthRefresh, '/auth/refresh')
api.add_resource(auth_routes.AuthLogout, '/auth/logout')
api.add_resource(auth_routes.AuthProfile, '/auth/profile')
api.add_resource(user_routes.UserList, '/users')
api.add_resource(user_routes.UserDetail, '/users/<int:user_id>')
api.add_resource(user_routes.UserFavorites, '/users/<int:user_id>/favorites')

# Health check endpoint
@app.route('/')
def health_check():
    return {
        'status': 'healthy',
        'message': 'Pokedex API is running',
        'version': '1.0.0',
        'api_version': 'v1',
        'docs': '/docs/',
        'endpoints': {
            'pokemon': '/api/v1/pokemon',
            'users': '/api/v1/users',
            'health': '/'
        }
    }

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
                'docs': '/docs/'
            }
        }
    }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
