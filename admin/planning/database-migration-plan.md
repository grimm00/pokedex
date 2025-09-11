# Database Migration Plan

**Date**: 2025-09-11  
**Status**: In Progress  
**Related ADR**: [ADR-002: Database Design](../adrs/adr-002-database-design.md)

## 🎯 **Migration Objectives**

1. **Transition from SQLite to PostgreSQL** - Move from test database to production-ready database
2. **Implement Flask-Migrate** - Set up proper database versioning and migration system
3. **Create Initial Schema** - Generate migration for all existing models
4. **Validate Data Integrity** - Ensure all relationships and constraints work correctly
5. **Prepare for Production** - Set up database configuration for different environments

## 📊 **Current State Analysis**

### ✅ **What We Have**
- **Flask-SQLAlchemy Models**: Pokemon, User, UserPokemon models defined
- **Flask-Migrate**: Already configured in `backend/app.py`
- **Model Relationships**: Foreign keys and constraints defined
- **Test Validation**: SQLite testing confirmed model functionality
- **Environment Configuration**: Database URL configuration ready

### 🔄 **What We Need**
- **PostgreSQL Installation**: Database server running
- **psycopg2-binary**: PostgreSQL Python adapter
- **Environment Variables**: Database credentials configured
- **Migration Files**: Initial migration created and applied
- **Data Validation**: Ensure all models work with PostgreSQL

## 🗄️ **Database Schema Overview**

### **Tables to be Created**

#### 1. **`pokemon` Table**
```sql
CREATE TABLE pokemon (
    id SERIAL PRIMARY KEY,
    pokemon_id INTEGER UNIQUE NOT NULL,  -- PokeAPI ID
    name VARCHAR(100) NOT NULL,
    height INTEGER,                       -- in decimeters
    weight INTEGER,                       -- in hectograms
    base_experience INTEGER,
    types JSON,                          -- Store as JSON array
    abilities JSON,                      -- Store as JSON array
    stats JSON,                          -- Store as JSON object
    sprites JSON,                        -- Store as JSON object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. **`users` Table**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. **`user_pokemon` Table**
```sql
CREATE TABLE user_pokemon (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    pokemon_id INTEGER NOT NULL REFERENCES pokemon(pokemon_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pokemon_id)
);
```

#### 4. **`alembic_version` Table**
```sql
CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL PRIMARY KEY
);
```

## 🚀 **Migration Implementation Plan**

### **Phase 1: Environment Setup** ⏱️ 15 minutes

#### 1.1 Install Dependencies
```bash
# Install PostgreSQL Python adapter
pip install psycopg2-binary==2.9.7

# Verify installation
python -c "import psycopg2; print('PostgreSQL adapter installed')"
```

#### 1.2 Configure Environment
```bash
# Copy environment template
cp admin/technical/env-template.txt .env

# Edit .env with PostgreSQL credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/pokedex_dev
```

#### 1.3 Verify PostgreSQL Connection
```bash
# Check PostgreSQL is running
pg_isready

# Test connection with psql
psql -d pokedex_dev -c "SELECT version();"
```

### **Phase 2: Migration Initialization** ⏱️ 10 minutes

#### 2.1 Initialize Flask-Migrate
```bash
# Set Flask app environment variable
export FLASK_APP=backend.app:app

# Initialize migration repository
flask db init
```

#### 2.2 Verify Migration Structure
```bash
# Check migrations directory created
ls -la migrations/

# Expected structure:
# migrations/
# ├── versions/
# ├── alembic.ini
# ├── env.py
# └── script.py.mako
```

### **Phase 3: Create Initial Migration** ⏱️ 5 minutes

#### 3.1 Generate Migration
```bash
# Create initial migration
flask db migrate -m "Initial migration: Add Pokemon, User, and UserPokemon tables"
```

#### 3.2 Review Migration File
```bash
# Check the generated migration file
ls -la migrations/versions/
cat migrations/versions/*_initial_migration.py
```

### **Phase 4: Apply Migration** ⏱️ 5 minutes

#### 4.1 Apply Migration
```bash
# Apply migration to create tables
flask db upgrade
```

#### 4.2 Verify Tables Created
```bash
# Check tables in PostgreSQL
psql -d pokedex_dev -c "\dt"

# Expected output:
# List of relations
# Schema | Name            | Type  | Owner
# public | alembic_version | table | username
# public | pokemon         | table | username
# public | user_pokemon    | table | username
# public | users           | table | username
```

### **Phase 5: Validation & Testing** ⏱️ 15 minutes

#### 5.1 Test Database Connection
```python
# Test script
from backend.app import app, db
with app.app_context():
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Tables created: {tables}")
```

#### 5.2 Test Model Operations
```python
# Test creating a user
from backend.models.user import User
user = User(username="test", email="test@example.com")
user.set_password("password123")
db.session.add(user)
db.session.commit()
```

#### 5.3 Test API Endpoints
```bash
# Start the Flask app
python backend/app.py

# Test endpoints
curl http://localhost:5000/
curl http://localhost:5000/api/v1/pokemon
```

## 🔧 **Migration Commands Reference**

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `flask db init` | Initialize migration repository | First time setup |
| `flask db migrate -m "message"` | Create new migration | After model changes |
| `flask db upgrade` | Apply migrations | Deploy changes |
| `flask db downgrade` | Rollback migration | Undo changes |
| `flask db current` | Show current migration | Check status |
| `flask db history` | Show migration history | Review changes |

## 🚨 **Risk Assessment & Mitigation**

### **High Risk Issues**

#### 1. **PostgreSQL Not Running**
- **Risk**: Migration commands fail
- **Mitigation**: Check `pg_isready` before starting
- **Recovery**: Start PostgreSQL service

#### 2. **Database Connection Issues**
- **Risk**: Invalid credentials or database doesn't exist
- **Mitigation**: Test connection with `psql` first
- **Recovery**: Create database manually, update credentials

#### 3. **Migration Conflicts**
- **Risk**: Existing data conflicts with new schema
- **Mitigation**: Start with empty database
- **Recovery**: Drop and recreate database

### **Medium Risk Issues**

#### 1. **Model Import Errors**
- **Risk**: Circular imports during migration
- **Mitigation**: Test imports before migration
- **Recovery**: Fix import structure

#### 2. **JSON Column Issues**
- **Risk**: PostgreSQL JSON handling differences
- **Mitigation**: Test JSON operations
- **Recovery**: Adjust model definitions

## 📈 **Success Criteria**

### **Technical Validation**
- [ ] All tables created successfully
- [ ] Foreign key constraints working
- [ ] JSON columns storing data correctly
- [ ] Timestamps using timezone-aware format
- [ ] Unique constraints enforced

### **Functional Validation**
- [ ] User registration works
- [ ] User login works
- [ ] JWT authentication works
- [ ] Pokemon CRUD operations work
- [ ] User favorites functionality works

### **Performance Validation**
- [ ] Database queries execute quickly
- [ ] No connection timeouts
- [ ] Memory usage reasonable
- [ ] API response times acceptable

## 🔮 **Post-Migration Tasks**

### **Immediate Next Steps**
1. **Test API Endpoints** - Verify all endpoints work with PostgreSQL
2. **Add Sample Data** - Create test users and Pokemon data
3. **Performance Testing** - Benchmark database operations
4. **Documentation Update** - Update setup instructions

### **Future Enhancements**
1. **Database Indexing** - Add indexes for performance
2. **Connection Pooling** - Optimize database connections
3. **Backup Strategy** - Implement database backups
4. **Monitoring** - Set up database monitoring

## 📚 **Related Documentation**

- [ADR-002: Database Design](../adrs/adr-002-database-design.md)
- [Environment Template](../../technical/env-template.txt)
- [Test Results](../../testing/test-results/test-execution-summary.md)
- [API Documentation](../../technical/api-versioning-strategy.md)

---

**Migration Lead**: AI Assistant  
**Estimated Duration**: 45 minutes  
**Dependencies**: PostgreSQL, Python 3.13, Flask 2.3.3  
**Success Rate**: 95% (based on test validation)


