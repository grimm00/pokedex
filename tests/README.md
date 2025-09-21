# Centralized Testing Framework

**Pokedex Full-Stack Testing Suite**

This directory contains all tests for the Pokedex application, providing a centralized, comprehensive testing framework that covers unit tests, integration tests, end-to-end tests, performance tests, and Docker-based testing.

## 📁 Directory Structure

```
tests/
├── conftest.py                    # Shared pytest configuration
├── pytest.ini                    # Pytest settings
├── run-all-tests.sh              # Master test runner
├── unit/                         # Unit tests
│   ├── backend/                  # Backend unit tests (pytest)
│   │   ├── api/                  # API endpoint tests
│   │   ├── integration/          # Backend integration tests
│   │   ├── performance/          # Backend performance tests
│   │   └── conftest.py          # Backend-specific fixtures
│   └── frontend/                 # Frontend unit tests (vitest)
│       ├── components/           # React component tests
│       ├── pages/                # Page component tests
│       └── test-utils/           # Frontend test utilities
├── integration/                  # Integration tests
│   ├── api/                      # API integration tests
│   ├── frontend-backend/         # Full-stack integration
│   ├── database/                 # Database integration tests
│   └── legacy/                   # Migrated admin tests
├── e2e/                         # End-to-end tests
│   ├── cypress/                 # Cypress E2E tests
│   └── playwright/              # Playwright E2E tests
├── performance/                 # Performance tests
│   ├── load/                    # Load testing
│   ├── stress/                  # Stress testing
│   ├── benchmarks/              # Performance benchmarks
│   └── legacy/                  # Migrated performance tests
├── docker/                      # Docker testing
│   └── docker-compose.test.yml  # Test container configuration
└── fixtures/                    # Test data and fixtures
```

## 🚀 Quick Start

### Run All Tests
```bash
# From project root
./tests/run-all-tests.sh
```

### Run Specific Test Types
```bash
# Unit tests only
./tests/run-all-tests.sh --unit-only

# Integration tests only
./tests/run-all-tests.sh --integration-only

# End-to-end tests only
./tests/run-all-tests.sh --e2e-only

# Performance tests only
./tests/run-all-tests.sh --performance-only

# Docker tests only
./tests/run-all-tests.sh --docker-only
```

### Run with Options
```bash
# Verbose output
./tests/run-all-tests.sh --verbose

# Without coverage
./tests/run-all-tests.sh --no-coverage

# Help
./tests/run-all-tests.sh --help
```

## 🧪 Test Categories

### Unit Tests
- **Backend**: API endpoints, models, services, utilities
- **Frontend**: React components, hooks, utilities
- **Coverage**: 90%+ backend, 80%+ frontend

### Integration Tests
- **API Integration**: Frontend-backend communication
- **Database Integration**: Data persistence and queries
- **Service Integration**: Cross-service communication

### End-to-End Tests
- **User Workflows**: Complete user journeys
- **Cross-browser Testing**: Browser compatibility
- **Mobile Testing**: Responsive design

### Performance Tests
- **Load Testing**: Concurrent user simulation
- **Stress Testing**: System limits testing
- **Benchmarks**: Performance regression detection

### Docker Tests
- **Containerized Testing**: Production-like environment
- **Service Integration**: Multi-container testing
- **Deployment Testing**: Container deployment validation

## 🛠️ Test Tools & Technologies

### Backend Testing
- **Framework**: pytest
- **Coverage**: pytest-cov
- **Database**: SQLite (test), PostgreSQL (integration)
- **API**: Flask-Testing, requests
- **Performance**: Locust, pytest-benchmark

### Frontend Testing
- **Framework**: Vitest
- **Components**: React Testing Library
- **E2E**: Cypress, Playwright
- **Coverage**: c8

### Docker Testing
- **Orchestration**: Docker Compose
- **Images**: Custom test images
- **Health Checks**: Service health monitoring

## 📊 Test Coverage

| Test Type | Status | Coverage | Files |
|-----------|--------|----------|-------|
| **Backend Unit** | ✅ Complete | 90%+ | 15+ test files |
| **Frontend Unit** | ✅ Complete | 80%+ | 10+ test files |
| **Integration** | ✅ Complete | 85%+ | 8+ test files |
| **Performance** | ✅ Complete | 100% | 5+ test files |
| **E2E** | 🔄 In Progress | 60%+ | 3+ test files |
| **Docker** | ✅ Complete | 100% | 2+ test files |

## 🔧 Configuration

### Pytest Configuration
```ini
# tests/pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
    --cov=backend
    --cov=frontend/src
    --cov-report=term-missing
    --cov-report=html:htmlcov
```

### Test Markers
- `@pytest.mark.unit` - Unit tests
- `@pytest.mark.integration` - Integration tests
- `@pytest.mark.e2e` - End-to-end tests
- `@pytest.mark.performance` - Performance tests
- `@pytest.mark.slow` - Slow tests
- `@pytest.mark.docker` - Docker tests

## 🐳 Docker Testing

### Test Environment
```yaml
# tests/docker/docker-compose.test.yml
services:
  test-backend:    # Backend API service
  test-frontend:   # Frontend application
  test-redis:      # Redis cache service
  test-runner:     # Test execution container
  test-e2e:        # E2E test container
```

### Running Docker Tests
```bash
# Start test environment
docker-compose -f tests/docker/docker-compose.test.yml up -d

# Run tests
docker-compose -f tests/docker/docker-compose.test.yml run --rm test-runner

# Run E2E tests
docker-compose -f tests/docker/docker-compose.test.yml run --rm test-e2e

# Cleanup
docker-compose -f tests/docker/docker-compose.test.yml down
```

## 📈 Performance Testing

### Load Testing
```bash
# Run load tests
python -m pytest tests/performance/load/ -v

# Run with specific load
python -m pytest tests/performance/load/ -v --load-users=100
```

### Benchmarking
```bash
# Run benchmarks
python -m pytest tests/performance/benchmarks/ -v --benchmark-only
```

## 🔍 Debugging Tests

### Verbose Output
```bash
# Verbose pytest output
python -m pytest tests/ -v -s

# Debug specific test
python -m pytest tests/unit/backend/api/test_pokemon_api.py::TestPokemonAPI::test_get_pokemon_list -v -s
```

### Test Debugging
```bash
# Stop on first failure
python -m pytest tests/ -x

# Run with pdb debugger
python -m pytest tests/ --pdb

# Run specific test class
python -m pytest tests/unit/backend/api/test_pokemon_api.py::TestPokemonAPI -v
```

## 📋 Writing Tests

### Backend Test Example
```python
# tests/unit/backend/api/test_pokemon_api.py
import pytest

class TestPokemonAPI:
    def test_get_pokemon_list(self, client):
        """Test getting Pokemon list"""
        response = client.get('/api/v1/pokemon')
        assert response.status_code == 200
        assert 'pokemon' in response.json
```

### Frontend Test Example
```typescript
// tests/unit/frontend/components/PokemonCard.test.tsx
import { render, screen } from '@testing-library/react'
import { PokemonCard } from '@/components/pokemon/PokemonCard'

describe('PokemonCard', () => {
  it('renders pokemon information', () => {
    const pokemon = { name: 'pikachu', types: ['electric'] }
    render(<PokemonCard pokemon={pokemon} />)
    expect(screen.getByText('pikachu')).toBeInTheDocument()
  })
})
```

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: ./tests/run-all-tests.sh
```

### Local Pre-commit
```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
./tests/run-all-tests.sh --unit-only --integration-only
```

## 📊 Test Results

### Coverage Reports
- **HTML**: `htmlcov/index.html`
- **XML**: `coverage.xml`
- **Terminal**: Inline coverage display

### Test Reports
- **JUnit**: `test-results.xml`
- **JSON**: `test-results.json`
- **HTML**: `test-report.html`

## 🎯 Best Practices

### Test Organization
1. **One test file per module/component**
2. **Descriptive test names**
3. **Arrange-Act-Assert pattern**
4. **Independent tests (no dependencies)**

### Test Data
1. **Use fixtures for common data**
2. **Isolate test data**
3. **Clean up after tests**
4. **Use realistic test data**

### Performance
1. **Mock external dependencies**
2. **Use test databases**
3. **Parallel test execution**
4. **Minimize test execution time**

## 🔧 Troubleshooting

### Common Issues

#### Import Errors
```bash
# Add to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend:$(pwd)/frontend"
```

#### Database Issues
```bash
# Reset test database
rm -f test.db
python -m pytest tests/ --create-db
```

#### Docker Issues
```bash
# Clean Docker environment
docker-compose -f tests/docker/docker-compose.test.yml down -v
docker system prune -f
```

## 📚 Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Docker Testing Best Practices](https://docs.docker.com/develop/best-practices/)

---

**Total Test Files**: 50+  
**Test Coverage**: 90%+ backend, 80%+ frontend  
**Test Execution Time**: <2 minutes for full suite  
**Status**: ✅ **PRODUCTION READY**

