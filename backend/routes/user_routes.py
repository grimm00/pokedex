from flask_restful import Resource, reqparse, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.database import db
from backend.models.user import User, UserPokemon
from backend.models.pokemon import Pokemon

class UserList(Resource):
    """Handle GET /api/users and POST /api/users"""
    
    @jwt_required()
    def get(self):
        """Get all users with optional pagination (admin only)"""
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_admin:
            return {'message': 'Admin access required'}, 403
        
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, default=1, help='Page number')
        parser.add_argument('per_page', type=int, default=20, help='Items per page')
        args = parser.parse_args()
        
        # Apply pagination
        page = args['page']
        per_page = min(args['per_page'], 100)  # Limit max items per page
        
        users_paginated = User.query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return {
            'users': [user.to_dict() for user in users_paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users_paginated.total,
                'pages': users_paginated.pages,
                'has_next': users_paginated.has_next,
                'has_prev': users_paginated.has_prev
            }
        }
    
    def post(self):
        """Create a new user"""
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, required=True, help='Username is required')
        parser.add_argument('email', type=str, required=True, help='Email is required')
        args = parser.parse_args()
        
        # Check if username or email already exists
        existing_user = User.query.filter(
            (User.username == args['username']) | (User.email == args['email'])
        ).first()
        
        if existing_user:
            return {'message': 'Username or email already exists'}, 409
        
        # Create new user
        user = User(
            username=args['username'],
            email=args['email']
        )
        
        db.session.add(user)
        db.session.commit()
        
        return user.to_dict(), 201

class UserDetail(Resource):
    """Handle GET /api/users/<id>, PUT /api/users/<id>, DELETE /api/users/<id>"""
    
    @jwt_required()
    def get(self, user_id):
        """Get a specific user by ID (own data or admin)"""
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        user = User.query.get(user_id)
        
        if not user:
            abort(404, message=f'User with ID {user_id} not found')
        
        # Users can only see their own data, admins can see anyone
        if current_user_id != user_id and not current_user.is_admin:
            return {'message': 'Access denied'}, 403
        
        return user.to_dict()
    
    @jwt_required()
    def put(self, user_id):
        """Update a user (own data only)"""
        current_user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            abort(404, message=f'User with ID {user_id} not found')
        
        # Users can only update their own data
        if current_user_id != user_id:
            return {'message': 'Access denied'}, 403
        
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, help='Username')
        parser.add_argument('email', type=str, help='Email')
        args = parser.parse_args()
        
        # Check if new username or email already exists (excluding current user)
        if args['username'] and args['username'] != user.username:
            existing_user = User.query.filter(
                (User.username == args['username']) & (User.id != user_id)
            ).first()
            if existing_user:
                return {'message': 'Username already exists'}, 409
        
        if args['email'] and args['email'] != user.email:
            existing_user = User.query.filter(
                (User.email == args['email']) & (User.id != user_id)
            ).first()
            if existing_user:
                return {'message': 'Email already exists'}, 409
        
        # Update user data
        if args['username']:
            user.username = args['username']
        if args['email']:
            user.email = args['email']
        
        db.session.commit()
        
        return user.to_dict()
    
    @jwt_required()
    def delete(self, user_id):
        """Delete a user and their favorites (admin only)"""
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        user = User.query.get(user_id)
        
        if not user:
            abort(404, message=f'User with ID {user_id} not found')
        
        # Only admins can delete users
        if not current_user or not current_user.is_admin:
            return {'message': 'Admin access required'}, 403
        
        # Delete user's favorites first
        UserPokemon.query.filter_by(user_id=user_id).delete()
        
        # Delete user
        db.session.delete(user)
        db.session.commit()
        
        return {'message': 'User deleted successfully'}, 200

class UserFavorites(Resource):
    """Handle GET /api/users/<id>/favorites and POST /api/users/<id>/favorites"""
    
    @jwt_required()
    def get(self, user_id):
        """Get user's favorite Pokemon (own data only)"""
        current_user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            abort(404, message=f'User with ID {user_id} not found')
        
        # Users can only see their own favorites
        if current_user_id != user_id:
            return {'message': 'Access denied'}, 403
        
        favorites = UserPokemon.query.filter_by(user_id=user_id).all()
        
        return {
            'user_id': user_id,
            'favorites': [favorite.to_dict() for favorite in favorites]
        }
    
    @jwt_required()
    def post(self, user_id):
        """Add Pokemon to user's favorites (own data only)"""
        current_user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            abort(404, message=f'User with ID {user_id} not found')
        
        # Users can only modify their own favorites
        if current_user_id != user_id:
            return {'message': 'Access denied'}, 403
        
        parser = reqparse.RequestParser()
        parser.add_argument('pokemon_id', type=int, required=True, help='Pokemon ID is required')
        args = parser.parse_args()
        
        # Check if Pokemon exists
        pokemon = Pokemon.query.filter_by(pokemon_id=args['pokemon_id']).first()
        if not pokemon:
            return {'message': 'Pokemon not found'}, 404
        
        # Check if already favorited
        existing_favorite = UserPokemon.query.filter_by(
            user_id=user_id, 
            pokemon_id=args['pokemon_id']
        ).first()
        
        if existing_favorite:
            return {'message': 'Pokemon already in favorites'}, 409
        
        # Add to favorites
        favorite = UserPokemon(
            user_id=user_id,
            pokemon_id=args['pokemon_id']
        )
        
        db.session.add(favorite)
        db.session.commit()
        
        return favorite.to_dict(), 201
    
    @jwt_required()
    def delete(self, user_id):
        """Remove Pokemon from user's favorites (own data only)"""
        current_user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            abort(404, message=f'User with ID {user_id} not found')
        
        # Users can only modify their own favorites
        if current_user_id != user_id:
            return {'message': 'Access denied'}, 403
        
        parser = reqparse.RequestParser()
        parser.add_argument('pokemon_id', type=int, required=True, help='Pokemon ID is required')
        args = parser.parse_args()
        
        # Find and remove favorite
        favorite = UserPokemon.query.filter_by(
            user_id=user_id, 
            pokemon_id=args['pokemon_id']
        ).first()
        
        if not favorite:
            return {'message': 'Pokemon not in favorites'}, 404
        
        db.session.delete(favorite)
        db.session.commit()
        
        return {'message': 'Pokemon removed from favorites'}, 200
