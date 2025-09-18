#!/usr/bin/env python3
"""
Updated test script for Flask-RESTful API with current backend structure
Tests both local and containerized backend functionality
"""

import os
import sys
import tempfile
import requests
import json
from datetime import datetime

# Add the project root to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
sys.path.insert(0, project_root)

def test_local_backend():
    """Test the backend running locally"""
    print("🧪 Testing Local Backend...")
    
    try:
        # Test health endpoint
        response = requests.get('http://localhost:5000/', timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint: OK")
            health_data = response.json()
            print(f"   Status: {health_data.get('status')}")
            print(f"   Version: {health_data.get('version')}")
        else:
            print(f"❌ Health endpoint: {response.status_code}")
            return False
            
        # Test API documentation
        response = requests.get('http://localhost:5000/api/docs', timeout=5)
        if response.status_code == 200:
            print("✅ API docs endpoint: OK")
        else:
            print(f"❌ API docs endpoint: {response.status_code}")
            
        # Test Pokemon list endpoint
        response = requests.get('http://localhost:5000/api/v1/pokemon', timeout=5)
        if response.status_code == 200:
            print("✅ Pokemon list endpoint: OK")
            pokemon_data = response.json()
            print(f"   Pokemon count: {len(pokemon_data.get('pokemon', []))}")
            print(f"   Pagination: {pokemon_data.get('pagination', {})}")
        else:
            print(f"❌ Pokemon list endpoint: {response.status_code}")
            
        # Test Pokemon types endpoint
        response = requests.get('http://localhost:5000/api/v1/pokemon/types', timeout=5)
        if response.status_code == 200:
            print("✅ Pokemon types endpoint: OK")
            types = response.json()
            print(f"   Available types: {len(types)}")
            print(f"   Sample types: {types[:5]}")
        else:
            print(f"❌ Pokemon types endpoint: {response.status_code}")
            
        # Test search functionality
        response = requests.get('http://localhost:5000/api/v1/pokemon?search=char', timeout=5)
        if response.status_code == 200:
            print("✅ Search endpoint: OK")
            search_data = response.json()
            print(f"   Search results: {len(search_data.get('pokemon', []))}")
        else:
            print(f"❌ Search endpoint: {response.status_code}")
            
        # Test type filtering
        response = requests.get('http://localhost:5000/api/v1/pokemon?type=fire', timeout=5)
        if response.status_code == 200:
            print("✅ Type filter endpoint: OK")
            filter_data = response.json()
            print(f"   Filtered results: {len(filter_data.get('pokemon', []))}")
        else:
            print(f"❌ Type filter endpoint: {response.status_code}")
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Local backend not running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Error testing local backend: {e}")
        return False

def test_containerized_backend():
    """Test the backend running in Docker container"""
    print("\n🐳 Testing Containerized Backend...")
    
    try:
        # Test health endpoint
        response = requests.get('http://localhost/api/v1/health', timeout=5)
        if response.status_code == 200:
            print("✅ Container health endpoint: OK")
        else:
            print(f"❌ Container health endpoint: {response.status_code}")
            
        # Test main application
        response = requests.get('http://localhost/', timeout=5)
        if response.status_code == 200:
            print("✅ Container frontend: OK")
            if 'Pokedex' in response.text:
                print("   Frontend content loaded correctly")
            else:
                print("   Warning: Frontend content may not be loading properly")
        else:
            print(f"❌ Container frontend: {response.status_code}")
            
        # Test API endpoints through container
        response = requests.get('http://localhost/api/v1/pokemon', timeout=5)
        if response.status_code == 200:
            print("✅ Container Pokemon API: OK")
            pokemon_data = response.json()
            print(f"   Pokemon count: {len(pokemon_data.get('pokemon', []))}")
        else:
            print(f"❌ Container Pokemon API: {response.status_code}")
            
        # Test Pokemon types through container
        response = requests.get('http://localhost/api/v1/pokemon/types', timeout=5)
        if response.status_code == 200:
            print("✅ Container types API: OK")
            types = response.json()
            print(f"   Available types: {len(types)}")
        else:
            print(f"❌ Container types API: {response.status_code}")
            
        # Test search through container
        response = requests.get('http://localhost/api/v1/pokemon?search=char', timeout=5)
        if response.status_code == 200:
            print("✅ Container search API: OK")
            search_data = response.json()
            print(f"   Search results: {len(search_data.get('pokemon', []))}")
        else:
            print(f"❌ Container search API: {response.status_code}")
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Container not running on port 80")
        return False
    except Exception as e:
        print(f"❌ Error testing containerized backend: {e}")
        return False

def test_backend_structure():
    """Test that the backend structure is correct"""
    print("\n🏗️  Testing Backend Structure...")
    
    # Check if backend directory exists
    backend_dir = os.path.join(project_root, 'backend')
    if not os.path.exists(backend_dir):
        print("❌ Backend directory not found")
        return False
    print("✅ Backend directory exists")
    
    # Check if services directory exists
    services_dir = os.path.join(backend_dir, 'services')
    if not os.path.exists(services_dir):
        print("❌ Services directory not found")
        return False
    print("✅ Services directory exists")
    
    # Check if utils directory exists
    utils_dir = os.path.join(backend_dir, 'utils')
    if not os.path.exists(utils_dir):
        print("❌ Utils directory not found")
        return False
    print("✅ Utils directory exists")
    
    # Check if models directory exists
    models_dir = os.path.join(backend_dir, 'models')
    if not os.path.exists(models_dir):
        print("❌ Models directory not found")
        return False
    print("✅ Models directory exists")
    
    # Check if routes directory exists
    routes_dir = os.path.join(backend_dir, 'routes')
    if not os.path.exists(routes_dir):
        print("❌ Routes directory not found")
        return False
    print("✅ Routes directory exists")
    
    # Check for key files
    key_files = [
        'backend/app.py',
        'backend/database.py',
        'backend/models/pokemon.py',
        'backend/models/user.py',
        'backend/routes/pokemon_routes.py',
        'backend/services/cache.py',
        'backend/utils/pokemon_seeder.py'
    ]
    
    for file_path in key_files:
        full_path = os.path.join(project_root, file_path)
        if os.path.exists(full_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} not found")
            return False
    
    return True

def test_imports():
    """Test that all imports work correctly"""
    print("\n📦 Testing Imports...")
    
    try:
        # Test backend imports
        from backend.app import app
        print("✅ Backend app import: OK")
        
        from backend.database import db
        print("✅ Backend database import: OK")
        
        from backend.models.pokemon import Pokemon
        print("✅ Pokemon model import: OK")
        
        from backend.models.user import User
        print("✅ User model import: OK")
        
        from backend.routes.pokemon_routes import PokemonList, PokemonDetail, PokemonTypes
        print("✅ Pokemon routes import: OK")
        
        from backend.services.cache import pokemon_cache
        print("✅ Cache service import: OK")
        
        from backend.services.security import hash_password
        print("✅ Security service import: OK")
        
        from backend.utils.pokemon_seeder import PokemonDataTransformer
        print("✅ Pokemon seeder import: OK")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error testing imports: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Backend Testing Suite")
    print("=" * 50)
    
    # Test backend structure
    structure_ok = test_backend_structure()
    
    # Test imports
    imports_ok = test_imports()
    
    # Test local backend (if running)
    local_ok = test_local_backend()
    
    # Test containerized backend (if running)
    container_ok = test_containerized_backend()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Backend Structure: {'✅ PASS' if structure_ok else '❌ FAIL'}")
    print(f"   Imports: {'✅ PASS' if imports_ok else '❌ FAIL'}")
    print(f"   Local Backend: {'✅ PASS' if local_ok else '❌ FAIL'}")
    print(f"   Container Backend: {'✅ PASS' if container_ok else '❌ FAIL'}")
    
    if structure_ok and imports_ok:
        print("\n🎉 Backend structure and imports are working correctly!")
        if local_ok or container_ok:
            print("🎉 At least one backend instance is running and responding!")
        else:
            print("⚠️  No backend instances are currently running")
            print("   To start local backend: export DATABASE_URL='sqlite:///$(pwd)/instance/pokedex_dev.db' && python3 -m backend.app")
            print("   To start containerized backend: docker-compose up --build")
    else:
        print("\n❌ Backend structure or imports have issues that need to be fixed")
    
    return structure_ok and imports_ok

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
