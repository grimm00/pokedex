# Development Environment Setup

## Overview
This document outlines the complete development environment setup for the Pokedex project, including all tools, configurations, and setup steps.

## Prerequisites
- Python 3.11+
- Node.js 18+
- Docker and Docker Compose
- Git
- PostgreSQL 14+
- VS Code (recommended)

## Backend Setup

### 1. Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables
Create `.env` file in project root:
```bash
# Database
DATABASE_URL=postgresql://localhost/pokedex_dev
TEST_DATABASE_URL=postgresql://localhost/pokedex_test

# Flask
SECRET_KEY=your-super-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=True

# External APIs
POKEAPI_BASE_URL=https://pokeapi.co/api/v2

# Redis (for caching)
REDIS_URL=redis://localhost:6379/0
```

### 3. Database Setup
```bash
# Create databases
createdb pokedex_dev
createdb pokedex_test

# Run migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 4. Development Tools
```bash
# Install development dependencies
pip install black flake8 pytest pytest-cov
pip install flask-restful flask-restx
pip install marshmallow
```

## Frontend Setup

### 1. Create Frontend Directory
```bash
# Create frontend with Vite
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install axios zustand
npm install @headlessui/react @heroicons/react
npm install tailwindcss @tailwindcss/forms

# Development dependencies
npm install -D @types/node
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### 3. Environment Configuration
Create `frontend/.env`:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Pokedex
```

## Docker Setup

### 1. Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
```

### 2. Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### 3. Docker Compose
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: pokedex_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/pokedex_dev
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Development Workflow

### 1. Code Quality Tools
```bash
# Backend linting
flake8 backend/
black backend/

# Frontend linting
npm run lint
npm run format
```

### 2. Testing
```bash
# Backend tests
pytest backend/tests/ --cov=backend/

# Frontend tests
npm run test
npm run test:coverage
```

### 3. Database Management
```bash
# Create migration
flask db migrate -m "Description of changes"

# Apply migration
flask db upgrade

# Rollback migration
flask db downgrade
```

## VS Code Configuration

### 1. Extensions
- Python
- Pylance
- Python Docstring Generator
- REST Client
- Thunder Client
- Docker
- GitLens

### 2. Settings (.vscode/settings.json)
```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/__pycache__": true,
    "**/.pytest_cache": true
  }
}
```

### 3. Launch Configuration (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Flask",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/app.py",
      "env": {
        "FLASK_ENV": "development",
        "FLASK_DEBUG": "1"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and accessible
2. **Port Conflicts**: Check if ports 5000, 3000, 5432 are available
3. **Virtual Environment**: Ensure venv is activated before running commands
4. **Dependencies**: Run `pip install -r requirements.txt` if import errors occur

### Health Checks
```bash
# Backend health
curl http://localhost:5000/

# Database connection
psql -h localhost -U postgres -d pokedex_dev -c "SELECT 1;"

# Frontend build
cd frontend && npm run build
```

## Next Steps
1. Set up this development environment
2. Test all components work together
3. Create initial database migrations
4. Begin Phase 2: Backend Development

