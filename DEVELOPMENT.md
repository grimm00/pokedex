# Development Guide

This guide provides comprehensive instructions for setting up, developing, and maintaining the Pokedex application.

## 🚀 Quick Start

### **Prerequisites**

**Required:**
- **Python 3.9+** - Backend development
- **Node.js 18+** - Frontend development
- **Docker & Docker Compose** - Containerization
- **Redis** - Caching system
- **Git** - Version control

**Optional (Performance Optimization):**
- **jq** - JSON processor for GitHub API operations
  - Provides 20x faster branch cleanup (1 API call vs N calls)
  - Install: `brew install jq` (macOS), `apt-get install jq` (Linux)
  - Falls back to slower method if not installed

### **One-Command Setup**
```bash
# Clone and setup everything
git clone <repository-url>
cd pokedex

# Set up environment
cp env.example .env
# Edit .env with your configuration

# Install dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
```

## 🏗️ Development Workflow

### **Backend Development**
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp env.example .env
# Edit .env with your configuration

# Initialize database
python -m flask db upgrade

# Seed Pokemon data (386 Pokemon)
python -c "from app import app; from utils.pokemon_seeder import pokemon_seeder; app.app_context().push(); pokemon_seeder.seed_all_generations()"

# Start development server
python -m flask --app app run --debug
```

### **Frontend Development**
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Full-Stack Development**
```bash
# Backend (from project root)
python -m backend.app

# Frontend (use alias or direct command)
pokedex-frontend  # or: cd frontend && npm run dev
```

## ⚡ Performance Optimization

### **GitHub API Operations**

The project includes optimized GitHub API operations for branch cleanup:

**With `jq` installed (Recommended):**
- **Performance**: 20x faster cleanup
- **API Calls**: 1 call (batched) vs N calls (individual)
- **Time**: ~0.5s regardless of branch count
- **Rate Limiting**: 95% reduction in API usage

**Without `jq` (Fallback):**
- **Performance**: Slower but functional
- **API Calls**: 1 call per branch
- **Time**: ~500ms per branch
- **Compatibility**: Works everywhere

**Install jq for optimal performance:**
```bash
# macOS
brew install jq

# Linux
apt-get install jq

# Windows
choco install jq
```

**Automatic Detection:**
The workflow helper automatically detects `jq` availability and uses the fastest method available. You'll see:
- `🚀 Using batched GitHub API calls (faster)` - when jq is available
- `⚠️  Using individual API calls (slower)` - fallback mode

**Performance Comparison:**
| Branches | Without jq | With jq | Improvement |
|----------|------------|---------|-------------|
| 5        | ~2.5s      | ~0.5s   | 5x faster   |
| 10       | ~5s        | ~0.5s   | 10x faster  |
| 20       | ~10s       | ~0.5s   | 20x faster  |
| 50       | ~25s       | ~0.5s   | 50x faster  |

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
pytest                    # Run all tests
pytest --cov=backend     # Run with coverage
pytest tests/api/        # Run API tests only
```

### **Frontend Testing**
```bash
cd frontend
npm test                 # Run all tests
npm run test:coverage    # Run with coverage
npm run test:ui          # Run in UI mode
```

### **Integration Testing**
```bash
# From project root
./scripts/test-phase4b-comprehensive.sh
```

## 🐳 Docker Development

### **Development Environment**
```bash
# Start all services
docker compose up --build

# Start specific services
docker compose up backend frontend redis

# View logs
docker compose logs -f backend
```

### **Testing with Docker**
```bash
# Run tests in containers
docker compose -f tests/docker/docker-compose.test.yml up --build
```

## 📊 Database Management

### **Migrations**
```bash
cd backend

# Create new migration
python -m flask db migrate -m "Description"

# Apply migrations
python -m flask db upgrade

# Rollback migration
python -m flask db downgrade
```

### **Data Seeding**
```bash
# Seed all Pokemon (386 total)
python -c "from app import app; from utils.pokemon_seeder import pokemon_seeder; app.app_context().push(); pokemon_seeder.seed_all_generations()"

# Seed specific generation
python -c "from app import app; from utils.pokemon_seeder import pokemon_seeder; app.app_context().push(); pokemon_seeder.seed_johto_pokemon()"
```

## 🔧 Configuration

### **Environment Variables**
```bash
# Backend (.env)
DATABASE_URL=sqlite:///backend/instance/pokedex_dev.db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
FLASK_ENV=development

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000
```

### **Development Tools**
- **Backend**: Black (formatting), Flake8 (linting), Pytest (testing)
- **Frontend**: ESLint (linting), Prettier (formatting), Vitest (testing)

## 🚀 Deployment

### **Local Production Build**
```bash
# Build frontend
cd frontend && npm run build

# Start production backend
cd backend && gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### **Docker Production**
```bash
# Build and run production containers
docker compose -f docker-compose.prod.yml up --build
```

## 📝 Code Standards

### **Backend (Python)**
- **Formatting**: Black
- **Linting**: Flake8
- **Testing**: Pytest with coverage
- **Documentation**: Docstrings for all functions

### **Frontend (TypeScript)**
- **Formatting**: Prettier
- **Linting**: ESLint
- **Testing**: Vitest with React Testing Library
- **Documentation**: JSDoc comments

## 🔍 Debugging

### **Backend Debugging**
```bash
# Enable debug mode
export FLASK_DEBUG=1
python -m flask --app app run

# Use debugger
import pdb; pdb.set_trace()
```

### **Frontend Debugging**
```bash
# Development server with source maps
npm run dev

# Browser DevTools
# - React DevTools extension
# - Redux DevTools (if using Redux)
```

## 📚 Learning Resources

### **Backend Learning**
- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pytest Documentation](https://docs.pytest.org/)

### **Frontend Learning**
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)

### **DevOps Learning**
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🆘 Troubleshooting

### **Common Issues**

**Backend won't start:**
```bash
# Check Python version
python --version

# Reinstall dependencies
pip install -r requirements.txt

# Check database
python -m flask db upgrade
```

**Frontend won't start:**
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version
```

**Docker issues:**
```bash
# Clean Docker
docker system prune -a

# Rebuild containers
docker compose down
docker compose up --build
```

## 📞 Getting Help

- **Documentation**: Check `admin/docs/` for detailed guides
- **Issues**: Create GitHub issues for bugs or questions
- **Chat Logs**: Review `admin/chat-logs/` for similar problems
- **Status**: Check `admin/docs/PROJECT_STATUS_DASHBOARD.md`

---

## 🎯 Quick Commands

### **Development Aliases**
```bash
# Use the pokedex-frontend alias (if configured)
pokedex-frontend

# Or run directly
cd frontend && npm run dev
```

### **Backend Commands**
```bash
# From project root
python -m backend.app

# Or from backend directory
cd backend && python -m app
```

---

**Last Updated**: October 1, 2025  
**Status**: ✅ Comprehensive Development Guide (Updated for v1.1.1)
