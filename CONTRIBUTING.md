# Contributing to Pokehub

Thank you for your interest in contributing to Pokehub! This project is designed as a learning experience for full-stack development, and contributions are welcome.

## 🌳 Git Flow Workflow

We use **Git Flow** for organized development and stable releases:

### Branch Structure
```
main (production-ready)
├── develop (integration branch)
    ├── feat/* (feature branches)
    ├── fix/* (bug fix branches)
    └── chore/* (maintenance branches)
```

### Git Flow Helper Script

We provide a helper script to streamline the workflow:

```bash
# Start new feature
./scripts/git-flow-helper.sh start-feature user-authentication

# Start bug fix
./scripts/git-flow-helper.sh start-fix search-performance

# Start hotfix (critical production fix)
./scripts/git-flow-helper.sh start-hotfix security-patch

# Prepare release
./scripts/git-flow-helper.sh prepare-release 1.3.0

# Check current status
./scripts/git-flow-helper.sh status

# Sync develop with main
./scripts/git-flow-helper.sh sync-develop
```

## 🚀 Development Workflow

### 1. **Feature Development**
```bash
# Start from develop
./scripts/git-flow-helper.sh start-feature my-awesome-feature

# Work on your feature...
git add .
git commit -m "feat: implement awesome feature"
git push origin feat/my-awesome-feature

# Create PR: feat/my-awesome-feature → develop
```

### 2. **Bug Fixes**
```bash
# Start from develop
./scripts/git-flow-helper.sh start-fix broken-search

# Fix the issue...
git add .
git commit -m "fix: resolve search functionality"
git push origin fix/broken-search

# Create PR: fix/broken-search → develop
```

### 3. **Release Process**
```bash
# Prepare release in develop
./scripts/git-flow-helper.sh prepare-release 1.3.0

# Create PR: develop → main
# After merge to main, tag the release:
git checkout main
git pull origin main
git tag -a v1.3.0 -m "Release v1.3.0"
git push origin v1.3.0
```

### 4. **Hotfixes (Production Issues)**
```bash
# Critical fix needed in production
./scripts/git-flow-helper.sh start-hotfix critical-security-fix

# Fix the issue...
git add .
git commit -m "fix: resolve critical security vulnerability"
git push origin fix/critical-security-fix

# Create PR: fix/critical-security-fix → main
# After merge, also merge to develop to keep branches in sync
```

## 🤝 How to Contribute

### Reporting Issues
- Use GitHub Issues to report bugs or suggest features
- Provide clear descriptions and steps to reproduce issues
- Include relevant logs and environment details

### Code Contributions
1. **Fork the repository** and clone your fork
2. **Set up development environment**: `./setup.sh`
3. **Follow our Git Flow**: Use `./scripts/git-flow-helper.sh start-feature your-feature-name`
4. **Make your changes** following our coding conventions
5. **Add tests** for new functionality
6. **Test thoroughly**: Ensure all tests pass
7. **Follow conventional commits**: Use clear, descriptive commit messages
8. **Create Pull Request** to the `develop` branch

## 🔧 Development Setup for Contributors

```bash
# 1. Fork and clone
git clone https://github.com/yourusername/pokehub.git
cd pokehub

# 2. Set up development environment
./setup.sh

# 3. Start working on a feature
./scripts/git-flow-helper.sh start-feature my-contribution

# 4. Make changes and test
npm test  # Frontend tests
cd backend && pytest  # Backend tests

# 5. Commit and push
git add .
git commit -m "feat: add amazing new feature"
git push origin feat/my-contribution

# 6. Create PR to develop branch
```

## 📋 Branch Protection & CI/CD

- **`main`**: Protected, requires PR + CI passing
- **`develop`**: Protected, requires PR + CI passing  
- **Feature branches**: Automatically tested on push
- **All branches**: Must pass comprehensive test suite (unit, integration, performance, Docker)

## 📝 Commit Message Convention

We follow **conventional commits** for clear history:

```bash
feat: add new Pokemon search functionality
fix: resolve database connection timeout
docs: update API documentation
chore: bump version to 1.3.0
test: add integration tests for favorites
refactor: optimize Pokemon data loading
perf: improve query performance with indexes
style: fix code formatting
```

### Commit Types:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

## 🧪 Testing Requirements

All contributions must include appropriate tests:

### Frontend Testing
```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Coverage report
```

### Backend Testing
```bash
cd backend
pytest                    # Run all tests
pytest --cov             # With coverage
pytest tests/unit/        # Unit tests only
pytest tests/integration/ # Integration tests only
```

### Docker Testing
```bash
cd tests/docker
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

## 📚 Development Guidelines

### Code Style

#### Python (Backend)
- Follow **PEP 8** for Python code
- Use **type hints** for function parameters and returns
- Add **docstrings** to functions and classes
- Keep functions **small and focused**
- Use **meaningful variable names**

#### TypeScript (Frontend)
- Follow **ESLint** configuration
- Use **TypeScript interfaces** for data structures
- Implement **proper error handling**
- Use **React hooks** appropriately
- Follow **component composition** patterns

#### General
- Write **self-documenting code**
- Add **comments for complex logic**
- Keep **functions under 20 lines** when possible
- Use **consistent naming conventions**

### Testing Guidelines
- **Write tests first** (TDD approach encouraged)
- **Test edge cases** and error conditions
- **Mock external dependencies** appropriately
- **Aim for 90%+ test coverage**
- **Write integration tests** for API endpoints

### Documentation
- Update **README.md** for significant changes
- Add **docstrings** to new functions
- Update **API documentation** if endpoints change
- Include **examples** in documentation
- Keep **CHANGELOG.md** updated

## 🎯 Project Goals

This project focuses on:
- **Learning**: Full-stack development skills
- **Best Practices**: Clean code, testing, documentation
- **Real-world Skills**: Production-ready backend development

## 📋 Development Setup

See the main [README.md](README.md) for setup instructions.

## 🐛 Bug Reports

When reporting bugs, please include:
- Python version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Relevant error messages

## 💡 Feature Requests

Feature requests are welcome! Please:
- Check existing issues first
- Provide clear use cases
- Explain the expected behavior
- Consider the project's learning goals

## 📝 License

This project is for educational purposes. By contributing, you agree that your contributions will be licensed under the same terms as the project.

## 🎓 Learning Focus

This project emphasizes:
- **Backend Development**: API design, database management
- **Security**: Authentication, authorization, input validation
- **Testing**: Unit tests, integration tests, test-driven development
- **Documentation**: Technical writing, API documentation
- **DevOps**: Version control, deployment, monitoring

Thank you for contributing to this learning project! 🚀
