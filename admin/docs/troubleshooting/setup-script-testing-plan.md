# Setup Script Testing Plan

**Date**: October 3, 2025  
**Script**: Root `setup.sh`  
**Branch**: `fix/update-root-setup-script`  
**Status**: 🧪 TESTING

---

## 🎯 Testing Strategy

**Approach**: Test on the feature branch **before merging** to ensure it works correctly.

**Why Test First**:
- ✅ Catch issues before they reach `develop`
- ✅ Verify all paths are correct
- ✅ Test error handling
- ✅ Ensure idempotent behavior
- ✅ Validate completion messages

---

## 🧪 Testing Methods

### **Method 1: Dry Run (Safest - Recommended)**

Test the script without actually running the full setup:

```bash
# Stay on feature branch
git checkout fix/update-root-setup-script

# Test help message
./setup.sh --help

# Test with --help to see what it would do
# (This doesn't actually run setup, just shows help)
```

**Pros**: No side effects, quick validation  
**Cons**: Doesn't test actual execution

---

### **Method 2: Test in Temporary Directory (Recommended)**

Create a fresh clone in a temporary location:

```bash
# Clone to temporary directory
cd /tmp
git clone https://github.com/grimm00/pokehub.git pokehub-test
cd pokehub-test

# Checkout feature branch
git checkout fix/update-root-setup-script

# Run setup
./setup.sh

# Test backend
source venv/bin/activate
python -m backend.app &
BACKEND_PID=$!

# Test if backend is running
sleep 5
curl http://localhost:5000/api/v1/health

# Cleanup
kill $BACKEND_PID
cd ~
rm -rf /tmp/pokehub-test
```

**Pros**: Complete test, no impact on main project  
**Cons**: Requires full setup time (~5 minutes)

---

### **Method 3: Docker Test Environment (Isolated)**

Test in a Docker container for complete isolation:

```bash
# Create test Dockerfile
cat > Dockerfile.test << 'EOF'
FROM ubuntu:22.04

# Install prerequisites
RUN apt-get update && apt-get install -y \
    python3.9 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    redis-server \
    git \
    curl

# Create test user
RUN useradd -m -s /bin/bash testuser
USER testuser
WORKDIR /home/testuser

# Clone and test
RUN git clone https://github.com/grimm00/pokehub.git
WORKDIR /home/testuser/pokehub
RUN git checkout fix/update-root-setup-script

# Run setup
RUN ./setup.sh --skip-redis

# Test backend
CMD ["bash", "-c", "source venv/bin/activate && python -m backend.app"]
EOF

# Build and run
docker build -f Dockerfile.test -t pokehub-setup-test .
docker run -p 5000:5000 pokehub-setup-test

# Test
curl http://localhost:5000/api/v1/health

# Cleanup
docker rm $(docker ps -a -q -f ancestor=pokehub-setup-test)
docker rmi pokehub-setup-test
rm Dockerfile.test
```

**Pros**: Complete isolation, reproducible  
**Cons**: Most complex, takes longest

---

### **Method 4: Test Individual Components (Quick)**

Test specific parts without full setup:

```bash
# Stay on feature branch
git checkout fix/update-root-setup-script

# Test 1: Check prerequisites (no side effects)
python3 --version  # Should be 3.9+
node --version     # Should be 18+
redis-server --version  # Should exist

# Test 2: Verify file paths exist
ls -la backend/instance  # Should exist or be creatable
ls -la frontend/package.json  # Should exist
ls -la env.example  # Should exist

# Test 3: Test Python imports (no side effects)
python3 -c "from backend.app import app; print('✅ Backend imports work')"
python3 -c "from backend.utils.pokemon_seeder import pokemon_seeder; print('✅ Seeder imports work')"

# Test 4: Test database path
python3 -c "
import os
db_path = 'backend/instance/pokedex_dev.db'
print(f'Database path: {db_path}')
print(f'Directory exists: {os.path.exists(os.path.dirname(db_path))}')
"
```

**Pros**: Quick, no side effects, validates key components  
**Cons**: Doesn't test full execution flow

---

### **Method 5: Test on Current Project (Careful)**

Test on your current project (since you already have it set up):

```bash
# CAUTION: This will modify your current setup
# Make sure you're okay with this or have backups

# Stay on feature branch
git checkout fix/update-root-setup-script

# Option A: Test with existing setup (should be idempotent)
./setup.sh

# Option B: Test backend-only (safer)
./setup.sh --backend-only

# Option C: Test frontend-only (safer)
./setup.sh --frontend-only

# Verify nothing broke
source venv/bin/activate
python -m backend.app &
BACKEND_PID=$!
sleep 5
curl http://localhost:5000/api/v1/health
kill $BACKEND_PID
```

**Pros**: Tests on real environment  
**Cons**: Could affect your current setup

---

## 📋 Recommended Testing Sequence

### **Phase 1: Quick Validation** (2 minutes)

```bash
# 1. Test help message
./setup.sh --help

# 2. Test prerequisites check (will stop before making changes)
# Manually run just the prerequisites section
python3 --version
node --version
redis-server --version

# 3. Verify imports work
python3 -c "from backend.app import app; print('✅ OK')"
python3 -c "from backend.utils.pokemon_seeder import pokemon_seeder; print('✅ OK')"
```

**Expected Results**:
- ✅ Help message displays correctly
- ✅ Prerequisites are met
- ✅ Python imports work

---

### **Phase 2: Temporary Directory Test** (5 minutes)

```bash
# Full test in isolated environment
cd /tmp
git clone https://github.com/grimm00/pokehub.git pokehub-test
cd pokehub-test
git checkout fix/update-root-setup-script

# Run setup
./setup.sh

# Verify results
echo "Checking virtual environment..."
ls -la venv/

echo "Checking backend instance..."
ls -la backend/instance/

echo "Checking .env file..."
ls -la .env

echo "Checking database..."
ls -la backend/instance/*.db

# Test backend starts
source venv/bin/activate
python -m backend.app &
BACKEND_PID=$!
sleep 5

# Test API
curl http://localhost:5000/api/v1/health
curl http://localhost:5000/api/v1/pokemon?per_page=5

# Cleanup
kill $BACKEND_PID
cd ~
rm -rf /tmp/pokehub-test
```

**Expected Results**:
- ✅ Virtual environment created
- ✅ Dependencies installed
- ✅ Database created in `backend/instance/`
- ✅ Pokemon data seeded
- ✅ Backend starts successfully
- ✅ API responds correctly

---

### **Phase 3: Test Options** (3 minutes)

```bash
cd /tmp
git clone https://github.com/grimm00/pokehub.git pokehub-test2
cd pokehub-test2
git checkout fix/update-root-setup-script

# Test backend-only
./setup.sh --backend-only

# Verify only backend setup
ls -la venv/  # Should exist
ls -la frontend/node_modules/  # Should NOT exist

# Cleanup
cd ~
rm -rf /tmp/pokehub-test2
```

**Expected Results**:
- ✅ Backend setup completes
- ✅ Frontend setup skipped
- ✅ Script completes successfully

---

## ✅ Success Criteria

### **Must Pass**:
- [ ] Help message displays correctly
- [ ] Prerequisites check works
- [ ] Virtual environment created
- [ ] Python dependencies installed
- [ ] Backend instance directory created in correct location
- [ ] Database initialized successfully
- [ ] Pokemon data seeded (649 Pokemon)
- [ ] Frontend dependencies installed (if not --backend-only)
- [ ] .env file created from template
- [ ] Backend starts without errors
- [ ] API responds to health check
- [ ] Completion message displays

### **Should Pass**:
- [ ] --backend-only option works
- [ ] --frontend-only option works
- [ ] --skip-redis option works
- [ ] Idempotent (can run twice safely)
- [ ] Error messages are clear
- [ ] Colored output works

### **Nice to Have**:
- [ ] Redis auto-install works (if needed)
- [ ] Version checks work correctly
- [ ] Progress indicators are clear

---

## 🐛 Common Issues to Check

### **1. Path Issues**
```bash
# Verify these paths are correct
ls -la backend/instance/  # Should exist
ls -la backend/instance/pokedex_dev.db  # Should exist after setup
```

### **2. Module Import Issues**
```bash
# Test imports
python3 -c "from backend.utils.pokemon_seeder import pokemon_seeder"
```

### **3. Database Issues**
```bash
# Check database location
find . -name "*.db" -type f
# Should only find: backend/instance/pokedex_dev.db
```

### **4. Environment Issues**
```bash
# Check .env file
cat .env | grep DATABASE_URL
# Should point to backend/instance/
```

---

## 🔧 If Issues Found

### **Fix Process**:
1. Document the issue
2. Fix in the feature branch
3. Commit the fix
4. Push to update PR
5. Re-test

### **Example Fix**:
```bash
# Stay on feature branch
git checkout fix/update-root-setup-script

# Make fixes
nano setup.sh

# Test again
./setup.sh --help

# Commit
git add setup.sh
git commit -m "fix: correct issue XYZ in setup script"
git push
```

---

## 📊 Test Results Template

```markdown
# Setup Script Test Results

**Date**: October 3, 2025
**Tester**: [Your Name]
**Branch**: fix/update-root-setup-script
**Environment**: [macOS/Linux/Docker]

## Phase 1: Quick Validation
- [ ] Help message: PASS/FAIL
- [ ] Prerequisites: PASS/FAIL
- [ ] Imports: PASS/FAIL

## Phase 2: Full Setup
- [ ] Virtual env: PASS/FAIL
- [ ] Dependencies: PASS/FAIL
- [ ] Database: PASS/FAIL
- [ ] Seeding: PASS/FAIL
- [ ] Backend starts: PASS/FAIL
- [ ] API responds: PASS/FAIL

## Phase 3: Options
- [ ] --backend-only: PASS/FAIL
- [ ] --frontend-only: PASS/FAIL
- [ ] --skip-redis: PASS/FAIL

## Issues Found
1. [Issue description]
2. [Issue description]

## Recommendation
- [ ] Ready to merge
- [ ] Needs fixes
```

---

## 🎯 Recommendation

**Recommended Approach**: **Method 2 - Temporary Directory Test**

**Why**:
- ✅ Complete test of actual functionality
- ✅ No impact on main project
- ✅ Quick to set up (~5 minutes)
- ✅ Easy to cleanup
- ✅ Tests real-world scenario

**Commands**:
```bash
# Quick test
cd /tmp
git clone https://github.com/grimm00/pokehub.git pokehub-test
cd pokehub-test
git checkout fix/update-root-setup-script
./setup.sh
# Verify everything works
rm -rf /tmp/pokehub-test
```

---

**After Testing**: If all tests pass, merge to `develop` with confidence! 🚀

---

## 🔥 Live Testing Session - Troubleshooting Log

**Date**: October 3, 2025  
**Environment**: Temporary directory (`/tmp/pokehub-test`)  
**Branch**: `fix/update-root-setup-script`

---

### **Issue #1: Missing requirements.txt**

**Error**:
```
▶ Installing Python dependencies...
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

**Problem Identified**:
- Script looks for `requirements.txt` in project root
- File exists at root level
- Likely a path issue or the file wasn't pulled correctly

**Investigation Steps**:
```bash
# Check if file exists
ls -la requirements.txt

# Check current directory
pwd

# Check git status
git status

# Verify branch
git branch
```

**Root Cause**: ✅ **IDENTIFIED**
- `requirements.txt` is located in `backend/requirements.txt`, not project root
- Script incorrectly references `requirements.txt` (root) instead of `backend/requirements.txt`
- This is a result of the project structure cleanup where dependencies were moved to subdirectories

**Solution**: ✅ **FIXED**
- Update `setup.sh` line ~250 to use `backend/requirements.txt`
- Change: `pip install -r requirements.txt`
- To: `pip install -r backend/requirements.txt`

**Status**: ✅ FIXED (updating script now)

---

### **Issue #2: Missing migrations directory**

**Error**:
```
▶ Initializing database...
Error: Path doesn't exist: migrations.  Please use the 'init' command to create a new scripts folder.
```

**Problem Identified**:
- Flask-Migrate looking for `migrations/` in project root
- Migrations directory is actually in `backend/migrations/`
- Flask command needs to be run from backend directory or with proper path

**Investigation**:
```bash
# Check migrations location
find . -name "migrations" -type d
# Result: ./backend/migrations (not ./migrations)
```

**Root Cause**: ✅ **IDENTIFIED**
- Flask-Migrate expects migrations in the same directory as the app
- Need to either:
  1. Run Flask commands from backend directory, OR
  2. Set FLASK_APP to point to backend.app with proper config

**Solution**: ✅ **FIXED**
- Changed to run Flask commands from backend directory
- Before: `python -m flask --app backend.app db upgrade` (from root)
- After: `cd backend && python -m flask db upgrade && cd ..` (from backend)
- This ensures Flask-Migrate finds the migrations directory

**Code Changes**:
```bash
# Old (broken)
export FLASK_APP=backend.app
python -m flask --app backend.app db upgrade

# New (working)
cd "$PROJECT_ROOT/backend"
export FLASK_APP=app
python -m flask db upgrade
cd "$PROJECT_ROOT"
```

**Status**: ✅ FIXED (updating script now)

---

### **Issue #3: .env file created too late + outdated env.example**

**Error**:
```
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) unable to open database file
```

**Problem Identified**:
1. `.env` file is created in frontend setup (line 355)
2. Database initialization happens in backend setup (line 301)
3. Backend tries to use DATABASE_URL before .env exists
4. Additionally, `env.example` has wrong database path

**File Timestamps** (showing staleness):
```
2025-10-01 18:50:28 .env          (OLD - created 2 days ago)
2025-10-03 18:26:50 env.example   (NEW - updated today)
2025-10-02 09:22:07 backend/app.py
2025-10-04 15:29:47 setup.sh      (NEWEST - today)
```

**Root Cause**: ✅ **IDENTIFIED**
- **Timing Issue**: .env created after it's needed
- **Path Issue**: env.example has `sqlite:///backend/instance/pokehub_dev.db`
  - This path is relative to project root
  - Flask runs from backend directory
  - Should be `sqlite:///instance/pokehub_dev.db` (relative to backend/)
- **Staleness Issue**: User's .env is 2 days older than env.example template

**Solution**: ✅ **FIXED**
1. ✅ Moved .env creation to BEGINNING of backend setup (before venv creation)
2. ✅ Fixed DATABASE_URL path in env.example
3. ✅ Added file timestamp validation to detect stale configs

**Code Changes**:

**env.example** (line 8):
```bash
# Old (wrong path)
DATABASE_URL=sqlite:///backend/instance/pokehub_dev.db

# New (correct - relative to backend/)
DATABASE_URL=sqlite:///instance/pokehub_dev.db
```

**setup.sh** (moved from line 355 to line 272):
```bash
# Now creates .env FIRST in backend setup, before any operations that need it
# Added staleness check:
if [ env.example -nt .env ]; then
    print_warning ".env file is older than env.example - consider updating"
    print_info "Run: diff .env env.example to see changes"
fi
```

**Impact**:
- .env now exists before database initialization
- Database path is correct for Flask running in backend/
- Users warned if their .env is outdated

**Status**: ✅ FIXED (updating script now)

---

### **Issue #4: Pokemon seeding runs from wrong directory**

**Error**:
```
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) unable to open database file
(Background on this error at: https://sqlalche.me/e/20/e3q8)
```

**Problem Identified**:
- Database initialization runs from `backend/` directory (line 320-323) ✅
- Script then returns to project root (line 323: `cd "$PROJECT_ROOT"`) ✅
- Pokemon seeding runs from project root (line 328) ❌
- But DATABASE_URL is `sqlite:///instance/pokehub_dev.db` (relative to backend/)
- From root, this looks for `./instance/pokehub_dev.db` (doesn't exist)
- From backend/, this looks for `./backend/instance/pokehub_dev.db` (exists!)

**Root Cause**: ✅ **IDENTIFIED**
- **Context Mismatch**: Seeding imports `backend.app` from root directory
- Flask app expects to run from backend/ directory (where migrations are)
- Database path is relative to Flask's execution context
- Solution: Run seeding from backend/ directory like migrations

**Solution**: ✅ **FIXED**
- Run seeding from backend/ directory (same as migrations)
- Keep consistent execution context for all Flask operations
- Updated fallback instructions to also run from backend/

**Code Changes**:
```bash
# Old (broken - runs from root)
cd "$PROJECT_ROOT"
python -c "
from backend.app import app
from backend.utils.pokemon_seeder import pokemon_seeder
...

# New (working - runs from backend/)
cd "$PROJECT_ROOT/backend"
python -c "
from app import app  # Import from current directory
from utils.pokemon_seeder import pokemon_seeder
...
cd "$PROJECT_ROOT"
```

**Impact**:
- All Flask operations (migrations, seeding) now run from backend/
- Database path resolution is consistent
- Imports are simpler (no `backend.` prefix needed)

**Status**: ✅ FIXED (updating script now)

---

### **Issue #5: backend/app.py has incorrect imports**

**Error**:
```
File "/private/tmp/pokehub-test/backend/app.py", line 10, in <module>
    from backend.database import db
ModuleNotFoundError: No module named 'backend'
```

**Problem Identified**:
- `backend/app.py` uses `from backend.X import Y` style imports
- When running from backend/ directory, Python can't find 'backend' module
- These imports work from project root but fail from backend/
- Need relative imports since app.py is already in backend/

**Affected Lines** (6 imports):
```python
Line 10:  from backend.database import db
Line 11:  from backend.services.security import (...)
Line 15:  from backend.services.cache import cache_manager
Line 162: from backend.models import pokemon, user
Line 163: from backend.models.user import User
Line 164: from backend.routes import pokemon_routes, user_routes, auth_routes, cache_routes
```

**Root Cause**: ✅ **IDENTIFIED**
- Imports were written assuming execution from project root
- After directory structure cleanup, backend should be self-contained
- Flask operations now run from backend/ directory
- Need to update imports to be relative to backend/

**Solution**: ✅ **FIXING**
- Remove `backend.` prefix from all imports in app.py
- Use relative imports: `from database import db`
- Makes backend/ directory properly self-contained

**Code Changes**:
```python
# Old (broken from backend/)
from backend.database import db
from backend.services.security import (...)
from backend.services.cache import cache_manager
from backend.models import pokemon, user
from backend.models.user import User
from backend.routes import pokemon_routes, user_routes, auth_routes, cache_routes

# New (works from backend/)
from database import db
from services.security import (...)
from services.cache import cache_manager
from models import pokemon, user
from models.user import User
from routes import pokemon_routes, user_routes, auth_routes, cache_routes
```

**Impact**:
- backend/ directory is now self-contained
- Can run Flask from backend/ without sys.path manipulation
- Consistent with how migrations and seeding work
- Simpler imports throughout backend code

**Status**: ✅ FIXED (updating app.py now)

---

### **Testing Continues...**

[Additional issues will be documented here as they occur]
