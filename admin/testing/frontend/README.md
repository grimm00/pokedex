# Frontend Testing Directory

This directory contains all frontend testing files and configurations for the Pokedex application.

## Structure

```
admin/testing/frontend/
├── README.md                           # This file
├── vitest.config.ts                    # Vitest configuration
├── test-utils/                         # Test utilities and setup
│   └── setup.ts
├── components/                         # Component tests
│   └── pokemon/
│       ├── PokemonCard.test.tsx
│       └── TypeBadge.test.tsx
└── pages/                             # Page tests
    └── PokemonPage.test.tsx
```

## Running Tests

From the project root:

```bash
# Run all frontend tests
cd frontend && npm test

# Run tests with UI
cd frontend && npm run test:ui

# Run tests with coverage
cd frontend && npm run test:coverage
```

## Test Configuration

- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Test Environment**: jsdom
- **Coverage**: Built-in Vitest coverage

## Test Files

### Component Tests
- `PokemonCard.test.tsx` - Tests for the Pokemon card component
- `TypeBadge.test.tsx` - Tests for the Pokemon type badge component

### Page Tests
- `PokemonPage.test.tsx` - Tests for the main Pokemon page

## Notes

- Test files are organized to match the frontend source structure
- All test utilities are centralized in the `test-utils/` directory
- Vitest configuration is included for running tests from this directory
