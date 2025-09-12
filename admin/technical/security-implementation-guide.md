# Security Implementation Guide

## Overview
This guide covers the comprehensive security implementation completed in Option B of the Pokedex project. It serves as both documentation and learning material for implementing production-ready security features in Flask applications.

## Table of Contents
1. [Rate Limiting Implementation](#rate-limiting-implementation)
2. [Security Headers](#security-headers)
3. [Input Validation](#input-validation)
4. [Audit Logging](#audit-logging)
5. [Error Handling](#error-handling)
6. [CORS Configuration](#cors-configuration)
7. [Testing Security Features](#testing-security-features)

## Rate Limiting Implementation

### Flask-Limiter Setup
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

def create_limiter(app):
    return Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["100 per minute"],
        storage_uri="memory://",  # Use Redis in production
        strategy="fixed-window"
    )
```

### Rate Limiting Strategies
- **Fixed Window**: Simple, predictable limits
- **Sliding Window**: More accurate but uses more memory
- **Token Bucket**: Allows bursts but maintains average rate

### Endpoint-Specific Limits
```python
# Authentication endpoints - strict limits
@limiter.limit("5 per minute")
def login():
    pass

# General API endpoints - standard limits
@limiter.limit("100 per minute")
def get_pokemon():
    pass

# Admin endpoints - higher limits
@limiter.limit("1000 per minute")
def admin_operation():
    pass
```

### Rate Limiting Best Practices
1. **Different limits for different endpoint types**
2. **Use Redis for production** (not memory storage)
3. **Implement graceful degradation**
4. **Log rate limit violations**
5. **Consider user-based vs IP-based limiting**

## Security Headers

### Essential Security Headers
```python
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
```

### Security Header Explanations
- **X-Content-Type-Options**: Prevents MIME type sniffing attacks
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables browser XSS filtering
- **Strict-Transport-Security**: Forces HTTPS connections
- **Content-Security-Policy**: Controls resource loading
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Controls browser feature access

## Input Validation

### Validation Rules System
```python
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
    }
}

def validate_input(data, rules):
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
        
        # Type validation
        expected_type = rule.get('type')
        if expected_type and not isinstance(value, expected_type):
            errors.append({
                'field': field,
                'message': f'{field} must be {expected_type.__name__}'
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
```

### Validation Best Practices
1. **Validate on both client and server**
2. **Use whitelist approach** (allow only known good patterns)
3. **Sanitize input** before processing
4. **Return specific error messages** for debugging
5. **Log validation failures** for monitoring

## Audit Logging

### AuditLog Model
```python
class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    resource = db.Column(db.String(100), nullable=True)
    resource_id = db.Column(db.String(100), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    endpoint = db.Column(db.String(200), nullable=True)
    method = db.Column(db.String(10), nullable=True)
    status_code = db.Column(db.Integer, nullable=True)
    details = db.Column(db.JSON, nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
```

### Audit Action Categories
```python
class AuditAction:
    # Authentication actions
    LOGIN_SUCCESS = 'LOGIN_SUCCESS'
    LOGIN_FAILED = 'LOGIN_FAILED'
    LOGOUT = 'LOGOUT'
    REGISTER = 'REGISTER'
    
    # User actions
    USER_CREATE = 'USER_CREATE'
    USER_UPDATE = 'USER_UPDATE'
    USER_DELETE = 'USER_DELETE'
    
    # Pokemon actions
    POKEMON_CREATE = 'POKEMON_CREATE'
    POKEMON_UPDATE = 'POKEMON_UPDATE'
    POKEMON_DELETE = 'POKEMON_DELETE'
    
    # Security events
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
    UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS'
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
```

### Logging Helper Functions
```python
def log_user_action(user_id, action, resource=None, resource_id=None, details=None, request=None):
    """Log a user action"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        details=details or {}
    )
    
    if request:
        audit_log.ip_address = request.remote_addr
        audit_log.user_agent = request.headers.get('User-Agent')
        audit_log.endpoint = request.endpoint
        audit_log.method = request.method
    
    db.session.add(audit_log)
    db.session.commit()
    return audit_log
```

## Error Handling

### Standardized Error Responses
```python
@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'error': {
            'code': 'BAD_REQUEST',
            'message': 'Invalid request data',
            'request_id': request.headers.get('X-Request-ID', 'unknown')
        }
    }), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({
        'error': {
            'code': 'UNAUTHORIZED',
            'message': 'Authentication required',
            'request_id': request.headers.get('X-Request-ID', 'unknown')
        }
    }), 401

@app.errorhandler(429)
def rate_limit_exceeded(error):
    return jsonify({
        'error': {
            'code': 'RATE_LIMIT_EXCEEDED',
            'message': 'Too many requests',
            'retry_after': getattr(error, 'retry_after', 60),
            'request_id': request.headers.get('X-Request-ID', 'unknown')
        }
    }), 429
```

### Error Handling Best Practices
1. **Don't expose internal details** in error messages
2. **Use consistent error format** across all endpoints
3. **Include request IDs** for tracking
4. **Log detailed errors** server-side
5. **Return appropriate HTTP status codes**

## CORS Configuration

### CORS Setup
```python
from flask_cors import CORS

CORS(app, origins=[
    'http://localhost:3000',  # React dev server
    'http://localhost:5173',  # Vite dev server
    'https://pokedex.example.com'  # Production domain
])
```

### CORS Best Practices
1. **Specify exact origins** (don't use wildcards in production)
2. **Use environment variables** for different environments
3. **Consider credentials** if needed
4. **Test CORS** with actual frontend requests

## Testing Security Features

### Rate Limiting Tests
```python
def test_rate_limiting():
    # Test normal requests
    for i in range(5):
        response = client.post('/api/v1/auth/login', json={
            'username': 'test',
            'password': 'password'
        })
        assert response.status_code in [200, 401]  # Success or auth failure
    
    # Test rate limit exceeded
    response = client.post('/api/v1/auth/login', json={
        'username': 'test',
        'password': 'password'
    })
    assert response.status_code == 429
    assert 'RATE_LIMIT_EXCEEDED' in response.get_json()['error']['code']
```

### Security Headers Tests
```python
def test_security_headers():
    response = client.get('/')
    
    assert response.headers['X-Content-Type-Options'] == 'nosniff'
    assert response.headers['X-Frame-Options'] == 'DENY'
    assert response.headers['X-XSS-Protection'] == '1; mode=block'
    assert 'Content-Security-Policy' in response.headers
```

### Input Validation Tests
```python
def test_input_validation():
    # Test invalid username
    response = client.post('/api/v1/auth/register', json={
        'username': '<script>alert("xss")</script>',
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 422
    assert 'validation' in response.get_json()['error']['code'].lower()
```

## Production Considerations

### Environment-Specific Configuration
```python
# Development
if app.config['ENV'] == 'development':
    limiter = Limiter(app, storage_uri="memory://")
    CORS(app, origins=['http://localhost:3000'])

# Production
if app.config['ENV'] == 'production':
    limiter = Limiter(app, storage_uri="redis://localhost:6379")
    CORS(app, origins=['https://pokedex.example.com'])
```

### Security Monitoring
1. **Set up alerts** for security events
2. **Monitor rate limit violations**
3. **Track failed login attempts**
4. **Review audit logs regularly**
5. **Implement automated security scanning**

## Common Security Pitfalls

### What to Avoid
1. **Don't store secrets** in code or config files
2. **Don't use weak passwords** or default credentials
3. **Don't expose sensitive data** in error messages
4. **Don't skip input validation** on any endpoint
5. **Don't ignore security headers** - they're important

### What to Always Do
1. **Always validate input** on the server side
2. **Always use HTTPS** in production
3. **Always log security events**
4. **Always use parameterized queries**
5. **Always keep dependencies updated**

## Resources for Further Learning

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Flask Security
- [Flask Security Documentation](https://flask-security.readthedocs.io/)
- [Flask-Limiter Documentation](https://flask-limiter.readthedocs.io/)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)

### General Security
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Security Headers](https://securityheaders.com/)
- [Mozilla Security Guidelines](https://infosec.mozilla.org/guidelines/)

---

**Last Updated**: 2025-09-11  
**Status**: Complete Implementation  
**Next Review**: Before production deployment

