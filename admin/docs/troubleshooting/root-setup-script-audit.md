# Root `setup.sh` Script Audit

**Date**: October 3, 2025  
**Issue**: Outdated root setup script with inaccurate file references  
**Status**: 🔄 IN PROGRESS  
**Priority**: Medium (maintenance/cleanup)

---

## 📋 Problem Description

The root-level `setup.sh` script has become outdated due to multiple project restructurings:
- **File references**: May point to incorrect paths
- **Overlap**: Potential duplication with `scripts/setup/` directory
- **Structure**: Doesn't reflect current project organization
- **Functionality**: May not work with current backend structure

---

## 🔍 Current State Analysis

### **Root `setup.sh` (115 lines)**

**Location**: `/setup.sh`

**What it does**:
1. ✅ Checks Python 3.9+ installation
2. ✅ Creates virtual environment
3. ✅ Installs Python dependencies from `requirements.txt`
4. ⚠️ Installs Redis (OS-specific)
5. ⚠️ Starts Redis server
6. ⚠️ Creates `instance` directory
7. ⚠️ Copies `env.example` to `.env`
8. ❌ Runs database migrations (`flask db upgrade`)
9. ❌ Seeds Pokemon data (`python -m backend.seed_pokemon`)
10. ℹ️ Provides startup instructions

**Issues Identified**:

| Line | Issue | Severity | Details |
|------|-------|----------|---------|
| 84 | ❌ **Incorrect path** | High | Creates `instance` in root (should be `backend/instance`) |
| 95 | ⚠️ **Outdated path** | Medium | `DATABASE_URL` points to root `instance/` |
| 100 | ❌ **Module not found** | Critical | `backend.seed_pokemon` doesn't exist |
| 96 | ⚠️ **Wrong command** | Medium | `flask db upgrade` won't work from root |
| 108 | ⚠️ **Outdated path** | Low | Suggests `python -m backend.app` (works but not documented) |
| 111 | ⚠️ **Outdated command** | Low | `docker-compose` (should be `docker compose`) |
| 113 | ❌ **Wrong port** | Medium | Says port 5000, but app runs on port 80 (via nginx) |

---

## 📂 Scripts Directory Structure

### **Setup Scripts in `scripts/setup/`**

| Script | Purpose | Status |
|--------|---------|--------|
| `github-setup.sh` | Configure GitHub repository | ✅ Active |
| `production-setup.sh` | Production environment setup | ✅ Active |
| `setup-github-ci-cd.sh` | CI/CD pipeline setup | ✅ Active |
| `setup-github-secrets.sh` | GitHub secrets configuration | ✅ Active |
| `setup-production-secrets.sh` | Production secrets | ✅ Active |
| `install-git-hooks.sh` | Install Git Flow hooks | ✅ Active |
| `configure-github-permissions.sh` | GitHub permissions | ✅ Active |
| `security-toggle.sh` | Security scan toggle | ✅ Active |

**Observation**: These are all GitHub/production-focused, not local development setup.

---

## 🔄 Overlap Analysis

### **Root `setup.sh` vs `scripts/setup/`**

| Feature | Root `setup.sh` | `scripts/setup/` | Overlap? |
|---------|----------------|------------------|----------|
| Python setup | ✅ Yes | ❌ No | No overlap |
| Virtual env | ✅ Yes | ❌ No | No overlap |
| Dependencies | ✅ Yes | ❌ No | No overlap |
| Redis install | ✅ Yes | ❌ No | No overlap |
| Database setup | ✅ Yes | ❌ No | No overlap |
| GitHub setup | ❌ No | ✅ Yes | No overlap |
| Production setup | ❌ No | ✅ Yes | No overlap |
| Git hooks | ❌ No | ✅ Yes | No overlap |

**Conclusion**: ✅ **No significant overlap** - Different purposes

---

## 🎯 Correct Setup Process (Current)

### **Backend Setup (Correct)**
```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
cp env.example .env
# Edit .env with DATABASE_URL=sqlite:///backend/instance/pokedex_dev.db

# 4. Initialize database
python -m flask --app backend.app db upgrade

# 5. Seed Pokemon data (CORRECT PATH)
python -c "
from backend.app import app
from backend.utils.pokemon_seeder import pokemon_seeder
with app.app_context():
    pokemon_seeder.seed_all_generations()
"

# 6. Start backend
python -m backend.app
```

### **Frontend Setup (Correct)**
```bash
cd frontend
npm install
npm run dev
```

### **Docker Setup (Correct)**
```bash
docker compose up --build
# Access at http://localhost (port 80, not 5000)
```

---

## ❌ Issues in Root `setup.sh`

### **1. Incorrect Instance Directory**
**Line 84**: `mkdir -p instance`
- **Problem**: Creates `instance/` in project root
- **Correct**: Should be `backend/instance/`
- **Impact**: Database in wrong location

### **2. Wrong Seeding Module**
**Line 100**: `python -m backend.seed_pokemon`
- **Problem**: Module doesn't exist
- **Correct**: `backend.utils.pokemon_seeder`
- **Impact**: Setup fails at seeding step

### **3. Incorrect Database Path**
**Line 95**: `export DATABASE_URL="sqlite:///$(pwd)/instance/pokedex_dev.db"`
- **Problem**: Points to root `instance/`
- **Correct**: Should be `backend/instance/pokedex_dev.db`
- **Impact**: Database created in wrong location

### **4. Flask Migration Command**
**Line 96**: `python -m flask db upgrade`
- **Problem**: Won't find Flask app from root
- **Correct**: `python -m flask --app backend.app db upgrade`
- **Impact**: Migrations fail

### **5. Wrong Port Information**
**Line 113**: `API will be available at: http://localhost:5000`
- **Problem**: App runs on port 80 (via nginx in Docker)
- **Correct**: `http://localhost` or `http://localhost:5000` (direct Flask)
- **Impact**: User confusion

### **6. Outdated Docker Command**
**Line 111**: `docker-compose up`
- **Problem**: Old Docker Compose V1 syntax
- **Correct**: `docker compose up` (V2)
- **Impact**: May not work on newer Docker installations

---

## ✅ Recommended Solutions

### **Option 1: Fix Root `setup.sh` (Recommended)**

**Pros**:
- Maintains familiar entry point
- Single command for new developers
- Comprehensive local setup

**Cons**:
- Needs significant updates
- Ongoing maintenance burden

**Changes Needed**:
1. Fix instance directory path
2. Fix seeding command
3. Fix database URL
4. Fix Flask migration command
5. Update port information
6. Update Docker command
7. Add frontend setup steps
8. Update documentation

### **Option 2: Deprecate and Use `DEVELOPMENT.md`**

**Pros**:
- Reduces maintenance burden
- `DEVELOPMENT.md` is already comprehensive
- Follows modern documentation practices

**Cons**:
- No automated setup script
- More manual steps for developers

**Actions**:
1. Rename `setup.sh` to `scripts/deprecated/setup.sh.old`
2. Create simple `setup.sh` that points to `DEVELOPMENT.md`
3. Update `README.md` to reference `DEVELOPMENT.md`

### **Option 3: Create Modular Setup Scripts**

**Pros**:
- Flexible (backend-only, frontend-only, full-stack)
- Easier to maintain
- Follows scripts directory structure

**Cons**:
- More complex for beginners
- Multiple scripts to manage

**Structure**:
```
scripts/setup/
├── setup-backend.sh      # Backend-only setup
├── setup-frontend.sh     # Frontend-only setup
├── setup-fullstack.sh    # Complete setup
└── setup-docker.sh       # Docker environment setup
```

---

## 💡 Recommendation

**Recommended Approach**: **Option 1 - Fix Root `setup.sh`**

**Reasoning**:
1. ✅ Maintains single entry point for new developers
2. ✅ Aligns with README.md "Automated Setup" option
3. ✅ Comprehensive setup in one command
4. ✅ No overlap with existing scripts in `scripts/setup/`

**Implementation Plan**:
1. Create new `setup.sh` that works with current structure
2. Test thoroughly with fresh clone
3. Update `README.md` if needed
4. Document in `DEVELOPMENT.md`

---

## 🔧 Proposed New `setup.sh`

### **Key Changes**:
- ✅ Fix all file paths
- ✅ Use correct module names
- ✅ Add frontend setup
- ✅ Update Docker commands
- ✅ Correct port information
- ✅ Add better error handling
- ✅ Make it idempotent (safe to run multiple times)

### **Structure**:
```bash
#!/bin/bash
# Pokehub Development Environment Setup

# 1. Check prerequisites
# 2. Backend setup
#    - Virtual environment
#    - Dependencies
#    - Database
#    - Seeding
# 3. Frontend setup
#    - Node dependencies
# 4. Docker setup (optional)
# 5. Final instructions
```

---

## 📊 Impact Assessment

### **Current State**
- ❌ Root `setup.sh` is broken (won't complete successfully)
- ⚠️ New developers may struggle with setup
- ⚠️ Documentation mismatch (README vs reality)

### **After Fix**
- ✅ One-command setup works
- ✅ Aligns with current project structure
- ✅ Documentation matches reality
- ✅ Better developer experience

---

## 🧪 Testing Plan

### **Test Scenarios**:
1. **Fresh Clone**: Clone repo, run `./setup.sh`, verify everything works
2. **Partial Setup**: Run with existing venv, verify idempotent
3. **Backend Only**: Verify backend starts correctly
4. **Frontend Only**: Verify frontend starts correctly
5. **Docker**: Verify Docker setup instructions work
6. **Error Handling**: Test with missing prerequisites

### **Verification**:
- [ ] Backend starts without errors
- [ ] Database created in correct location
- [ ] Pokemon data seeded successfully
- [ ] Frontend dependencies installed
- [ ] Docker setup works
- [ ] Instructions are accurate

---

## 📝 Next Steps

1. ✅ Create this audit document
2. 📋 Create new `setup.sh` script
3. 📋 Test with fresh clone
4. 📋 Update `README.md` if needed
5. 📋 Update `DEVELOPMENT.md` references
6. 📋 Archive old `setup.sh` for reference

---

## 🔗 Related Files

- `setup.sh` - Root setup script (to be fixed)
- `scripts/setup/` - GitHub/production setup scripts (no overlap)
- `README.md` - References automated setup
- `DEVELOPMENT.md` - Manual setup instructions
- `env.example` - Environment template

---

**Audit Completed By**: Development Team  
**Date**: October 3, 2025  
**Status**: Ready for implementation  
**Priority**: Medium (affects new developer onboarding)
