# Environment Setup Guide

**Date**: September 15, 2025  
**Status**: Complete ✅  
**Environment**: WSL2 Ubuntu on Windows 11

## 🎯 **Setup Summary**

This guide documents the complete environment setup for the Pokedex project, including solutions to common WSL/Windows integration issues.

## 📋 **Prerequisites**

- Windows 11 with WSL2
- Ubuntu distribution in WSL2
- Git installed
- Basic terminal knowledge

## 🚀 **Complete Setup Process**

### **1. Backend Environment Setup**

#### **Python Virtual Environment**
```bash
cd /home/grimmjones/Projects/newpokedex/pokedex
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### **Database Setup**
```bash
# Create instance directory for SQLite
mkdir -p instance

# Set up environment variables
cp env.example .env

# Run database migrations
export FLASK_APP=backend.app
python -m flask db upgrade
```

#### **Seed Pokemon Data**
```bash
# Seed 20 Pokemon from PokeAPI
python -m backend.seed_pokemon seed-range 1 20
```

### **2. Frontend Environment Setup**

#### **Node.js Installation (WSL-Specific)**
Due to WSL/Windows integration issues, we used a portable Node.js installation:

```bash
# Download and extract Node.js v20.19.5
wget https://nodejs.org/dist/v20.19.5/node-v20.19.5-linux-x64.tar.xz
tar -xf node-v20.19.5-linux-x64.tar.xz

# Add to PATH for current session
export PATH=$PWD/node-v20.19.5-linux-x64/bin:$PATH

# Verify installation
which node && which npm && node --version && npm --version
```

#### **Frontend Dependencies**
```bash
cd frontend
npm install
```

### **3. Server Startup Commands**

#### **Backend Server**
```bash
cd /home/grimmjones/Projects/newpokedex/pokedex
source venv/bin/activate
export FLASK_APP=backend.app
python -m backend.app
```
**URL**: http://localhost:5000

#### **Frontend Development Server**
```bash
cd /home/grimmjones/Projects/newpokedex/pokedex
export PATH=$PWD/node-v20.19.5-linux-x64/bin:$PATH
cd frontend
npm run dev
```
**URL**: http://localhost:5173

## 🔧 **Troubleshooting**

### **Common Issues and Solutions**

#### **1. UNC Path Error with npm**
**Problem**: `UNC paths are not supported. Defaulting to Windows directory.`
**Cause**: Using Windows npm from WSL
**Solution**: Use portable Node.js installation (see above)

#### **2. Redis Connection Refused**
**Problem**: `Failed to connect to Redis: Error 111 connecting to localhost:6379`
**Status**: Non-critical - app works without Redis (caching disabled)
**Solution**: Install Redis or use Docker Compose (future enhancement)

#### **3. Node.js Version Conflicts**
**Problem**: Multiple Node.js versions causing PATH issues
**Solution**: Use portable installation with explicit PATH export

### **Environment Variables**

The `.env` file contains:
```bash
# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=True

# Database Configuration
DATABASE_URL=sqlite:///instance/pokedex_dev.db

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here
```

## 📊 **Environment Status**

### **✅ Working Components**
- **Backend API**: Flask with SQLAlchemy, JWT auth
- **Database**: SQLite with 20 seeded Pokemon
- **Frontend**: React + TypeScript + Vite
- **API Endpoints**: All endpoints functional
- **CORS**: Configured for frontend integration

### **⚠️ Known Limitations**
- **Redis**: Not installed (caching disabled)
- **Docker**: Not available in current setup
- **Node.js**: Using portable installation

## 🎯 **Next Steps**

### **Immediate Development**
1. **Frontend Development**: Start building React components
2. **API Integration**: Connect frontend to backend
3. **Feature Development**: Implement Pokemon features

### **Future Enhancements**
1. **Redis Setup**: Install Redis for caching
2. **Docker Integration**: Set up Docker Compose
3. **Production Setup**: Configure for deployment

## 📝 **Development Workflow**

### **Daily Development**
1. **Start Backend**: `source venv/bin/activate && export FLASK_APP=backend.app && python -m backend.app`
2. **Start Frontend**: `export PATH=$PWD/node-v20.19.5-linux-x64/bin:$PATH && cd frontend && npm run dev`
3. **Development**: Work on features in both frontend and backend
4. **Testing**: Use http://localhost:5000 for API, http://localhost:5173 for frontend

### **File Operations**
- **Backend**: Edit files in `backend/` directory
- **Frontend**: Edit files in `frontend/src/` directory
- **Database**: SQLite file in `instance/pokedex_dev.db`

## 🔗 **Useful URLs**

- **API Health**: http://localhost:5000/
- **API Documentation**: http://localhost:5000/api/docs
- **Pokemon API**: http://localhost:5000/api/v1/pokemon
- **Frontend**: http://localhost:5173

## 📚 **Documentation References**

- [Project README](../../README.md)
- [Backend Overview](backend-overview.md)
- [Frontend Overview](frontend-overview.md)
- [Development Roadmap](../planning/roadmap.md)
- [Collaboration Rules](../collaboration/rules.md)

---

**Note**: This setup guide is specific to the WSL2 environment and includes workarounds for common Windows/WSL integration issues. For other environments, refer to the main README.md file.
