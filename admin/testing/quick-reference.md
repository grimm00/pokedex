# Testing Quick Reference

Quick commands and shortcuts for testing the Pokedex API.

## 🚀 Quick Start

### Start Test Server
```bash
cd admin/testing/test-scripts/
./run_test.sh
```

### Stop Test Server
```bash
# Find and kill process
ps aux | grep test_app.py | grep -v grep | awk '{print $2}' | xargs kill
```

### View Logs
```bash
tail -f admin/testing/test-scripts/test_server.log
```

## 🧪 Test Commands

### Health Check
```bash
curl http://localhost:5001/
```

### API Version
```bash
curl http://localhost:5001/api/version
```

### Pokemon List
```bash
curl http://localhost:5001/api/v1/pokemon
```

### User Registration
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}' \
  http://localhost:5001/api/v1/auth/register
```

### User Login
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  http://localhost:5001/api/v1/auth/login
```

### Protected Endpoint (with JWT)
```bash
# First get token from login, then:
curl -H "Authorization: Bearer <YOUR_TOKEN>" \
  http://localhost:5001/api/v1/auth/profile
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
lsof -i :5001
kill <PID>
```

### Permission Denied
```bash
chmod +x admin/testing/test-scripts/run_test.sh
```

### Check Server Status
```bash
ps aux | grep test_app.py
```

### View Server Logs
```bash
cat admin/testing/test-scripts/test_server.log
```

## 📊 Test Results

### Expected Responses

**Health Check**:
```json
{
    "status": "healthy",
    "message": "Pokedex API is running (TEST MODE)",
    "api_version": "v1"
}
```

**Pokemon List**:
```json
{
    "pokemon": [],
    "count": 0
}
```

**User Registration**:
```json
{
    "message": "User created successfully",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
    }
}
```

## 🎯 Test Checklist ✅ ALL PASSING

- [x] Server starts successfully
- [x] Health check responds
- [x] API version endpoint works
- [x] Pokemon list endpoint works
- [x] User registration works
- [x] User login works
- [x] JWT tokens generated
- [x] Protected endpoints require authentication
- [x] Error handling works
- [x] Database migrations working
- [x] Model relationships working
- [x] JSON data storage working

## 📚 Documentation

- [Testing Overview](README.md)
- [Test Scripts](test-scripts/README.md)
- [Test Results](test-results/test-execution-summary.md)
- [Test Data](test-data/README.md)
- [Performance](performance/README.md)


