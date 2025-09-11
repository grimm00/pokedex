# Test Scripts

This directory contains executable scripts for testing the Pokedex API.

## 📁 Files

### `test_app.py`
**Purpose**: SQLite-based test application for validating Flask-RESTful API and JWT authentication

**Features**:
- Temporary SQLite database (no external dependencies)
- All Flask-RESTful routes and models
- JWT authentication system
- Background execution support
- Comprehensive error handling

**Usage**:
```bash
# Direct execution
python test_app.py

# Background execution
./run_test.sh
```

### `run_test.sh`
**Purpose**: Background test runner with proper process management

**Features**:
- Kills existing test processes
- Runs server in background with `nohup`
- Redirects output to log file
- Provides PID for process management
- Port conflict resolution (uses 5001)

**Usage**:
```bash
# Start test server
./run_test.sh

# Stop test server
kill <PID>

# View logs
tail -f test_server.log
```

## 🚀 Quick Start

### 1. Start Test Server
```bash
cd admin/testing/test-scripts/
./run_test.sh
```

### 2. Test Endpoints
```bash
# Health check
curl http://localhost:5001/

# API version
curl http://localhost:5001/api/version

# Pokemon list
curl http://localhost:5001/api/v1/pokemon

# User registration
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}' \
  http://localhost:5001/api/v1/auth/register

# User login
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  http://localhost:5001/api/v1/auth/login
```

### 3. Stop Test Server
```bash
# Find PID
ps aux | grep test_app.py

# Kill process
kill <PID>
```

## 🔧 Configuration

### Port Configuration
- **Default Port**: 5001 (avoids macOS AirPlay conflict on 5000)
- **Change Port**: Edit `test_app.py` line 334

### Database Configuration
- **Type**: SQLite (temporary file)
- **Location**: `/tmp/tmpXXXXXX` (auto-generated)
- **Cleanup**: Automatic on shutdown

### Logging Configuration
- **Log File**: `test_server.log`
- **Level**: DEBUG
- **Format**: Flask default

## 📊 Test Coverage

### Endpoints Tested
- ✅ `GET /` - Health check
- ✅ `GET /api/version` - API version info
- ✅ `GET /api/v1/pokemon` - Pokemon list
- ✅ `GET /api/v1/pokemon/<id>` - Pokemon detail
- ✅ `POST /api/v1/auth/register` - User registration
- ✅ `POST /api/v1/auth/login` - User login
- ✅ `GET /api/v1/auth/profile` - User profile (protected)
- ✅ `GET /api/v1/users` - User list (admin only)

### Models Tested
- ✅ `Pokemon` - Pokemon data model
- ✅ `User` - User authentication model
- ✅ `UserPokemon` - User favorites model

### Authentication Tested
- ✅ User registration with validation
- ✅ Password hashing with bcrypt
- ✅ JWT token generation
- ✅ Protected endpoint access
- ✅ Error handling

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 5001
lsof -i :5001

# Kill the process
kill <PID>
```

#### Permission Denied
```bash
# Make script executable
chmod +x run_test.sh
```

#### Database Errors
```bash
# Check if SQLite is working
python -c "import sqlite3; print('SQLite OK')"
```

#### JWT Token Issues
- Tokens expire after 1 hour (configurable)
- Use refresh token to get new access token
- Check token format in Authorization header

### Debug Mode
```bash
# Run with debug output
python test_app.py

# Check logs
tail -f test_server.log
```

## 📚 Related Documentation

- [Test Results](../test-results/test-execution-summary.md)
- [Testing Overview](../README.md)
- [API Documentation](../../technical/api-versioning-strategy.md)
- [Security Implementation](../../technical/security-implementation-summary.md)


