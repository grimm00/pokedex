# Development Guide

This guide provides comprehensive instructions for setting up, developing, and maintaining the Pokedex application.

## 🚀 Quick Start

### **Prerequisites**
- **Python 3.9+** - Backend development
- **Node.js 18+** - Frontend development
- **Docker & Docker Compose** - Containerization
- **Redis** - Caching system
- **Git** - Version control

### **One-Command Setup**
```bash
# Clone and setup everything
git clone <repository-url>
cd pokedex
./scripts/setup.sh
```

## 🏗️ Development Workflow

### **Backend Development**
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp ../env.example .env
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
# From project root
npm run dev  # Starts both backend and frontend
```

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
DATABASE_URL=sqlite:///pokedex_dev.db
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

**Last Updated**: October 1, 2025  
**Status**: ✅ Comprehensive Development Guide
