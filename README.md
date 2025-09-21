# Pokedex - Pokemon Database Application

A modern, full-stack Pokemon database application built with React, Flask, and Docker. Features real Pokemon data from PokeAPI, user authentication, favorites management, and comprehensive testing infrastructure.

## 🎯 Project Goals

This project serves as a hands-on learning experience for understanding:
- **Backend Development**: API design, database management, data modeling
- **Frontend Development**: Modern UI/UX, state management, responsive design
- **DevOps Practices**: CI/CD pipelines, containerization, monitoring, deployment
- **Full-Stack Integration**: End-to-end development workflow
- **Documentation**: Technical writing, API documentation, deployment guides

## 📁 Project Structure

```
pokedex/
├── admin/                    # Project planning and documentation
│   ├── planning/            # ADRs, roadmap, and project planning
│   ├── technical/           # Technical guides and implementation docs
│   ├── testing/             # Testing documentation and scripts
│   └── collaboration/       # Chat logs and collaboration history
├── backend/                 # Flask REST API
│   ├── models/              # SQLAlchemy models (Pokemon, User, Audit)
│   ├── routes/              # API endpoints (auth, pokemon, users, cache)
│   ├── services/            # Business logic services
│   │   ├── cache.py         # Redis caching system
│   │   ├── security.py      # Security features and rate limiting
│   │   └── pokeapi_client.py # PokeAPI integration client
│   ├── utils/               # Utility scripts and tools
│   │   ├── pokemon_seeder.py # Data seeding logic
│   │   └── seed_pokemon.py  # CLI entry point for seeding
│   ├── app.py               # Main Flask application
│   └── database.py          # Database configuration
├── frontend/                # React TypeScript Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   └── pokemon/     # Pokemon-specific components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── package.json         # Node.js dependencies
│   └── vite.config.ts       # Vite configuration
├── tests/                   # Centralized testing framework
│   ├── unit/                # Unit tests (frontend & backend)
│   ├── integration/         # Integration tests
│   ├── performance/         # Performance tests
│   └── docker/              # Docker testing environment
├── migrations/              # Database migrations (Flask-Migrate)
├── instance/                # SQLite database (not in git)
├── requirements.txt         # Python dependencies
├── package.json             # Root package.json for scripts
├── Dockerfile              # Container configuration
├── docker-compose.yml      # Multi-container setup
├── .dockerignore           # Docker build exclusions
└── .gitignore              # Git ignore rules
```

## 🚀 Getting Started

### Setup Options

We provide three different ways to set up the development environment:

1. **Automated Setup** (Recommended): One-command setup with automatic dependency installation
2. **Docker Setup**: Containerized environment for consistent development
3. **Manual Setup**: Step-by-step setup for full control

### Prerequisites
- Python 3.9 or higher
- Redis (for caching)
- Git
- Virtual environment (venv or conda)

### Quick Start

#### Option 1: Automated Setup (Recommended)
```bash
git clone https://github.com/yourusername/pokedex.git
cd pokedex
./setup.sh
```

#### Option 2: Docker Setup
```bash
git clone https://github.com/yourusername/pokedex.git
cd pokedex
docker-compose up --build
```

**Access the application:**
- **Full Application**: http://localhost (Frontend + API)
- **API Only**: http://localhost/api/v1/
- **Health check**: http://localhost/api/v1/health
- **API docs**: http://localhost/api/docs

**Test Docker Setup:**
```bash
./test-docker.sh
```

#### Option 3: Manual Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pokedex.git
   cd pokedex
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start Redis (for caching)**
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis
   
   # Verify Redis is running
   redis-cli ping
   ```

5. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python -m flask db upgrade
   python -m backend.seed_pokemon seed-range 1 20
   ```

6. **Run the application**
   ```bash
   python -m backend.app
   ```

7. **Test the API**
   ```bash
   curl http://localhost:5000/api/v1/pokemon
   ```

### Frontend Setup (React + TypeScript)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3001 (or 3000 if available)
   - Backend API: http://localhost:5000

### Full-Stack Development

To run both frontend and backend together:

1. **Terminal 1 - Backend**
   ```bash
   export DATABASE_URL="sqlite:///$(pwd)/instance/pokedex_dev.db"
   python3 -m backend.app
   ```

2. **Terminal 2 - Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Open http://localhost:3001 in your browser
   - The frontend will automatically connect to the backend API

## 🔌 API Endpoints

### Pokemon Endpoints
- `GET /api/v1/pokemon` - List all Pokemon (with pagination, search, filtering)
- `GET /api/v1/pokemon/{id}` - Get specific Pokemon details
- `GET /api/v1/pokemon?type=fire` - Filter by type
- `GET /api/v1/pokemon?search=char` - Search by name

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout

### User Endpoints
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/favorites` - Get user's favorite Pokemon
- `POST /api/v1/users/favorites/{pokemon_id}` - Add Pokemon to favorites
- `DELETE /api/v1/users/favorites/{pokemon_id}` - Remove Pokemon from favorites

### Cache Management Endpoints
- `GET /api/v1/cache/stats` - Redis cache statistics
- `GET /api/v1/cache/health` - Cache health check
- `DELETE /api/v1/cache/clear` - Clear all cache data
- `DELETE /api/v1/cache/pokemon/clear` - Clear Pokemon cache only

### Health Check
- `GET /` - API health status and version info (includes cache status)

## 📋 Development Phases

### Phase 1: Foundation & Planning ✅
- [x] Project architecture design
- [x] Technology stack selection
- [x] Development roadmap creation
- [x] Development environment setup
- [x] Git workflow establishment

### Phase 2: Backend Development ✅
- [x] Database design and setup (SQLite with migrations)
- [x] API development (Flask-RESTful with JWT auth)
- [x] External API integration (PokeAPI with 151 Pokemon)
- [x] Backend testing (40/40 tests passing - 100% coverage)
- [x] Security implementation (rate limiting, validation, audit logging)
- [x] Performance optimization (database indexes, query optimization)
- [x] Redis caching implementation (50-80% performance improvement)

### Phase 3: Frontend Development ✅
- [x] UI/UX design with modern React components
- [x] Component development (PokemonCard, PokemonSearch, Navigation, Dashboard)
- [x] State management with Zustand
- [x] Frontend testing (69/70 tests passing - 98.6% coverage)
- [x] Responsive design with Tailwind CSS
- [x] User authentication and favorites management

### Phase 4: Testing & Quality Assurance ✅
- [x] Comprehensive testing framework setup
- [x] Docker testing environment (100% backend, 98.6% frontend)
- [x] Integration testing with real data
- [x] Performance testing and optimization
- [x] Cross-browser compatibility testing

### Phase 5: DevOps & CI/CD (In Progress)
- [x] Containerization with Docker
- [x] Project structure cleanup and organization
- [ ] CI/CD pipeline setup with GitHub Actions
- [ ] Automated testing and deployment
- [ ] Production deployment and monitoring

### Phase 6: Production & Monitoring (Planned)
- [ ] Cloud deployment
- [ ] Monitoring and alerting setup
- [ ] Performance monitoring
- [ ] Documentation completion

## 🛠️ Technology Stack

### Backend
- **Language**: Python 3.13+
- **Framework**: Flask with Flask-RESTful
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy with Flask-Migrate
- **Authentication**: JWT with Flask-JWT-Extended
- **Security**: Flask-Limiter, bcrypt, comprehensive input validation
- **Testing**: pytest with Flask-Testing (40/40 tests passing)
- **Caching**: Redis for performance optimization

### Frontend
- **Language**: TypeScript
- **Framework**: React 18 with Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Testing**: Vitest with React Testing Library (69/70 tests passing)
- **Build Tool**: Vite for fast development and building

### DevOps & Testing
- **Containerization**: Docker with multi-stage builds
- **Testing**: Comprehensive test suite (109/110 tests passing)
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: Health checks and performance monitoring

### External Integrations
- **PokeAPI**: Real Pokemon data integration (151 Pokemon)
- **Data Seeding**: Custom CLI tools for data management

### Development Tools
- **Version Control**: Git with feature branch workflow
- **Documentation**: Markdown with comprehensive project docs
- **Code Quality**: ESLint, Prettier, comprehensive .gitignore

## 📚 Learning Resources

### **Project Documentation**
- [Project Brainstorming](./admin/planning/planning-notes/brainstorming.md) - Initial ideas and technical considerations
- [Development Roadmap](./admin/planning/roadmap.md) - Detailed 10-week development plan
- [Development Rules](./admin/collaboration/rules.md) - Project guidelines and best practices

### **Frontend Learning**
- [Frontend Design Document](./admin/planning/frontend-design.md) - Complete UI/UX design and technology deep dive
- **Vite** - Ultra-fast build tool and development server
- **Zustand** - Lightweight state management (2.9kb)
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible, unstyled React components

### **Backend Learning**
- [ADR-001: Technology Stack](./admin/planning/adrs/adr-001-technology-stack.md) - Backend technology decisions
- [ADR-002: Database Design](./admin/planning/adrs/adr-002-database-design.md) - Database schema and patterns
- [ADR-003: API Design](./admin/planning/adrs/adr-003-api-design-patterns.md) - RESTful API patterns
- [ADR-004: Security](./admin/planning/adrs/adr-004-security-implementation.md) - Security implementation
## 🤝 Contributing

This is a learning project, but contributions and suggestions are welcome! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## 📝 License

This project is for educational purposes. Pokemon data and images are property of Nintendo/Game Freak.

## 🎓 Learning Objectives

By the end of this project, you should have:
- [ ] Complete understanding of chosen technology stack
- [ ] Ability to deploy and maintain production systems
- [ ] Experience with CI/CD best practices
- [ ] Knowledge of monitoring and debugging
- [ ] Portfolio-ready project demonstrating full-stack skills

---

## 👨‍💻 Author

**grimm00** - [GitHub](https://github.com/grimm00)

*This project is part of a DevOps apprenticeship program focused on learning the complete development lifecycle.*
