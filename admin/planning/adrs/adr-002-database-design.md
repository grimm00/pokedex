# ADR-002: Database Design and Schema Decisions

## Status
**DRAFT** - 2024-01-XX

## Context
We need to design the database schema for the Pokedex project, including Pokemon data storage, user management, and favorites system. The design should balance flexibility for Pokemon data with relational integrity for user management.

## Decision
We will use the following database design approach:

### **Database Technology**
- **Primary Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Flask-Migrate
- **Caching**: Redis (for Pokemon data caching)

### **Schema Design Principles**
1. **Hybrid Approach**: Relational tables for structured data, JSON fields for flexible Pokemon data
2. **PokeAPI Compatibility**: Store Pokemon data in format compatible with external API
3. **User Data Integrity**: Strict relational constraints for user management
4. **Performance**: Optimize for common query patterns

## Database Schema

### **Users Table**
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

**Design Decisions:**
- **Primary Key**: Auto-incrementing integer for performance
- **Unique Constraints**: Username and email must be unique
- **Password Security**: Store bcrypt hash, never plain text
- **Admin Flag**: Simple boolean for role-based access
- **Timestamps**: Track creation and modification times

### **Pokemon Table**
```sql
CREATE TABLE pokemon (
    id SERIAL PRIMARY KEY,
    pokemon_id INTEGER UNIQUE NOT NULL,  -- PokeAPI ID
    name VARCHAR(100) NOT NULL,
    height INTEGER,  -- in decimeters
    weight INTEGER,  -- in hectograms
    base_experience INTEGER,
    types JSONB,  -- Store as JSON array
    abilities JSONB,  -- Store as JSON array
    stats JSONB,  -- Store as JSON object
    sprites JSONB,  -- Store as JSON object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Design Decisions:**
- **Dual IDs**: Internal `id` vs external `pokemon_id` (PokeAPI)
- **JSONB Fields**: PostgreSQL's binary JSON for performance
- **PokeAPI Units**: Height in decimeters, weight in hectograms
- **Flexible Data**: JSON fields allow evolving Pokemon data structure

### **User Pokemon Favorites Table**
```sql
CREATE TABLE user_pokemon (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pokemon_id INTEGER REFERENCES pokemon(pokemon_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pokemon_id)
);
```

**Design Decisions:**
- **Junction Table**: Many-to-many relationship between users and Pokemon
- **Cascade Delete**: Remove favorites when user or Pokemon is deleted
- **Unique Constraint**: Prevent duplicate favorites
- **Foreign Keys**: Maintain referential integrity

## Data Storage Strategy

### **Pokemon Data Storage**
```json
{
  "types": ["electric", "flying"],
  "abilities": ["static", "lightning-rod"],
  "stats": {
    "hp": 35,
    "attack": 55,
    "defense": 40,
    "special-attack": 50,
    "special-defense": 50,
    "speed": 90
  },
  "sprites": {
    "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    "back_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png"
  }
}
```

**Benefits:**
- **Flexibility**: Easy to add new Pokemon attributes
- **PokeAPI Compatibility**: Maintains external API data structure
- **Query Performance**: JSONB allows efficient querying
- **Storage Efficiency**: Single table vs multiple related tables

### **User Data Storage**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "is_admin": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Benefits:**
- **Relational Integrity**: Foreign key constraints
- **Data Consistency**: Unique constraints prevent duplicates
- **Security**: Password hashing and admin flags
- **Audit Trail**: Timestamps for tracking changes

## Indexing Strategy

### **Primary Indexes**
```sql
-- Users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Pokemon table
CREATE INDEX idx_pokemon_pokemon_id ON pokemon(pokemon_id);
CREATE INDEX idx_pokemon_name ON pokemon(name);
CREATE INDEX idx_pokemon_types ON pokemon USING GIN(types);
CREATE INDEX idx_pokemon_abilities ON pokemon USING GIN(abilities);

-- User Pokemon table
CREATE INDEX idx_user_pokemon_user_id ON user_pokemon(user_id);
CREATE INDEX idx_user_pokemon_pokemon_id ON user_pokemon(pokemon_id);
```

**Index Types:**
- **B-tree**: Standard indexes for equality and range queries
- **GIN**: Generalized Inverted Index for JSONB fields
- **Composite**: Multi-column indexes for common query patterns

## Query Patterns

### **Common Queries**
```sql
-- Get user's favorites
SELECT p.* FROM pokemon p
JOIN user_pokemon up ON p.pokemon_id = up.pokemon_id
WHERE up.user_id = ?;

-- Search Pokemon by name
SELECT * FROM pokemon WHERE name ILIKE '%pikachu%';

-- Filter Pokemon by type
SELECT * FROM pokemon WHERE types @> '["electric"]';

-- Get Pokemon with specific ability
SELECT * FROM pokemon WHERE abilities @> '["static"]';

-- Get Pokemon by stat range
SELECT * FROM pokemon WHERE (stats->>'attack')::int > 100;
```

**Query Optimization:**
- **JSONB Operators**: `@>` for contains, `->>` for value extraction
- **ILIKE**: Case-insensitive text search
- **Type Casting**: Convert JSON values to appropriate types
- **Joins**: Efficient relationship queries

## Migration Strategy

### **Initial Migration**
```python
# 001_initial_migration.py
def upgrade():
    # Create users table
    op.create_table('users', ...)
    
    # Create pokemon table
    op.create_table('pokemon', ...)
    
    # Create user_pokemon table
    op.create_table('user_pokemon', ...)
    
    # Create indexes
    op.create_index('idx_users_username', 'users', ['username'])
    # ... other indexes
```

### **Data Seeding**
```python
# Seed initial Pokemon data from PokeAPI
def seed_pokemon_data():
    # Fetch from PokeAPI
    # Transform data
    # Insert into database
```

## Performance Considerations

### **Caching Strategy**
- **Redis**: Cache frequently accessed Pokemon data
- **TTL**: 1 hour for Pokemon data, 30 minutes for user data
- **Invalidation**: Clear cache on data updates

### **Query Optimization**
- **Pagination**: Limit result sets for large queries
- **Lazy Loading**: Load relationships only when needed
- **Connection Pooling**: Reuse database connections

### **Storage Optimization**
- **JSONB Compression**: PostgreSQL compresses JSONB data
- **Index Size**: Monitor index growth and performance
- **Partitioning**: Consider table partitioning for large datasets

## Security Considerations

### **Data Protection**
- **Password Hashing**: bcrypt with salt
- **Input Validation**: Sanitize all user inputs
- **SQL Injection**: Use parameterized queries
- **Access Control**: Role-based permissions

### **Audit Trail**
- **Timestamps**: Track all data changes
- **User Tracking**: Log user actions
- **Data Integrity**: Foreign key constraints

## Alternatives Considered

### **Pure Relational Approach**
- **Rejected**: Too many tables for flexible Pokemon data
- **Reason**: Pokemon data structure varies and evolves

### **Pure NoSQL Approach**
- **Rejected**: Less ACID compliance for user data
- **Reason**: User data needs relational integrity

### **Separate Databases**
- **Rejected**: Added complexity for learning project
- **Reason**: Single database is simpler to manage

## Implementation Notes

### **Current Status**
- ✅ **Models Defined**: User and Pokemon models created
- ✅ **Relationships**: User-Pokemon many-to-many relationship
- ✅ **JSON Fields**: Pokemon data stored as JSONB
- [ ] **Migrations**: Database migration scripts needed
- [ ] **Indexes**: Performance indexes to be created
- [ ] **Seeding**: Initial data loading from PokeAPI

### **Next Steps**
1. **Create Migration Scripts**: Set up Flask-Migrate
2. **Add Indexes**: Create performance indexes
3. **Data Seeding**: Load initial Pokemon data
4. **Performance Testing**: Test query performance
5. **Caching Implementation**: Add Redis caching

## Review
This ADR will be reviewed after database implementation to ensure the design meets performance and scalability requirements.

## Related ADRs
- **ADR-001**: Technology Stack Selection
- **ADR-003**: API Design Patterns and Versioning Strategy (Pending)
- **ADR-004**: Security Implementation and Authentication Strategy (Pending)

