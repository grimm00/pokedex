from flask_restful import Resource, reqparse, abort
from backend.app import db
from backend.models.pokemon import Pokemon
import requests
import os

class PokemonList(Resource):
    """Handle GET /api/pokemon and POST /api/pokemon"""
    
    def get(self):
        """Get all Pokemon with optional pagination and search"""
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, default=1, help='Page number')
        parser.add_argument('per_page', type=int, default=20, help='Items per page')
        parser.add_argument('search', type=str, help='Search by name')
        parser.add_argument('type', type=str, help='Filter by Pokemon type')
        args = parser.parse_args()
        
        # Build query
        query = Pokemon.query
        
        # Apply search filter
        if args['search']:
            query = query.filter(Pokemon.name.ilike(f"%{args['search']}%"))
        
        # Apply type filter (would need to implement JSON querying)
        if args['type']:
            query = query.filter(Pokemon.types.contains([args['type']]))
        
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
    
    def post(self):
        """Create a new Pokemon from PokeAPI data"""
        parser = reqparse.RequestParser()
        parser.add_argument('pokemon_id', type=int, required=True, help='PokeAPI Pokemon ID')
        args = parser.parse_args()
        
        # Check if Pokemon already exists
        existing_pokemon = Pokemon.query.filter_by(pokemon_id=args['pokemon_id']).first()
        if existing_pokemon:
            return {'message': 'Pokemon already exists'}, 409
        
        # Fetch data from PokeAPI
        pokeapi_url = f"{os.environ.get('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2')}/pokemon/{args['pokemon_id']}"
        
        try:
            response = requests.get(pokeapi_url)
            response.raise_for_status()
            pokeapi_data = response.json()
        except requests.RequestException as e:
            return {'message': f'Failed to fetch Pokemon data: {str(e)}'}, 400
        
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

class PokemonDetail(Resource):
    """Handle GET /api/pokemon/<id>, PUT /api/pokemon/<id>, DELETE /api/pokemon/<id>"""
    
    def get(self, pokemon_id):
        """Get a specific Pokemon by PokeAPI ID"""
        pokemon = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
        if not pokemon:
            abort(404, message=f'Pokemon with ID {pokemon_id} not found')
        
        return pokemon.to_dict()
    
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
    
    def delete(self, pokemon_id):
        """Delete a Pokemon"""
        pokemon = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
        if not pokemon:
            abort(404, message=f'Pokemon with ID {pokemon_id} not found')
        
        db.session.delete(pokemon)
        db.session.commit()
        
        return {'message': 'Pokemon deleted successfully'}, 200
