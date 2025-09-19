# Frontend Testing Documentation

## Overview
This directory contains frontend testing documentation, configurations, and reference materials for the Pokedex application. The actual test files are located in `frontend/src/__tests__/` and are run from the frontend directory.

## Structure
```
admin/testing/frontend/
├── README.md                           # This file
├── run-frontend-tests.sh               # Frontend test runner script
├── simple-frontend-test.sh             # Simple frontend accessibility test
├── vitest.config.ts                    # Vitest configuration reference
└── test-utils/                         # Test utilities reference
    └── setup.ts

frontend/src/__tests__/                 # ACTUAL TEST FILES (runnable)
├── components/                         # Component tests
│   └── pokemon/
│       ├── PokemonCard.test.tsx
│       ├── PokemonSearch.test.tsx
│       └── TypeBadge.test.tsx
├── pages/                             # Page tests
│   └── PokemonPage.test.tsx
└── test-utils/                        # Test utilities
    └── setup.ts
```

## Running Tests

### From Frontend Directory (Recommended)
```bash
# Navigate to frontend directory
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test PokemonSearch.test.tsx
```

### Using Test Runner Scripts
```bash
# From project root - run frontend tests
./admin/testing/frontend/run-frontend-tests.sh

# Simple accessibility test
./admin/testing/frontend/simple-frontend-test.sh
```

## Test Categories

### 1. Component Tests
- **Purpose**: Test individual React components in isolation
- **Location**: `frontend/src/__tests__/components/`
- **Examples**: 
  - `PokemonCard.test.tsx` - Tests Pokemon card rendering and interactions
  - `PokemonSearch.test.tsx` - Tests search functionality and debouncing
  - `TypeBadge.test.tsx` - Tests Pokemon type badge display

### 2. Page Tests
- **Purpose**: Test full page components with mocked data
- **Location**: `frontend/src/__tests__/pages/`
- **Examples**:
  - `PokemonPage.test.tsx` - Tests main Pokemon listing page

### 3. Integration Tests
- **Purpose**: Test component interactions and API integration
- **Location**: Mixed in component and page tests
- **Examples**: Search functionality, state management, API calls

## Configuration

### Vitest Configuration
- **File**: `frontend/vitest.config.ts` (actual config)
- **Reference**: `admin/testing/frontend/vitest.config.ts` (documentation)
- **Features**: TypeScript support, React Testing Library, JSDOM environment

### Test Setup
- **File**: `frontend/src/__tests__/test-utils/setup.ts`
- **Purpose**: Global test configuration and utilities
- **Features**: Custom matchers, mock setup, test helpers

## Test Data and Mocking

### Mock Data
- Pokemon data is mocked using realistic test data
- Store state is mocked using Zustand store mocks
- API calls are mocked using Vitest mocks

### Mocking Strategy
- **Components**: Mock external dependencies and props
- **Pages**: Mock store state and API responses
- **Integration**: Mock API calls but test real component interactions

## Best Practices

### Test Structure
- Use `describe` blocks to group related tests
- Use descriptive test names that explain the expected behavior
- Follow AAA pattern: Arrange, Act, Assert

### Mocking
- Mock at the boundary (API calls, external dependencies)
- Keep mocks simple and focused
- Use realistic test data

### Assertions
- Test user-visible behavior, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Test error states and edge cases

## Troubleshooting

### Common Issues
1. **Import errors**: Ensure test files are in `frontend/src/__tests__/`
2. **Mock errors**: Check that mocks are properly set up in test files
3. **TypeScript errors**: Ensure test files have proper type annotations

### Debugging
- Use `screen.debug()` to see rendered component
- Use `console.log()` for debugging test data
- Check browser console for additional error details

## Coverage Goals

- **Target**: >80% code coverage
- **Current**: Tracked via `npm run test:coverage`
- **Focus Areas**: Components, pages, utility functions

---
**Last Updated**: 2024-12-19  
**Maintained By**: AI Assistant