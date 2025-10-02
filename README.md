# Pokehub - Your Pokemon Universe

A modern, full-stack Pokemon database application built with React, Flask, and Docker. Features 386 Pokemon from Generations 1-3 (Kanto, Johto, Hoenn), user authentication, favorites management, generation filtering, and comprehensive testing infrastructure.

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
│   ├── docs/                # Project status and maintenance docs
│   ├── planning/            # ADRs, roadmap, and project planning
│   │   ├── architecture/    # Architecture Decision Records (ADRs)
│   │   ├── phases/          # Development phase documentation
│   │   └── features/        # Feature planning and specifications
│   ├── technical/           # Technical guides and implementation docs
│   ├── testing/             # Testing documentation and scripts
│   └── chat-logs/           # Development session logs (2024-2025)
├── backend/                 # Flask REST API
│   ├── models/              # SQLAlchemy models (Pokemon, User, Audit)
│   ├── routes/              # API endpoints (auth, pokemon, users, cache)
│   ├── services/            # Business logic services
│   │   ├── cache.py         # Redis caching system
│   │   ├── pokeapi_client.py # PokeAPI integration client
│   │   └── security.py      # Security features and rate limiting
│   ├── utils/               # Utility scripts and tools
│   │   ├── pokemon_seeder.py # Data seeding logic (386 Pokemon)
│   │   ├── generation_config.py # Generation filtering configuration
│   │   └── validators.py    # Data validation utilities
│   ├── migrations/          # Database migrations (Flask-Migrate)
│   ├── instance/            # SQLite database (not in git)
│   ├── app.py               # Main Flask application
│   └── database.py          # Database configuration
├── frontend/                # React TypeScript Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── pokemon/     # Pokemon-specific components
│   │   │   │   ├── PokemonCard.tsx      # Individual Pokemon cards
│   │   │   │   ├── PokemonModal.tsx     # Pokemon detail modals
│   │   │   │   ├── PokemonSearch.tsx   # Search functionality
│   │   │   │   ├── GenerationFilter.tsx # Generation filtering
│   │   │   │   └── BulkSelection.tsx   # Bulk favorites operations
│   │   │   └── ui/          # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions (sprites, etc.)
│   ├── package.json         # Node.js dependencies
│   └── vite.config.ts       # Vite configuration
├── docs/                    # Documentation
│   ├── guides/              # Technical guides
│   │   └── docker-containerization-guide.md # Docker setup guide
│   └── syntax/              # Code syntax documentation
├── tests/                   # Centralized testing framework
│   ├── unit/                # Unit tests (frontend & backend)
│   ├── integration/         # Integration tests
│   ├── performance/         # Performance tests
│   ├── docker/              # Docker testing environment
│   └── run-tests.sh         # Unified test runner (see tests/README.md)
├── scripts/                 # Utility scripts (see scripts/README.md)
│   ├── setup.sh             # Initial project setup
│   ├── deploy.sh            # Deployment automation
│   ├── health-check.sh      # Health monitoring
│   └── test-*.sh            # Testing automation scripts
├── requirements.txt         # Python dependencies
├── package.json             # Root package.json for centralized scripts
├── Dockerfile              # Multi-stage container configuration
├── docker-compose.yml      # Multi-container setup
├── .dockerignore           # Docker build exclusions
└── .gitignore              # Git ignore rules
```

## ✨ Current Features

### 🎮 **Pokemon Database**
- **386 Pokemon**: Complete Generations 1-3 (Kanto, Johto, Hoenn)
- **Generation Filtering**: Filter by Kanto, Johto, or Hoenn regions
- **Advanced Search**: Search by name, type, and generation
- **Pagination**: Efficient loading with "Load More" functionality
- **Detailed Views**: Comprehensive Pokemon information with stats, abilities, and types

### 🔐 **User Management**
- **JWT Authentication**: Secure user registration and login
- **Favorites System**: Add/remove Pokemon to/from favorites
- **Bulk Operations**: Select multiple Pokemon for bulk favorites management
- **User Profiles**: Personal dashboard and preferences

### 🎨 **User Interface**
- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **Animated Sprites**: Static and animated Pokemon sprites from PokeAPI
- **Interactive Cards**: Hover effects and type-based color schemes
- **Modal Details**: Detailed Pokemon information in elegant modals
- **Skeleton Loading**: Smooth loading states and transitions

### 🚀 **Performance & Reliability**
- **Redis Caching**: 50-80% performance improvement
- **Database Optimization**: Indexed queries and efficient pagination
- **Health Monitoring**: Comprehensive health checks and monitoring
- **Error Handling**: Graceful error handling and user feedback

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

> 📖 **For detailed development instructions**, see [DEVELOPMENT.md](DEVELOPMENT.md) - comprehensive guide covering setup, testing, debugging, and deployment.

#### Option 2: Docker Setup
```bash
git clone https://github.com/yourusername/pokedex.git
cd pokedex
docker compose up --build
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

## 🌳 Development Workflow

We use **Git Flow** for organized development:

```
main (production) ← develop (integration) ← feat/* (features)
```

**Quick Start:**
```bash
# Start new feature
./scripts/git-flow-helper.sh start-feature my-feature

# Check status  
./scripts/git-flow-helper.sh status
```

> 📖 **For detailed workflow and contributing guidelines**, see [CONTRIBUTING.md](CONTRIBUTING.md)

## 🔌 API Endpoints

### Pokemon Endpoints
- `GET /api/v1/pokemon` - List all Pokemon (with pagination, search, filtering)
- `GET /api/v1/pokemon/{id}` - Get specific Pokemon details
- `GET /api/v1/pokemon?type=fire` - Filter by type
- `GET /api/v1/pokemon?search=char` - Search by name
- `GET /api/v1/pokemon?generation=2` - Filter by generation (1=Kanto, 2=Johto, 3=Hoenn)
- `GET /api/v1/pokemon/generations` - Get all available generations

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
- [x] External API integration (PokeAPI with 386 Pokemon - Generations 1-3)
- [x] Backend testing (40/40 tests passing - 100% coverage)
- [x] Security implementation (rate limiting, validation, audit logging)
- [x] Performance optimization (database indexes, query optimization)
- [x] Redis caching implementation (50-80% performance improvement)

### Phase 3: Frontend Development ✅
- [x] UI/UX design with modern React components
- [x] Component development (PokemonCard, PokemonModal, PokemonSearch, GenerationFilter, BulkSelection)
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
- **PokeAPI**: Real Pokemon data integration (386 Pokemon - Generations 1-3)
- **Data Seeding**: Custom CLI tools for data management

### Development Tools
- **Version Control**: Git with feature branch workflow
- **Documentation**: Markdown with comprehensive project docs
- **Code Quality**: ESLint, Prettier, comprehensive .gitignore

## 📚 Learning Resources

### **Project Documentation**
- [Project Brainstorming](./admin/docs/planning-notes/brainstorming.md) - Initial ideas and technical considerations
- [Development Roadmap](./admin/docs/roadmap.md) - Detailed 10-week development plan
- [Development Rules](./admin/docs/rules.md) - Project guidelines and best practices

### **Frontend Learning**
- [Frontend Design Document](./admin/docs/features/frontend-design.md) - Complete UI/UX design and technology deep dive
- **Vite** - Ultra-fast build tool and development server
- **Zustand** - Lightweight state management (2.9kb)
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible, unstyled React components

### **Backend Learning**
- [ADR-001: Technology Stack](./admin/docs/architecture/adrs/adr-001-technology-stack.md) - Backend technology decisions
- [ADR-002: Database Design](./admin/docs/architecture/adrs/adr-002-database-design.md) - Database schema and patterns
- [ADR-003: API Design](./admin/docs/architecture/adrs/adr-003-api-design-patterns.md) - RESTful API patterns
- [ADR-004: Security](./admin/docs/architecture/adrs/adr-004-security-implementation.md) - Security implementation
- [ADR-005: PokeAPI Integration](./admin/docs/architecture/adrs/adr-005-pokeapi-integration-strategy.md) - PokeAPI integration strategy
- [ADR-006: Deployment Strategy](./admin/docs/architecture/adrs/adr-006-deployment-strategy.md) - Deployment and CI/CD strategy
## 🤝 Contributing

Contributions are welcome! This is a learning project focused on full-stack development best practices.

**Quick Start:**
1. Fork the repository
2. Use our Git Flow: `./scripts/git-flow-helper.sh start-feature your-feature`
3. Make changes and test thoroughly
4. Create PR to `develop` branch

> 📖 **For detailed guidelines, workflow, and setup**, see [CONTRIBUTING.md](CONTRIBUTING.md)

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
