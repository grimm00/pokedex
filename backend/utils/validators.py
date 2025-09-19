"""
Data validation utilities for API responses and data consistency
"""
from typing import Dict, List, Any, Optional
from flask import current_app
import logging

logger = logging.getLogger(__name__)

class DataValidator:
    """Centralized data validation for API responses"""
    
    @staticmethod
    def validate_pokemon_data(pokemon: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Pokemon data structure and required fields"""
        required_fields = [
            'id', 'pokemon_id', 'name', 'height', 'weight', 
            'types', 'abilities', 'stats', 'sprites'
        ]
        
        missing_fields = [field for field in required_fields if field not in pokemon]
        if missing_fields:
            logger.warning(f"Pokemon data missing required fields: {missing_fields}")
            return {'valid': False, 'missing_fields': missing_fields}
        
        # Validate data types
        type_validations = {
            'id': int,
            'pokemon_id': int,
            'name': str,
            'height': int,
            'weight': int,
            'types': list,  # Array of strings
            'abilities': list,  # Array of strings
            'stats': dict,
            'sprites': dict
        }
        
        type_errors = []
        for field, expected_type in type_validations.items():
            if field in pokemon and not isinstance(pokemon[field], expected_type):
                type_errors.append(f"{field} should be {expected_type.__name__}, got {type(pokemon[field]).__name__}")
        
        if type_errors:
            logger.warning(f"Pokemon data type errors: {type_errors}")
            return {'valid': False, 'type_errors': type_errors}
        
        return {'valid': True, 'data': pokemon}
    
    @staticmethod
    def validate_favorites_response(response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate favorites API response structure"""
        required_fields = ['user_id', 'favorites']
        missing_fields = [field for field in required_fields if field not in response]
        
        if missing_fields:
            logger.error(f"Favorites response missing required fields: {missing_fields}")
            return {'valid': False, 'missing_fields': missing_fields}
        
        if not isinstance(response['favorites'], list):
            logger.error(f"Favorites should be a list, got {type(response['favorites']).__name__}")
            return {'valid': False, 'error': 'favorites must be a list'}
        
        # Validate each favorite item
        for i, favorite in enumerate(response['favorites']):
            if not isinstance(favorite, dict):
                logger.error(f"Favorite item {i} should be a dict, got {type(favorite).__name__}")
                return {'valid': False, 'error': f'favorite item {i} must be a dict'}
            
            # Check for required favorite fields
            required_favorite_fields = ['id', 'user_id', 'pokemon_id', 'created_at']
            missing_favorite_fields = [field for field in required_favorite_fields if field not in favorite]
            
            if missing_favorite_fields:
                logger.error(f"Favorite item {i} missing required fields: {missing_favorite_fields}")
                return {'valid': False, 'error': f'favorite item {i} missing fields: {missing_favorite_fields}'}
            
            # Check if pokemon data is included
            if 'pokemon' not in favorite:
                logger.warning(f"Favorite item {i} missing pokemon data")
                return {'valid': False, 'error': f'favorite item {i} missing pokemon data'}
            
            # Validate pokemon data if present
            pokemon_validation = DataValidator.validate_pokemon_data(favorite['pokemon'])
            if not pokemon_validation['valid']:
                logger.error(f"Favorite item {i} has invalid pokemon data: {pokemon_validation}")
                return {'valid': False, 'error': f'favorite item {i} has invalid pokemon data'}
        
        return {'valid': True, 'data': response}
    
    @staticmethod
    def validate_user_data(user: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user data structure"""
        required_fields = ['id', 'username', 'email']
        missing_fields = [field for field in required_fields if field not in user]
        
        if missing_fields:
            logger.warning(f"User data missing required fields: {missing_fields}")
            return {'valid': False, 'missing_fields': missing_fields}
        
        return {'valid': True, 'data': user}
    
    @staticmethod
    def log_api_response(endpoint: str, response: Dict[str, Any], validation_result: Dict[str, Any]):
        """Log API response validation results"""
        if validation_result['valid']:
            logger.info(f"✅ {endpoint} response validation passed")
        else:
            logger.error(f"❌ {endpoint} response validation failed: {validation_result}")
            current_app.logger.error(f"API Response Validation Error - {endpoint}: {validation_result}")

def validate_and_log_response(endpoint: str, response: Dict[str, Any], validator_func) -> Dict[str, Any]:
    """Convenience function to validate and log API responses"""
    validation_result = validator_func(response)
    DataValidator.log_api_response(endpoint, response, validation_result)
    return validation_result
