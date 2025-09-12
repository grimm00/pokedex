"""
Security and Rate Limiting Configuration
This module provides comprehensive security features for the Pokedex API.
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request, jsonify
import logging
from datetime import datetime
import os

# Security logger
security_logger = logging.getLogger('security')

def create_limiter(app):
    """Create and configure Flask-Limiter instance"""
    return Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["100 per minute"],
        storage_uri="memory://",  # Use in-memory storage for development
        strategy="fixed-window"
    )

def setup_security_headers(app):
    """Add security headers to all responses"""
    
    @app.after_request
    def after_request(response):
        # Prevent MIME type sniffing
        response.headers['X-Content-Type-Options'] = 'nosniff'
        
        # Prevent clickjacking
        response.headers['X-Frame-Options'] = 'DENY'
        
        # XSS Protection
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Strict Transport Security (HTTPS only)
        if request.is_secure:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Content Security Policy
        response.headers['Content-Security-Policy'] = "default-src 'self'"
        
        # Referrer Policy
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Permissions Policy
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        return response

def setup_rate_limiting(limiter):
    """Configure rate limiting for different endpoint types"""
    
    # Authentication endpoints - strict limits
    @limiter.limit("5 per minute")
    def auth_endpoints():
        pass
    
    # General API endpoints - standard limits
    @limiter.limit("100 per minute")
    def api_endpoints():
        pass
    
    # Admin endpoints - higher limits
    @limiter.limit("1000 per minute")
    def admin_endpoints():
        pass
    
    return {
        'auth': auth_endpoints,
        'api': api_endpoints,
        'admin': admin_endpoints
    }

def log_security_event(event_type, user_id=None, details=None, severity='INFO'):
    """Log security events for monitoring and auditing"""
    
    event_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': event_type,
        'user_id': user_id,
        'ip_address': get_remote_address(),
        'user_agent': request.headers.get('User-Agent', 'Unknown'),
        'endpoint': request.endpoint,
        'method': request.method,
        'details': details or {}
    }
    
    # Log based on severity
    if severity == 'WARNING':
        security_logger.warning(event_data)
    elif severity == 'ERROR':
        security_logger.error(event_data)
    else:
        security_logger.info(event_data)

def create_error_handlers(app):
    """Create standardized error handlers"""
    
    @app.errorhandler(400)
    def bad_request(error):
        log_security_event('BAD_REQUEST', details={'error': str(error)})
        return jsonify({
            'error': {
                'code': 'BAD_REQUEST',
                'message': 'Invalid request data',
                'request_id': request.headers.get('X-Request-ID', 'unknown')
            }
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        log_security_event('UNAUTHORIZED', details={'error': str(error)})
        return jsonify({
            'error': {
                'code': 'UNAUTHORIZED',
                'message': 'Authentication required',
                'request_id': request.headers.get('X-Request-ID', 'unknown')
            }
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        log_security_event('FORBIDDEN', details={'error': str(error)})
        return jsonify({
            'error': {
                'code': 'FORBIDDEN',
                'message': 'Insufficient permissions',
                'request_id': request.headers.get('X-Request-ID', 'unknown')
            }
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': {
                'code': 'NOT_FOUND',
                'message': 'Resource not found',
                'request_id': request.headers.get('X-Request-ID', 'unknown')
            }
        }), 404
    
    @app.errorhandler(409)
    def conflict(error):
        log_security_event('CONFLICT', details={'error': str(error)})
        return jsonify({
            'error': {
                'code': 'CONFLICT',
                'message': 'Resource conflict',
                'request_id': request.headers.get('X-Request-ID', 'unknown')
            }
        }), 409
    
    @app.errorhandler(422)
    def unprocessable_entity(error):
        log_security_event('VALIDATION_ERROR', details={'error': str(error)})
        return jsonify({
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'request_id': request.headers.get('X-Request-ID', 'unknown')
            }
        }), 422
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        log_security_event('RATE_LIMIT_EXCEEDED', severity='WARNING')
        return jsonify({
            'error': {
                'code': 'RATE_LIMIT_EXCEEDED',
                'message': 'Too many requests',
                'retry_after': getattr(error, 'retry_after', 60),
                'request_id': request.headers.get('X-Request-ID', 'unknown')
            }
        }), 429
    
    @app.errorhandler(500)
    def internal_error(error):
        log_security_event('INTERNAL_ERROR', severity='ERROR', details={'error': str(error)})
        return jsonify({
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An internal error occurred',
                'request_id': request.headers.get('X-Request-ID', 'unknown')
            }
        }), 500

def setup_request_logging(app):
    """Setup request logging for security monitoring"""
    
    @app.before_request
    def before_request():
        # Add request ID for tracking
        request.request_id = os.urandom(8).hex()
        
        # Log sensitive endpoints
        if request.endpoint in ['auth.login', 'auth.register']:
            log_security_event('AUTH_ATTEMPT', details={
                'endpoint': request.endpoint,
                'ip': get_remote_address()
            })
    
    @app.after_request
    def after_request(response):
        # Log admin actions
        if request.endpoint and 'admin' in request.endpoint:
            log_security_event('ADMIN_ACTION', details={
                'endpoint': request.endpoint,
                'status_code': response.status_code
            })
        
        # Add request ID to response headers
        response.headers['X-Request-ID'] = getattr(request, 'request_id', 'unknown')
        
        return response

def validate_input(data, rules):
    """Validate input data against defined rules"""
    errors = []
    
    for field, rule in rules.items():
        value = data.get(field)
        
        # Required field check
        if rule.get('required') and not value:
            errors.append({
                'field': field,
                'message': f'{field} is required'
            })
            continue
        
        if not value:
            continue
        
        # Type validation
        expected_type = rule.get('type')
        if expected_type and not isinstance(value, expected_type):
            errors.append({
                'field': field,
                'message': f'{field} must be {expected_type.__name__}'
            })
            continue
        
        # Length validation
        if 'min_length' in rule and len(str(value)) < rule['min_length']:
            errors.append({
                'field': field,
                'message': f'{field} must be at least {rule["min_length"]} characters'
            })
        
        if 'max_length' in rule and len(str(value)) > rule['max_length']:
            errors.append({
                'field': field,
                'message': f'{field} must be no more than {rule["max_length"]} characters'
            })
        
        # Pattern validation
        if 'pattern' in rule:
            import re
            if not re.match(rule['pattern'], str(value)):
                errors.append({
                    'field': field,
                    'message': f'{field} format is invalid'
                })
    
    return errors

# Input validation rules
VALIDATION_RULES = {
    'username': {
        'type': str,
        'required': True,
        'min_length': 3,
        'max_length': 80,
        'pattern': r'^[a-zA-Z0-9_]+$'
    },
    'email': {
        'type': str,
        'required': True,
        'pattern': r'^[^@]+@[^@]+\.[^@]+$'
    },
    'password': {
        'type': str,
        'required': True,
        'min_length': 8,
        'max_length': 128
    },
    'pokemon_name': {
        'type': str,
        'required': True,
        'min_length': 1,
        'max_length': 100
    }
}
