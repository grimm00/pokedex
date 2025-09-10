# Pokemon Routes Syntax Guide

## Overview
This document explains the `backend/routes/pokemon_routes.py` file, including Pokemon CRUD operations, PokeAPI integration, search functionality, and pagination.

## File Structure
```python
# Imports
from flask_restful import Resource, reqparse, abort
from backend.app import db
from backend.models.pokemon import Pokemon
import requests
import os

# Pokemon Resource Classes
class PokemonList(Resource):     # List and create Pokemon
class PokemonDetail(Resource):   # Individual Pokemon management
```

## Imports Section (Lines 1-5)

### **Flask-RESTful Imports**
```python
from flask_restful import Resource, reqparse, abort
```
- **Resource**: Base class for API endpoints
- **reqparse**: Request argument parsing and validation
- **abort**: Clean error handling with HTTP status codes

### **Database and Model Imports**
```python
from backend.app import db
from backend.models.pokemon import Pokemon
```
- **db**: SQLAlchemy database instance
- **Pokemon**: Pokemon model for database operations

### **External API Imports**
```python
import requests
import os
```
- **requests**: HTTP client for PokeAPI integration
- **os**: Environment variable access for API configuration

## PokemonList Class (Lines 7-75)

### **Class Definition and Methods**
```python
class PokemonList(Resource):
    """Handle GET /api/pokemon and POST /api/pokemon"""
    
    def get(self):
        """Get all Pokemon with optional pagination and search"""
    
    def post(self):
        """Create a new Pokemon from PokeAPI data"""
```

**Purpose**: Manages Pokemon listing and creation from external API

### **Get Pokemon Method (Lines 11-45)**
```python
def get(self):
    """Get all Pokemon with optional pagination and search"""
    parser = reqparse.RequestParser()
    parser.add_argument('page', type=int, default=1, help='Page number')
    parser.add_argument('per_page', type=int, default=20, help='Items per page')
    parser.add_argument('search', type=str, help='Search by name')
    parser.add_argument('type', type=str, help='Filter by Pokemon type')
    args = parser.parse_args()
```

**Query Parameters:**
- **page**: Page number for pagination (default: 1)
- **per_page**: Items per page (default: 20)
- **search**: Search Pokemon by name
- **type**: Filter by Pokemon type

#### **Query Building (Lines 17-25)**
```python
# Build query
query = Pokemon.query

# Apply search filter
if args['search']:
    query = query.filter(Pokemon.name.ilike(f"%{args['search']}%"))

# Apply type filter (would need to implement JSON querying)
if args['type']:
    query = query.filter(Pokemon.types.contains([args['type']]))
```

**Filtering Features:**
- **Search**: Case-insensitive name search using `ilike`
- **Type Filter**: JSON field querying for Pokemon types
- **Flexible**: Builds query dynamically based on provided filters

#### **Pagination Implementation (Lines 27-45)**
```python
# Apply pagination
page = args['page']
per_page = min(args['per_page'], 100)  # Limit max items per page

pokemon_paginated = query.paginate(
    page=page, 
    per_page=per_page, 
    error_out=False
)

return {
    'pokemon': [pokemon.to_dict() for pokemon in pokemon_paginated.items],
    'pagination': {
        'page': page,
        'per_page': per_page,
        'total': pokemon_paginated.total,
        'pages': pokemon_paginated.pages,
        'has_next': pokemon_paginated.has_next,
        'has_prev': pokemon_paginated.has_prev
    }
}
```

**Pagination Features:**
- **Max Limit**: Caps at 100 items per page for performance
- **Error Handling**: `error_out=False` prevents crashes on invalid pages
- **Complete Metadata**: Returns pagination information
- **Serialization**: Converts Pokemon objects to dictionary format

### **Create Pokemon Method (Lines 47-75)**
```python
def post(self):
    """Create a new Pokemon from PokeAPI data"""
    parser = reqparse.RequestParser()
    parser.add_argument('pokemon_id', type=int, required=True, help='PokeAPI Pokemon ID')
    args = parser.parse_args()
```

**Purpose**: Fetches Pokemon data from PokeAPI and stores in database

#### **Duplicate Check (Lines 52-55)**
```python
# Check if Pokemon already exists
existing_pokemon = Pokemon.query.filter_by(pokemon_id=args['pokemon_id']).first()
if existing_pokemon:
    return {'message': 'Pokemon already exists'}, 409
```

**Prevents Duplicates**: Checks if Pokemon already exists in database

#### **PokeAPI Integration (Lines 57-65)**
```python
# Fetch data from PokeAPI
pokeapi_url = f"{os.environ.get('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2')}/pokemon/{args['pokemon_id']}"

try:
    response = requests.get(pokeapi_url)
    response.raise_for_status()
    pokeapi_data = response.json()
except requests.RequestException as e:
    return {'message': f'Failed to fetch Pokemon data: {str(e)}'}, 400
```

**External API Features:**
- **Configurable URL**: Uses environment variable for API base URL
- **Error Handling**: Catches HTTP errors and network issues
- **Status Validation**: `raise_for_status()` throws exception for HTTP errors
- **JSON Parsing**: Converts response to Python dictionary

#### **Data Transformation (Lines 67-75)**
```python
# Create Pokemon from PokeAPI data
pokemon = Pokemon(
    pokemon_id=args['pokemon_id'],
    name=pokeapi_data['name'],
    height=pokeapi_data['height'],
    weight=pokeapi_data['weight'],
    base_experience=pokeapi_data.get('base_experience'),
    types=[type_info['type']['name'] for type_info in pokeapi_data['types']],
    abilities=[ability['ability']['name'] for ability in pokeapi_data['abilities']],
    stats={stat['stat']['name']: stat['base_stat'] for stat in pokeapi_data['stats']},
    sprites=pokeapi_data['sprites']
)

db.session.add(pokemon)
db.session.commit()

return pokemon.to_dict(), 201
```

**Data Transformation Process:**
1. **Direct Mapping**: Simple fields (id, name, height, weight)
2. **Safe Access**: `get()` method for optional fields
3. **List Comprehension**: Extract names from nested structures
4. **Dictionary Comprehension**: Transform stats array to object
5. **Database Save**: Add and commit to database
6. **Response**: Return created Pokemon data

## PokemonDetail Class (Lines 77-140)

### **Class Definition and Methods**
```python
class PokemonDetail(Resource):
    """Handle GET /api/pokemon/<id>, PUT /api/pokemon/<id>, DELETE /api/pokemon/<id>"""
    
    def get(self, pokemon_id):
        """Get a specific Pokemon by PokeAPI ID"""
    
    def put(self, pokemon_id):
        """Update a Pokemon (fetch fresh data from PokeAPI)"""
    
    def delete(self, pokemon_id):
        """Delete a Pokemon"""
```

**Purpose**: Individual Pokemon management operations

### **Get Pokemon Method (Lines 83-89)**
```python
def get(self, pokemon_id):
    """Get a specific Pokemon by PokeAPI ID"""
    pokemon = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
    if not pokemon:
        abort(404, message=f'Pokemon with ID {pokemon_id} not found')
    
    return pokemon.to_dict()
```

**Features:**
- **PokeAPI ID**: Uses external API ID, not internal database ID
- **Not Found**: Returns 404 if Pokemon doesn't exist
- **Serialization**: Returns Pokemon data as dictionary

### **Update Pokemon Method (Lines 91-115)**
```python
def put(self, pokemon_id):
    """Update a Pokemon (fetch fresh data from PokeAPI)"""
    pokemon = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
    if not pokemon:
        abort(404, message=f'Pokemon with ID {pokemon_id} not found')
    
    # Fetch fresh data from PokeAPI
    pokeapi_url = f"{os.environ.get('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2')}/pokemon/{pokemon_id}"
    
    try:
        response = requests.get(pokeapi_url)
        response.raise_for_status()
        pokeapi_data = response.json()
    except requests.RequestException as e:
        return {'message': f'Failed to fetch Pokemon data: {str(e)}'}, 400
```

**Purpose**: Updates Pokemon with fresh data from PokeAPI

#### **Data Update (Lines 105-115)**
```python
# Update Pokemon data
pokemon.name = pokeapi_data['name']
pokemon.height = pokeapi_data['height']
pokemon.weight = pokeapi_data['weight']
pokemon.base_experience = pokeapi_data.get('base_experience')
pokemon.types = [type_info['type']['name'] for type_info in pokeapi_data['types']]
pokemon.abilities = [ability['ability']['name'] for ability in pokeapi_data['abilities']]
pokemon.stats = {stat['stat']['name']: stat['base_stat'] for stat in pokeapi_data['stats']}
pokemon.sprites = pokeapi_data['sprites']

db.session.commit()

return pokemon.to_dict()
```

**Update Process:**
1. **Fresh Data**: Fetches latest data from PokeAPI
2. **Field Updates**: Updates all Pokemon fields
3. **Data Transformation**: Same process as creation
4. **Database Save**: Commits changes to database
5. **Response**: Returns updated Pokemon data

### **Delete Pokemon Method (Lines 117-125)**
```python
def delete(self, pokemon_id):
    """Delete a Pokemon"""
    pokemon = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
    if not pokemon:
        abort(404, message=f'Pokemon with ID {pokemon_id} not found')
    
    db.session.delete(pokemon)
    db.session.commit()
    
    return {'message': 'Pokemon deleted successfully'}, 200
```

**Features:**
- **Existence Check**: Verifies Pokemon exists before deletion
- **Database Delete**: Removes Pokemon from database
- **Success Response**: Confirms deletion

## PokeAPI Integration

### **API Configuration**
```python
# Environment variable for API base URL
pokeapi_url = f"{os.environ.get('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2')}/pokemon/{pokemon_id}"
```

**Configuration:**
- **Environment Variable**: `POKEAPI_BASE_URL` in .env file
- **Default URL**: Falls back to official PokeAPI URL
- **Flexibility**: Can be changed for testing or different APIs

### **Data Transformation Examples**

#### **Types Transformation**
```python
# PokeAPI Format
pokeapi_types = [
    {"type": {"name": "electric"}},
    {"type": {"name": "flying"}}
]

# Our Format
types = ["electric", "flying"]
```

#### **Abilities Transformation**
```python
# PokeAPI Format
pokeapi_abilities = [
    {"ability": {"name": "static"}},
    {"ability": {"name": "lightning-rod"}}
]

# Our Format
abilities = ["static", "lightning-rod"]
```

#### **Stats Transformation**
```python
# PokeAPI Format
pokeapi_stats = [
    {"stat": {"name": "hp"}, "base_stat": 35},
    {"stat": {"name": "attack"}, "base_stat": 55}
]

# Our Format
stats = {
    "hp": 35,
    "attack": 55,
    "defense": 40,
    "special-attack": 50,
    "special-defense": 50,
    "speed": 90
}
```

## Error Handling

### **HTTP Errors**
```python
try:
    response = requests.get(pokeapi_url)
    response.raise_for_status()
    pokeapi_data = response.json()
except requests.RequestException as e:
    return {'message': f'Failed to fetch Pokemon data: {str(e)}'}, 400
```

**Error Types:**
- **Network Errors**: Connection timeouts, DNS failures
- **HTTP Errors**: 404 Not Found, 500 Server Error
- **JSON Errors**: Invalid response format
- **Response**: 400 Bad Request with error message

### **Database Errors**
```python
if not pokemon:
    abort(404, message=f'Pokemon with ID {pokemon_id} not found')
```

**Error Types:**
- **Not Found**: Pokemon doesn't exist in database
- **Duplicate**: Pokemon already exists
- **Response**: Appropriate HTTP status codes

## Usage Examples

### **Get All Pokemon**
```bash
curl http://localhost:5000/api/v1/pokemon
```

### **Search Pokemon**
```bash
curl "http://localhost:5000/api/v1/pokemon?search=pikachu"
```

### **Filter by Type**
```bash
curl "http://localhost:5000/api/v1/pokemon?type=electric"
```

### **Pagination**
```bash
curl "http://localhost:5000/api/v1/pokemon?page=2&per_page=10"
```

### **Get Specific Pokemon**
```bash
curl http://localhost:5000/api/v1/pokemon/25
```

### **Create Pokemon from PokeAPI**
```bash
curl -X POST http://localhost:5000/api/v1/pokemon \
  -H "Content-Type: application/json" \
  -d '{"pokemon_id": 25}'
```

### **Update Pokemon**
```bash
curl -X PUT http://localhost:5000/api/v1/pokemon/25
```

### **Delete Pokemon**
```bash
curl -X DELETE http://localhost:5000/api/v1/pokemon/25
```

## Key Learning Points

### **External API Integration**
- **HTTP Requests**: Using requests library for API calls
- **Error Handling**: Proper exception handling for network issues
- **Data Transformation**: Converting external API format to internal format
- **Configuration**: Environment variables for API URLs

### **Database Operations**
- **CRUD Operations**: Create, Read, Update, Delete
- **Query Building**: Dynamic query construction with filters
- **Pagination**: Efficient data retrieval with pagination
- **Data Validation**: Checking for duplicates and existence

### **API Design**
- **RESTful Endpoints**: Following REST conventions
- **Query Parameters**: Flexible filtering and pagination
- **Error Responses**: Consistent error handling
- **Data Serialization**: Converting objects to JSON format

This Pokemon routes system provides comprehensive Pokemon management with external API integration, search functionality, and efficient data handling.

