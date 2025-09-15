"""
Audit Log Model
Tracks user actions and system events for security and compliance.
"""

from backend.database import db
from datetime import datetime, timezone
from sqlalchemy import Index

class AuditLog(db.Model):
    """Audit log for tracking user actions and system events"""
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
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_audit_user_id', 'user_id'),
        Index('idx_audit_action', 'action'),
        Index('idx_audit_timestamp', 'timestamp'),
        Index('idx_audit_ip_address', 'ip_address'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'resource': self.resource,
            'resource_id': self.resource_id,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'endpoint': self.endpoint,
            'method': self.method,
            'status_code': self.status_code,
            'details': self.details,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f'<AuditLog {self.action} by user {self.user_id} at {self.timestamp}>'

# Audit log categories
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
    
    # External API actions
    EXTERNAL_API_CALL = 'EXTERNAL_API_CALL'
    EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR'
    
    # Bulk operations
    BULK_OPERATION = 'BULK_OPERATION'
    
    # System actions
    SYSTEM_ERROR = 'SYSTEM_ERROR'
    
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

# Audit log helper functions
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

def log_system_event(action, details=None, request=None):
    """Log a system event"""
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
