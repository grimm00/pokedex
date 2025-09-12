# Pokedex API

A comprehensive Pokemon API built with Flask, featuring real Pokemon data from PokeAPI, user authentication, and modern security practices. This project demonstrates full-stack development skills and production-ready backend architecture.

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
│   ├── routes/              # API endpoints (auth, pokemon, users)
│   ├── security.py          # Security features and rate limiting
│   ├── pokeapi_client.py    # PokeAPI integration client
│   └── pokemon_seeder.py    # Data seeding system
├── migrations/              # Database migrations (Flask-Migrate)
├── instance/                # SQLite database (not in git)
└── requirements.txt         # Python dependencies
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9 or higher
- Git
- Virtual environment (venv or conda)

### Quick Start

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

4. **Set up environment variables**
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

### Health Check
- `GET /` - API health status and version info

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
- [x] External API integration (PokeAPI with 20 Pokemon)
- [x] Backend testing (comprehensive test suite)
- [x] Security implementation (rate limiting, validation, audit logging)
- [x] Performance optimization (database indexes, query optimization)

### Phase 3: Frontend Development (Week 5-6)
- [ ] UI/UX design
- [ ] Component development
- [ ] State management
- [ ] Frontend testing

### Phase 4: DevOps & Deployment (Week 7-8)
- [ ] Containerization
- [ ] CI/CD pipeline setup
- [ ] Cloud deployment
- [ ] Monitoring setup

### Phase 5: Testing & Optimization (Week 9-10)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Load testing
- [ ] Documentation completion

## 🛠️ Technology Stack

### Backend
- **Language**: Python 3.9+
- **Framework**: Flask with Flask-RESTful
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy with Flask-Migrate
- **Authentication**: JWT with Flask-JWT-Extended
- **Security**: Flask-Limiter, bcrypt, comprehensive input validation
- **Testing**: pytest with Flask-Testing

### External Integrations
- **PokeAPI**: Real Pokemon data integration
- **Data Seeding**: Custom CLI tools for data management

### Development Tools
- **Version Control**: Git with feature branch workflow
- **Documentation**: Markdown with ADR (Architecture Decision Records)
- **Code Quality**: Comprehensive .gitignore, linting ready

## 📚 Learning Resources

- [Project Brainstorming](./admin/brainstorming.md) - Initial ideas and technical considerations
- [Development Roadmap](./admin/roadmap.md) - Detailed 10-week development plan
- [Development Rules](./admin/rules.txt) - Project guidelines and best practices

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

*This project is part of a DevOps apprenticeship program focused on learning the complete development lifecycle.*
