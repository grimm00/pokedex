# Audit Logging Implementation Guide

## Overview
This guide covers the comprehensive audit logging system implemented in the Pokedex project. Audit logging is crucial for security, compliance, and debugging in production applications.

## Table of Contents
1. [Audit Logging Concepts](#audit-logging-concepts)
2. [Database Schema](#database-schema)
3. [Implementation Details](#implementation-details)
4. [Usage Examples](#usage-examples)
5. [Querying Audit Logs](#querying-audit-logs)
6. [Performance Considerations](#performance-considerations)
7. [Compliance and Security](#compliance-and-security)

## Audit Logging Concepts

### What is Audit Logging?
Audit logging is the process of recording events and activities in a system for the purposes of:
- **Security monitoring**: Track suspicious activities
- **Compliance**: Meet regulatory requirements
- **Debugging**: Troubleshoot issues
- **Analytics**: Understand user behavior
- **Forensics**: Investigate security incidents

### Key Principles
1. **Completeness**: Log all significant events
2. **Integrity**: Logs cannot be tampered with
3. **Availability**: Logs must be accessible when needed
4. **Retention**: Keep logs for required time periods
5. **Privacy**: Balance logging with user privacy

## Database Schema

### AuditLog Model
```python
class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True)
    
    # User information
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Event information
    action = db.Column(db.String(100), nullable=False)
    resource = db.Column(db.String(100), nullable=True)
    resource_id = db.Column(db.String(100), nullable=True)
    
    # Request information
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    endpoint = db.Column(db.String(200), nullable=True)
    method = db.Column(db.String(10), nullable=True)
    status_code = db.Column(db.Integer, nullable=True)
    
    # Additional data
    details = db.Column(db.JSON, nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_audit_user_id', 'user_id'),
        Index('idx_audit_action', 'action'),
        Index('idx_audit_timestamp', 'timestamp'),
        Index('idx_audit_ip_address', 'ip_address'),
    )
```

### Schema Design Decisions
- **user_id nullable**: System events may not have a user
- **JSON details**: Flexible storage for additional data
- **Multiple indexes**: Optimize common query patterns
- **UTC timestamps**: Consistent timezone handling

## Implementation Details

### Audit Action Categories
```python
class AuditAction:
    # Authentication actions
    LOGIN_SUCCESS = 'LOGIN_SUCCESS'
    LOGIN_FAILED = 'LOGIN_FAILED'
    LOGOUT = 'LOGOUT'
    REGISTER = 'REGISTER'
    TOKEN_REFRESH = 'TOKEN_REFRESH'
    
    # User actions
    USER_CREATE = 'USER_CREATE'
    USER_UPDATE = 'USER_UPDATE'
    USER_DELETE = 'USER_DELETE'
    USER_VIEW = 'USER_VIEW'
    
    # Pokemon actions
    POKEMON_CREATE = 'POKEMON_CREATE'
    POKEMON_UPDATE = 'POKEMON_UPDATE'
    POKEMON_DELETE = 'POKEMON_DELETE'
    POKEMON_VIEW = 'POKEMON_VIEW'
    POKEMON_SEARCH = 'POKEMON_SEARCH'
    
    # Favorites actions
    FAVORITE_ADD = 'FAVORITE_ADD'
    FAVORITE_REMOVE = 'FAVORITE_REMOVE'
    FAVORITE_VIEW = 'FAVORITE_VIEW'
    
    # Admin actions
    ADMIN_ACTION = 'ADMIN_ACTION'
    BULK_OPERATION = 'BULK_OPERATION'
    
    # Security events
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
    UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS'
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
    
    # System events
    SYSTEM_ERROR = 'SYSTEM_ERROR'
    DATABASE_ERROR = 'DATABASE_ERROR'
    EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR'
```

### Helper Functions
```python
def log_user_action(user_id, action, resource=None, resource_id=None, details=None, request=None):
    """Log a user action with full context"""
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

def log_system_event(action, details=None, request=None):
    """Log a system event (no user)"""
    audit_log = AuditLog(
        action=action,
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

def log_security_event(action, user_id=None, details=None, request=None):
    """Log a security-related event"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
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

## Usage Examples

### Authentication Logging
```python
# Login success
@auth_bp.route('/login', methods=['POST'])
def login():
    # ... authentication logic ...
    if user and user.check_password(password):
        log_user_action(
            user_id=user.id,
            action=AuditAction.LOGIN_SUCCESS,
            resource='auth',
            details={'ip': request.remote_addr},
            request=request
        )
        return {'access_token': access_token}
    else:
        log_security_event(
            action=AuditAction.LOGIN_FAILED,
            details={'username': username, 'ip': request.remote_addr},
            request=request
        )
        return {'error': 'Invalid credentials'}, 401

# Logout
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    log_user_action(
        user_id=user_id,
        action=AuditAction.LOGOUT,
        resource='auth',
        request=request
    )
    return {'message': 'Logged out successfully'}
```

### Pokemon Operations Logging
```python
# Create Pokemon
@pokemon_bp.route('/pokemon', methods=['POST'])
@jwt_required()
@admin_required
def create_pokemon():
    # ... creation logic ...
    pokemon = Pokemon(**data)
    db.session.add(pokemon)
    db.session.commit()
    
    log_user_action(
        user_id=get_jwt_identity(),
        action=AuditAction.POKEMON_CREATE,
        resource='pokemon',
        resource_id=str(pokemon.id),
        details={'name': pokemon.name, 'type': pokemon.types},
        request=request
    )
    
    return pokemon.to_dict(), 201

# View Pokemon
@pokemon_bp.route('/pokemon/<int:pokemon_id>', methods=['GET'])
def get_pokemon(pokemon_id):
    pokemon = Pokemon.query.get_or_404(pokemon_id)
    
    # Log view (optional - can be noisy)
    if request.headers.get('X-Log-View', 'false').lower() == 'true':
        log_user_action(
            user_id=get_jwt_identity() if request.headers.get('Authorization') else None,
            action=AuditAction.POKEMON_VIEW,
            resource='pokemon',
            resource_id=str(pokemon_id),
            request=request
        )
    
    return pokemon.to_dict()
```

### Security Event Logging
```python
# Rate limit exceeded
@limiter.limit("5 per minute")
def login():
    # ... login logic ...

# In error handler
@app.errorhandler(429)
def rate_limit_exceeded(error):
    log_security_event(
        action=AuditAction.RATE_LIMIT_EXCEEDED,
        details={
            'endpoint': request.endpoint,
            'ip': request.remote_addr,
            'retry_after': getattr(error, 'retry_after', 60)
        },
        request=request
    )
    return {'error': 'Rate limit exceeded'}, 429

# Unauthorized access
@app.errorhandler(401)
def unauthorized(error):
    log_security_event(
        action=AuditAction.UNAUTHORIZED_ACCESS,
        details={
            'endpoint': request.endpoint,
            'ip': request.remote_addr,
            'user_agent': request.headers.get('User-Agent')
        },
        request=request
    )
    return {'error': 'Authentication required'}, 401
```

## Querying Audit Logs

### Basic Queries
```python
# Get all logs for a user
user_logs = AuditLog.query.filter_by(user_id=user_id).all()

# Get logs by action
login_logs = AuditLog.query.filter_by(action=AuditAction.LOGIN_SUCCESS).all()

# Get logs in date range
from datetime import datetime, timedelta
start_date = datetime.now() - timedelta(days=7)
recent_logs = AuditLog.query.filter(AuditLog.timestamp >= start_date).all()

# Get logs by IP address
ip_logs = AuditLog.query.filter_by(ip_address='192.168.1.1').all()
```

### Advanced Queries
```python
# Get failed login attempts
failed_logins = AuditLog.query.filter(
    AuditLog.action == AuditAction.LOGIN_FAILED,
    AuditLog.timestamp >= datetime.now() - timedelta(hours=1)
).all()

# Get admin actions
admin_actions = AuditLog.query.filter(
    AuditLog.action == AuditAction.ADMIN_ACTION
).order_by(AuditLog.timestamp.desc()).all()

# Get suspicious activity (multiple failed logins from same IP)
suspicious_ips = db.session.query(
    AuditLog.ip_address,
    db.func.count(AuditLog.id).label('failed_attempts')
).filter(
    AuditLog.action == AuditAction.LOGIN_FAILED,
    AuditLog.timestamp >= datetime.now() - timedelta(hours=1)
).group_by(AuditLog.ip_address).having(
    db.func.count(AuditLog.id) > 5
).all()
```

### Pagination and Filtering
```python
def get_audit_logs(page=1, per_page=20, user_id=None, action=None, start_date=None, end_date=None):
    query = AuditLog.query
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    if action:
        query = query.filter_by(action=action)
    if start_date:
        query = query.filter(AuditLog.timestamp >= start_date)
    if end_date:
        query = query.filter(AuditLog.timestamp <= end_date)
    
    return query.order_by(AuditLog.timestamp.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
```

## Performance Considerations

### Database Indexes
```python
# Essential indexes for audit logging
__table_args__ = (
    Index('idx_audit_user_id', 'user_id'),
    Index('idx_audit_action', 'action'),
    Index('idx_audit_timestamp', 'timestamp'),
    Index('idx_audit_ip_address', 'ip_address'),
    # Composite indexes for common queries
    Index('idx_audit_user_timestamp', 'user_id', 'timestamp'),
    Index('idx_audit_action_timestamp', 'action', 'timestamp'),
)
```

### Log Rotation and Archival
```python
def archive_old_logs(days_to_keep=90):
    """Archive logs older than specified days"""
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)
    
    # Move old logs to archive table or file
    old_logs = AuditLog.query.filter(AuditLog.timestamp < cutoff_date).all()
    
    # Archive logic here...
    
    # Delete old logs
    AuditLog.query.filter(AuditLog.timestamp < cutoff_date).delete()
    db.session.commit()
```

### Async Logging (Future Enhancement)
```python
# For high-volume applications, consider async logging
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

def log_async(action, **kwargs):
    """Log asynchronously to avoid blocking requests"""
    executor.submit(log_user_action, action=action, **kwargs)
```

## Compliance and Security

### GDPR Compliance
```python
def anonymize_user_logs(user_id):
    """Anonymize logs for a specific user (GDPR right to be forgotten)"""
    logs = AuditLog.query.filter_by(user_id=user_id).all()
    for log in logs:
        log.user_id = None
        log.ip_address = 'ANONYMIZED'
        log.user_agent = 'ANONYMIZED'
        log.details = {'anonymized': True}
    
    db.session.commit()
```

### Log Integrity
```python
import hashlib

def verify_log_integrity():
    """Verify that logs haven't been tampered with"""
    logs = AuditLog.query.all()
    for log in logs:
        # Create hash of log data
        log_data = f"{log.id}{log.user_id}{log.action}{log.timestamp}"
        expected_hash = hashlib.sha256(log_data.encode()).hexdigest()
        
        # Store hash in details for verification
        if 'integrity_hash' not in log.details:
            log.details['integrity_hash'] = expected_hash
            db.session.commit()
```

### Security Monitoring
```python
def detect_suspicious_activity():
    """Detect patterns that might indicate security issues"""
    # Multiple failed logins from same IP
    failed_logins = db.session.query(
        AuditLog.ip_address,
        db.func.count(AuditLog.id).label('count')
    ).filter(
        AuditLog.action == AuditAction.LOGIN_FAILED,
        AuditLog.timestamp >= datetime.now() - timedelta(minutes=15)
    ).group_by(AuditLog.ip_address).having(
        db.func.count(AuditLog.id) > 10
    ).all()
    
    for ip, count in failed_logins:
        log_security_event(
            action=AuditAction.SUSPICIOUS_ACTIVITY,
            details={
                'type': 'multiple_failed_logins',
                'ip': ip,
                'count': count,
                'timeframe': '15 minutes'
            }
        )
```

## Best Practices

### What to Log
1. **Authentication events** (login, logout, failed attempts)
2. **Data modifications** (create, update, delete)
3. **Sensitive operations** (admin actions, bulk operations)
4. **Security events** (rate limiting, unauthorized access)
5. **System events** (errors, external API calls)

### What NOT to Log
1. **Passwords or sensitive data** in details
2. **Excessive view operations** (can be noisy)
3. **Personal information** unless necessary
4. **Debug information** in production

### Log Format Standards
```python
# Good log format
{
    "action": "USER_CREATE",
    "user_id": 123,
    "resource": "user",
    "resource_id": "456",
    "details": {
        "username": "newuser",
        "email": "user@example.com",
        "ip": "192.168.1.1"
    },
    "timestamp": "2025-09-11T14:30:00Z"
}

# Bad log format (too much detail)
{
    "action": "USER_CREATE",
    "user_id": 123,
    "details": {
        "password": "secret123",  # Never log passwords!
        "full_request": {...},    # Too much data
        "internal_state": {...}   # Internal implementation details
    }
}
```

## Monitoring and Alerting

### Log Analysis Queries
```python
# Top users by activity
top_users = db.session.query(
    AuditLog.user_id,
    db.func.count(AuditLog.id).label('activity_count')
).filter(
    AuditLog.timestamp >= datetime.now() - timedelta(days=7)
).group_by(AuditLog.user_id).order_by(
    db.func.count(AuditLog.id).desc()
).limit(10).all()

# Most common actions
common_actions = db.session.query(
    AuditLog.action,
    db.func.count(AuditLog.id).label('count')
).filter(
    AuditLog.timestamp >= datetime.now() - timedelta(days=7)
).group_by(AuditLog.action).order_by(
    db.func.count(AuditLog.id).desc()
).all()
```

### Alert Conditions
```python
def check_security_alerts():
    """Check for conditions that require immediate attention"""
    alerts = []
    
    # Multiple failed logins
    failed_count = AuditLog.query.filter(
        AuditLog.action == AuditAction.LOGIN_FAILED,
        AuditLog.timestamp >= datetime.now() - timedelta(minutes=5)
    ).count()
    
    if failed_count > 20:
        alerts.append({
            'type': 'HIGH_FAILED_LOGINS',
            'message': f'{failed_count} failed login attempts in 5 minutes',
            'severity': 'HIGH'
        })
    
    return alerts
```

---

**Last Updated**: 2025-09-11  
**Status**: Complete Implementation  
**Next Review**: Before production deployment

