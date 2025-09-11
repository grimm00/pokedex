# Test Data

This directory contains test data, fixtures, and sample data for the Pokedex project.

## 📁 Directory Structure

```
test-data/
├── README.md              # This file
├── sample-data/          # Sample data files
│   ├── pokemon.json      # Sample Pokemon data (future)
│   ├── users.json        # Sample user data (future)
│   └── favorites.json    # Sample favorites data (future)
├── fixtures/             # Database fixtures
│   ├── pokemon.sql       # Pokemon table fixtures (future)
│   ├── users.sql         # User table fixtures (future)
│   └── relationships.sql # Relationship fixtures (future)
└── mock-responses/       # Mock API responses
    ├── pokeapi/          # PokeAPI mock responses (future)
    └── auth/             # Authentication mock responses (future)
```

## 🎯 Purpose

This directory will contain:
- **Sample Data**: Realistic test data for development and testing
- **Fixtures**: Database seed data for consistent testing
- **Mock Responses**: Simulated API responses for offline testing
- **Test Scenarios**: Predefined test cases and data sets

## 📊 Current Status

### ✅ Available
- Directory structure created
- Documentation framework in place

### 🔄 Planned
- [ ] Sample Pokemon data from PokeAPI
- [ ] Test user accounts with different roles
- [ ] Database fixtures for consistent testing
- [ ] Mock PokeAPI responses for offline testing
- [ ] Performance test data sets
- [ ] Edge case test scenarios

## 🚀 Future Implementation

### Sample Pokemon Data
```json
{
  "pokemon": [
    {
      "id": 1,
      "pokemon_id": 1,
      "name": "bulbasaur",
      "height": 7,
      "weight": 69,
      "base_experience": 64,
      "types": ["grass", "poison"],
      "abilities": ["overgrow", "chlorophyll"],
      "stats": {
        "hp": 45,
        "attack": 49,
        "defense": 49,
        "special-attack": 65,
        "special-defense": 65,
        "speed": 45
      },
      "sprites": {
        "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
      }
    }
  ]
}
```

### Test User Accounts
```json
{
  "users": [
    {
      "username": "testuser",
      "email": "test@example.com",
      "password": "testpass123",
      "is_admin": false
    },
    {
      "username": "admin",
      "email": "admin@example.com",
      "password": "adminpass123",
      "is_admin": true
    }
  ]
}
```

### Database Fixtures
```sql
-- Pokemon fixtures
INSERT INTO pokemon (pokemon_id, name, height, weight, base_experience, types, abilities, stats, sprites) VALUES
(1, 'bulbasaur', 7, 69, 64, '["grass", "poison"]', '["overgrow", "chlorophyll"]', '{"hp": 45, "attack": 49, "defense": 49, "special-attack": 65, "special-defense": 65, "speed": 45}', '{"front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"}');

-- User fixtures
INSERT INTO users (username, email, password_hash, is_admin) VALUES
('testuser', 'test@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5Qz8K2', false),
('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5Qz8K2', true);
```

## 🔧 Usage

### Loading Test Data
```bash
# Load Pokemon data
python -c "
import json
with open('test-data/sample-data/pokemon.json') as f:
    data = json.load(f)
    # Load into database
"

# Load user fixtures
psql -d pokedex_dev -f test-data/fixtures/users.sql
```

### Using Mock Responses
```python
# Load mock PokeAPI response
with open('test-data/mock-responses/pokeapi/bulbasaur.json') as f:
    mock_response = json.load(f)
    # Use in tests
```

## 📚 Related Documentation

- [Test Scripts](../test-scripts/README.md)
- [Test Results](../test-results/test-execution-summary.md)
- [Testing Overview](../README.md)
- [Database Design](../../planning/adrs/adr-002-database-design.md)


