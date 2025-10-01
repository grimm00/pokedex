from flask_restful import Resource, reqparse, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.database import db
from backend.models.pokemon import Pokemon
from backend.models.user import UserPokemon
from backend.services.cache import pokemon_cache, cache_manager
import requests
import os

class PokemonList(Resource):
    """Handle GET /api/pokemon and POST /api/pokemon"""
    
    @jwt_required(optional=True)
    def get(self):
        """Get all Pokemon with optional pagination and search (with caching)"""
        from flask import request
        # Use request.args for GET parameters instead of reqparse
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', type=str)
        pokemon_type = request.args.get('type', type=str)
        sort_by = request.args.get('sort', type=str)
        
        # Create cache parameters
        # For favorites sorting, we need to include user ID in cache key
        # since favorites are user-specific
        if sort_by == 'favorites':
            from flask_jwt_extended import get_jwt_identity
            try:
                user_id = get_jwt_identity()
                cache_params = {
                    'page': page,
                    'per_page': per_page,
                    'search': search,
                    'type': pokemon_type,
                    'sort': sort_by,
                    'user_id': user_id  # Include user ID for favorites sorting
                }
            except Exception:
                # If JWT fails, use default cache key
                cache_params = {
                    'page': page,
                    'per_page': per_page,
                    'search': search,
                    'type': pokemon_type,
                    'sort': sort_by
                }
        else:
            cache_params = {
                'page': page,
                'per_page': per_page,
                'search': search,
                'type': pokemon_type,
                'sort': sort_by
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
        
        # Apply type filter for JSON array
        if pokemon_type:
            # For SQLite JSON, use JSON_EXTRACT to check if the type exists in the array
            # This will work for both single-type and multi-type Pokemon
            query = query.filter(
                db.func.json_extract(Pokemon.types, '$').op('LIKE')(f'%"{pokemon_type}"%')
            )
        
        # Apply sorting
        if sort_by:
            if sort_by == 'name':
                query = query.order_by(Pokemon.name.asc())
            elif sort_by == 'name_desc':
                query = query.order_by(Pokemon.name.desc())
            elif sort_by == 'height':
                query = query.order_by(Pokemon.height.asc())
            elif sort_by == 'height_desc':
                query = query.order_by(Pokemon.height.desc())
            elif sort_by == 'weight':
                query = query.order_by(Pokemon.weight.asc())
            elif sort_by == 'weight_desc':
                query = query.order_by(Pokemon.weight.desc())
            elif sort_by == 'id':
                query = query.order_by(Pokemon.pokemon_id.asc())
            elif sort_by == 'id_desc':
                query = query.order_by(Pokemon.pokemon_id.desc())
            elif sort_by == 'favorites':
                # Get user ID from JWT token for favorites sorting
                from flask_jwt_extended import get_jwt_identity
                try:
                    user_id = get_jwt_identity()
                    if user_id:
                        # Favorites sorting will be handled in the pagination section
                        pass
                    else:
                        # If no user ID, fall back to default sorting
                        query = query.order_by(Pokemon.pokemon_id.asc())
                except Exception:
                    # If JWT verification fails, fall back to default sorting
                    query = query.order_by(Pokemon.pokemon_id.asc())
            else:
                # Default to name ascending if invalid sort option
                query = query.order_by(Pokemon.name.asc())
        else:
            # Default sorting by Pokemon ID
            query = query.order_by(Pokemon.pokemon_id.asc())
        
        # Apply pagination
        per_page = min(per_page, 100)  # Limit max items per page for performance
        
        # Special handling for favorites sorting - manual sort after fetch
        if sort_by == 'favorites':
            # Get all Pokemon first
            all_pokemon = query.all()
            
            # Get user favorites from JWT token
            from flask_jwt_extended import get_jwt_identity
            try:
                user_id = get_jwt_identity()
                print(f"DEBUG: JWT user_id: {user_id}")
                if user_id:
                    favorited_ids = db.session.query(UserPokemon.pokemon_id).filter(
                        UserPokemon.user_id == user_id
                    ).all()
                    favorited_pokemon_ids = [row[0] for row in favorited_ids]
                    print(f"DEBUG: Found {len(favorited_pokemon_ids)} favorites: {favorited_pokemon_ids}")
                else:
                    # No user ID, use default sorting
                    print("DEBUG: No user ID, using default sorting")
                    favorited_pokemon_ids = []
            except Exception as e:
                # JWT verification failed, use default sorting
                print(f"DEBUG: JWT verification failed: {e}")
                favorited_pokemon_ids = []
            
            if favorited_pokemon_ids:
                # Sort manually: favorites first, then others
                favorites = [p for p in all_pokemon if p.pokemon_id in favorited_pokemon_ids]
                non_favorites = [p for p in all_pokemon if p.pokemon_id not in favorited_pokemon_ids]
                
                # Sort each group by pokemon_id
                favorites.sort(key=lambda x: x.pokemon_id)
                non_favorites.sort(key=lambda x: x.pokemon_id)
                
                # Combine: favorites first, then others
                sorted_pokemon = favorites + non_favorites
                
                # Apply pagination manually
                start_idx = (page - 1) * per_page
                end_idx = start_idx + per_page
                paginated_items = sorted_pokemon[start_idx:end_idx]
                
                result = {
                    'pokemon': [pokemon.to_dict() for pokemon in paginated_items],
                    'pagination': {
                        'page': page,
                        'per_page': per_page,
                        'total': len(sorted_pokemon),
                        'pages': (len(sorted_pokemon) + per_page - 1) // per_page,
                        'has_next': end_idx < len(sorted_pokemon),
                        'has_prev': page > 1
                    }
                }
            else:
                # No favorites, use normal pagination
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
        else:
            # Normal pagination for other sorts
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

class PokemonTypes(Resource):
    """Handle GET /api/v1/pokemon/types - Get all available Pokemon types"""
    
    def get(self):
        """Get all unique Pokemon types from the database"""
        from backend.database import db
        
        # Query all Pokemon and extract unique types
        pokemon_list = Pokemon.query.all()
        all_types = set()
        
        for pokemon in pokemon_list:
            if pokemon.types:
                all_types.update(pokemon.types)
        
        # Convert to sorted list
        types_list = sorted(list(all_types))
        
        return types_list
