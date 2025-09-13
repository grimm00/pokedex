# Pokemon Model Syntax Guide

## Overview
This document explains the `backend/models/pokemon.py` file, including the Pokemon model structure, JSON field usage, and data serialization for the PokeAPI integration.

## File Structure
```python
# Imports
from backend.app import db
from datetime import datetime, timezone

# Pokemon Model
class Pokemon(db.Model):
    # Table definition
    # Serialization method
    # String representation
```

## Imports Section (Lines 1-2)
```python
from backend.app import db
from datetime import datetime, timezone
```

**What each import does:**
- `db` - SQLAlchemy database instance from our Flask app
- `datetime, timezone` - For creating timezone-aware timestamps

## Pokemon Model (Lines 4-38)

### **Table Definition (Lines 5-18)**
```python
class Pokemon(db.Model):
    __tablename__ = 'pokemon'
    
    id = db.Column(db.Integer, primary_key=True)
    pokemon_id = db.Column(db.Integer, unique=True, nullable=False)  # PokeAPI ID
    name = db.Column(db.String(100), nullable=False)
    height = db.Column(db.Integer)  # in decimeters
    weight = db.Column(db.Integer)  # in hectograms
    base_experience = db.Column(db.Integer)
    types = db.Column(db.JSON)  # Store as JSON array
    abilities = db.Column(db.JSON)  # Store as JSON array
    stats = db.Column(db.JSON)  # Store as JSON object
    sprites = db.Column(db.JSON)  # Store as JSON object
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
```

**Field Explanations:**
- `id` - Primary key, auto-incrementing integer (our internal ID)
- `pokemon_id` - PokeAPI's ID (unique identifier from external API)
- `name` - Pokemon name (max 100 characters)
- `height` - Height in decimeters (PokeAPI unit)
- `weight` - Weight in hectograms (PokeAPI unit)
- `base_experience` - Base experience points
- `types` - Pokemon types stored as JSON array
- `abilities` - Pokemon abilities stored as JSON array
- `stats` - Base stats stored as JSON object
- `sprites` - Image URLs stored as JSON object
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last modified

**Key Concepts:**
- **Dual IDs**: `id` (internal) vs `pokemon_id` (PokeAPI)
- **JSON Fields**: Store complex data structures from PokeAPI
- **PokeAPI Units**: Height in decimeters, weight in hectograms
- **Timezone Awareness**: UTC timestamps for consistency

### **JSON Field Usage**

#### **Types Field (JSON Array)**
```python
# Example data from PokeAPI
types = [
    {"type": {"name": "electric"}},
    {"type": {"name": "flying"}}
]

# Stored in database as:
types = ["electric", "flying"]
```

#### **Abilities Field (JSON Array)**
```python
# Example data from PokeAPI
abilities = [
    {"ability": {"name": "static"}},
    {"ability": {"name": "lightning-rod"}}
]

# Stored in database as:
abilities = ["static", "lightning-rod"]
```

#### **Stats Field (JSON Object)**
```python
# Example data from PokeAPI
stats = [
    {"stat": {"name": "hp"}, "base_stat": 35},
    {"stat": {"name": "attack"}, "base_stat": 55},
    {"stat": {"name": "defense"}, "base_stat": 40}
]

# Stored in database as:
stats = {
    "hp": 35,
    "attack": 55,
    "defense": 40,
    "special-attack": 50,
    "special-defense": 50,
    "speed": 90
}
```

#### **Sprites Field (JSON Object)**
```python
# Example data from PokeAPI
sprites = {
    "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    "back_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png",
    "front_shiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png"
}
```

### **Serialization Method (Lines 20-34)**
```python
def to_dict(self):
    return {
        'id': self.id,
        'pokemon_id': self.pokemon_id,
        'name': self.name,
        'height': self.height,
        'weight': self.weight,
        'base_experience': self.base_experience,
        'types': self.types,
        'abilities': self.abilities,
        'stats': self.stats,
        'sprites': self.sprites,
        'created_at': self.created_at.isoformat() if self.created_at else None,
        'updated_at': self.updated_at.isoformat() if self.updated_at else None
    }
```

**What this does:**
- **Complete Data**: Returns all Pokemon data for API responses
- **JSON Ready**: Converts datetime objects to ISO format strings
- **Null Safety**: Handles None values gracefully
- **API Format**: Ready for JSON serialization

**Example Output:**
```json
{
    "id": 1,
    "pokemon_id": 25,
    "name": "pikachu",
    "height": 4,
    "weight": 60,
    "base_experience": 112,
    "types": ["electric"],
    "abilities": ["static", "lightning-rod"],
    "stats": {
        "hp": 35,
        "attack": 55,
        "defense": 40,
        "special-attack": 50,
        "special-defense": 50,
        "speed": 90
    },
    "sprites": {
        "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
}
```

### **String Representation (Lines 36-37)**
```python
def __repr__(self):
    return f'<Pokemon {self.name} (ID: {self.pokemon_id})>'
```

**Purpose**: Provides readable string representation for debugging
**Example**: `<Pokemon pikachu (ID: 25)>` instead of `<Pokemon object at 0x...>`

## PokeAPI Integration

### **Data Transformation Process**
```python
# PokeAPI Response → Our Database Format
pokeapi_data = {
    "id": 25,
    "name": "pikachu",
    "height": 4,
    "weight": 60,
    "base_experience": 112,
    "types": [{"type": {"name": "electric"}}],
    "abilities": [{"ability": {"name": "static"}}],
    "stats": [{"stat": {"name": "hp"}, "base_stat": 35}],
    "sprites": {"front_default": "https://..."}
}

# Transform to our format
pokemon = Pokemon(
    pokemon_id=pokeapi_data['id'],
    name=pokeapi_data['name'],
    height=pokeapi_data['height'],
    weight=pokeapi_data['weight'],
    base_experience=pokeapi_data['base_experience'],
    types=[type_info['type']['name'] for type_info in pokeapi_data['types']],
    abilities=[ability['ability']['name'] for ability in pokeapi_data['abilities']],
    stats={stat['stat']['name']: stat['base_stat'] for stat in pokeapi_data['stats']},
    sprites=pokeapi_data['sprites']
)
```

### **Data Storage Strategy**
- **Flattened Structure**: Convert nested PokeAPI data to flat JSON
- **Efficient Queries**: JSON fields allow for flexible querying
- **API Compatibility**: Maintains PokeAPI data structure
- **Performance**: Single table with JSON fields vs multiple related tables

## Database Queries

### **Basic Queries**
```python
# Get all Pokemon
pokemon_list = Pokemon.query.all()

# Get Pokemon by PokeAPI ID
pikachu = Pokemon.query.filter_by(pokemon_id=25).first()

# Get Pokemon by name
pikachu = Pokemon.query.filter_by(name='pikachu').first()

# Search Pokemon by name
electric_pokemon = Pokemon.query.filter(Pokemon.name.like('%pika%')).all()
```

### **JSON Field Queries**
```python
# Find Pokemon by type (PostgreSQL JSON query)
electric_pokemon = Pokemon.query.filter(Pokemon.types.contains(['electric'])).all()

# Find Pokemon by ability
static_pokemon = Pokemon.query.filter(Pokemon.abilities.contains(['static'])).all()

# Find Pokemon by stat range
strong_pokemon = Pokemon.query.filter(
    Pokemon.stats['attack'].astext.cast(Integer) > 100
).all()
```

### **Pagination and Ordering**
```python
# Paginated results
pokemon_page = Pokemon.query.paginate(
    page=1, 
    per_page=20, 
    error_out=False
)

# Ordered results
pokemon_by_name = Pokemon.query.order_by(Pokemon.name).all()
pokemon_by_id = Pokemon.query.order_by(Pokemon.pokemon_id).all()
```

## Usage Examples

### **Creating Pokemon from PokeAPI**
```python
# Fetch from PokeAPI
import requests
response = requests.get('https://pokeapi.co/api/v2/pokemon/25')
pokeapi_data = response.json()

# Create Pokemon record
pokemon = Pokemon(
    pokemon_id=pokeapi_data['id'],
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
```

### **API Response Generation**
```python
# Get Pokemon for API response
pokemon = Pokemon.query.filter_by(pokemon_id=25).first()
if pokemon:
    return pokemon.to_dict()
else:
    return {'error': 'Pokemon not found'}, 404
```

### **Data Validation**
```python
# Check if Pokemon exists
existing = Pokemon.query.filter_by(pokemon_id=25).first()
if existing:
    print("Pokemon already exists")
else:
    print("Pokemon not found, can create new one")
```

## Key Learning Points

### **Database Design**
- **Dual IDs**: Internal vs external API identifiers
- **JSON Fields**: Storing complex, variable data structures
- **Data Transformation**: Converting external API format to internal format
- **Flexible Schema**: JSON fields allow for evolving data structures

### **PokeAPI Integration**
- **Data Mapping**: Converting nested PokeAPI data to flat structure
- **Unit Conversion**: Understanding PokeAPI units (decimeters, hectograms)
- **Data Preservation**: Maintaining original data while optimizing for queries
- **API Compatibility**: Keeping data compatible with PokeAPI structure

### **SQLAlchemy Concepts**
- **JSON Columns**: Storing and querying JSON data
- **Data Serialization**: Converting objects to API-ready format
- **Relationship Management**: Linking to other models (UserPokemon)
- **Query Optimization**: Efficient database queries with JSON fields

This Pokemon model provides a flexible, efficient way to store and manage Pokemon data from the PokeAPI while maintaining compatibility with our API structure.
