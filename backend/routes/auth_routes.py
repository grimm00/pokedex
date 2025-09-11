from flask_restful import Resource, reqparse, abort
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from backend.database import db
from backend.models.user import User
from datetime import datetime, timezone, timedelta

class AuthRegister(Resource):
    """Handle POST /api/v1/auth/register"""
    
    def post(self):
        """Register a new user"""
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, required=True, help='Username is required')
        parser.add_argument('email', type=str, required=True, help='Email is required')
        parser.add_argument('password', type=str, required=True, help='Password is required')
        args = parser.parse_args()
        
        # Validate password strength
        if len(args['password']) < 6:
            return {'message': 'Password must be at least 6 characters long'}, 400
        
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
        user.set_password(args['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 201

class AuthLogin(Resource):
    """Handle POST /api/v1/auth/login"""
    
    def post(self):
        """Login user and return tokens"""
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, required=True, help='Username is required')
        parser.add_argument('password', type=str, required=True, help='Password is required')
        args = parser.parse_args()
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == args['username']) | (User.email == args['username'])
        ).first()
        
        if not user or not user.check_password(args['password']):
            return {'message': 'Invalid username or password'}, 401
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 200

class AuthRefresh(Resource):
    """Handle POST /api/v1/auth/refresh"""
    
    @jwt_required(refresh=True)
    def post(self):
        """Refresh access token using refresh token"""
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return {'message': 'User not found'}, 404
        
        # Create new access token
        access_token = create_access_token(identity=current_user_id)
        
        return {
            'access_token': access_token
        }, 200

class AuthLogout(Resource):
    """Handle POST /api/v1/auth/logout"""
    
    @jwt_required()
    def post(self):
        """Logout user (in a real app, you'd blacklist the token)"""
        # In a production app, you'd add the token to a blacklist
        # For now, we'll just return a success message
        return {'message': 'Logout successful'}, 200

class AuthProfile(Resource):
    """Handle GET /api/v1/auth/profile"""
    
    @jwt_required()
    def get(self):
        """Get current user's profile"""
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return {'message': 'User not found'}, 404
        
        return user.to_dict(), 200
    
    @jwt_required()
    def put(self):
        """Update current user's profile"""
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return {'message': 'User not found'}, 404
        
        parser = reqparse.RequestParser()
        parser.add_argument('username', type=str, help='Username')
        parser.add_argument('email', type=str, help='Email')
        parser.add_argument('password', type=str, help='New password')
        args = parser.parse_args()
        
        # Check if new username or email already exists (excluding current user)
        if args['username'] and args['username'] != user.username:
            existing_user = User.query.filter(
                (User.username == args['username']) & (User.id != current_user_id)
            ).first()
            if existing_user:
                return {'message': 'Username already exists'}, 409
        
        if args['email'] and args['email'] != user.email:
            existing_user = User.query.filter(
                (User.email == args['email']) & (User.id != current_user_id)
            ).first()
            if existing_user:
                return {'message': 'Email already exists'}, 409
        
        # Update user data
        if args['username']:
            user.username = args['username']
        if args['email']:
            user.email = args['email']
        if args['password']:
            if len(args['password']) < 6:
                return {'message': 'Password must be at least 6 characters long'}, 400
            user.set_password(args['password'])
        
        db.session.commit()
        
        return user.to_dict(), 200

