# Database Management Improvements

## Current Issues

### 1. Inconsistent Session Management
- Mixing `db.session.add()` + `db.session.commit()` with `db.session.query()`
- No proper transaction boundaries
- Session isolation issues in tests

### 2. No Proper Error Handling
- Database operations without try/catch blocks
- No rollback on failures
- Silent failures in some cases

### 3. Test Database Conflicts
- Test client and API routes use different sessions
- `clean_database` fixture interferes with test execution
- Database state not visible across API calls

### 4. No Connection Pooling
- Using SQLite with default settings
- No connection configuration
- Potential locking issues

## Recommended Solutions

### 1. Implement Proper Database Service Layer

```python
# backend/services/database_service.py
from contextlib import contextmanager
from flask import current_app
from backend.database import db
from sqlalchemy.exc import SQLAlchemyError

class DatabaseService:
    @staticmethod
    @contextmanager
    def transaction():
        """Context manager for database transactions"""
        try:
            yield db.session
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e
        finally:
            db.session.close()
    
    @staticmethod
    def safe_commit():
        """Safely commit database changes with error handling"""
        try:
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"Database commit failed: {e}")
            return False
    
    @staticmethod
    def safe_add(entity):
        """Safely add entity to database"""
        try:
            db.session.add(entity)
            return True
        except SQLAlchemyError as e:
            current_app.logger.error(f"Database add failed: {e}")
            return False
```

### 2. Update Database Configuration

```python
# backend/database.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from sqlalchemy.engine import Engine
import logging

# Create the database instance with proper configuration
db = SQLAlchemy()

# Configure SQLite for better performance
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.execute("PRAGMA cache_size=1000")
    cursor.execute("PRAGMA temp_store=MEMORY")
    cursor.close()
```

### 3. Fix Test Database Management

```python
# tests/conftest.py
import pytest
from contextlib import contextmanager
from backend.database import db

@pytest.fixture(scope='function')
def db_session():
    """Provide a clean database session for each test"""
    with db.session.begin():
        yield db.session
        # Rollback after each test to maintain isolation
        db.session.rollback()

@pytest.fixture(autouse=True)
def clean_database_before_test():
    """Clean database before each test"""
    # Clean up before test
    db.session.query(UserPokemon).delete()
    db.session.query(User).delete()
    db.session.commit()
    yield
    # Clean up after test
    db.session.query(UserPokemon).delete()
    db.session.query(User).delete()
    db.session.commit()
```

### 4. Update Route Handlers

```python
# Example: backend/routes/user_routes.py
from backend.services.database_service import DatabaseService

class UserFavorites(Resource):
    @jwt_required()
    def post(self, user_id):
        """Add Pokemon to user's favorites"""
        with DatabaseService.transaction() as session:
            # All database operations within transaction
            favorite = UserPokemon(
                user_id=user_id,
                pokemon_id=args['pokemon_id']
            )
            session.add(favorite)
            # Transaction automatically commits on success
            # or rolls back on failure
```

### 5. Implement Database Health Checks

```python
# backend/services/database_health.py
from backend.database import db
from sqlalchemy import text

class DatabaseHealth:
    @staticmethod
    def check_connection():
        """Check if database connection is healthy"""
        try:
            db.session.execute(text("SELECT 1"))
            return True
        except Exception as e:
            return False
    
    @staticmethod
    def get_connection_info():
        """Get database connection information"""
        return {
            'url': db.engine.url,
            'pool_size': db.engine.pool.size(),
            'checked_out': db.engine.pool.checkedout(),
            'overflow': db.engine.pool.overflow()
        }
```

## Implementation Priority

1. **High Priority**: Fix test database session management
2. **High Priority**: Implement proper transaction management
3. **Medium Priority**: Add database service layer
4. **Medium Priority**: Improve error handling
5. **Low Priority**: Add connection pooling and health checks

## Benefits

- **Consistent Database Operations**: All database operations use same patterns
- **Better Error Handling**: Proper rollback and error reporting
- **Test Reliability**: Tests won't have session isolation issues
- **Performance**: Better connection management and pooling
- **Maintainability**: Centralized database logic
