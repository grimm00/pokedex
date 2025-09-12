from flask_restful import Resource, reqparse, abort
from backend.database import db
from backend.models.pokemon import Pokemon
from backend.cache import pokemon_cache, cache_manager
import requests
import os

class PokemonList(Resource):
    """Handle GET /api/pokemon and POST /api/pokemon"""
    
    def get(self):
        """Get all Pokemon with optional pagination and search (with caching)"""
        from flask import request
        # Use request.args for GET parameters instead of reqparse
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', type=str)
        pokemon_type = request.args.get('type', type=str)
        
        # Create cache parameters
        cache_params = {
            'page': page,
            'per_page': per_page,
            'search': search,
            'type': pokemon_type
        }
        
        # Check cache first
        cached_result = pokemon_cache.get_pokemon_list(cache_params)
        if cached_result:
            return cached_result
        
        # Build query
        query = Pokemon.query
        
        # Apply search filter
        if search:
            query = query.filter(Pokemon.name.ilike(f"%{search}%"))
        
        # Apply type filter (would need to implement JSON querying)
        if pokemon_type:
            query = query.filter(Pokemon.types.contains([pokemon_type]))
        
        # Apply pagination
        per_page = min(per_page, 100)  # Limit max items per page
        
        pokemon_paginated = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        result = {
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
        
        # Cache the result for 5 minutes
        pokemon_cache.cache_pokemon_list(cache_params, result, ttl=300)
        
        return result
    
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
        """Get a specific Pokemon by PokeAPI ID (with caching)"""
        # Check cache first
        cached_pokemon = pokemon_cache.get_pokemon(pokemon_id)
        if cached_pokemon:
            return cached_pokemon
        
        pokemon = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
        if not pokemon:
            abort(404, message=f'Pokemon with ID {pokemon_id} not found')
        
        result = pokemon.to_dict()
        
        # Cache the result for 1 hour
        pokemon_cache.cache_pokemon(pokemon_id, result, ttl=3600)
        
        return result
    
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
