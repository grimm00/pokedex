# Frontend Reorganization CI/CD Troubleshooting Log

**Date:** October 3, 2025  
**Branch:** `chore/frontend-organization`  
**PR:** #7 - Frontend Organization: Restructure for Better Maintainability  
**Context:** Major frontend directory reorganization and CI/CD validation

---

## 🎯 **Overview**

This log documents the troubleshooting process for CI/CD failures encountered during the frontend reorganization project. The reorganization moved configuration files, Docker files, and consolidated directory structure, which required updates to various path references throughout the system.

---

## 📋 **Issue #1: Docker Build Failure - Missing Startup Script**

### **🚨 Problem Identified**
- **Failure Point:** CI/CD Build Job
- **Error Message:** `failed to calculate checksum of ref: "/scripts/docker-startup.sh": not found`
- **Root Cause:** Dockerfile referencing incorrect path for startup script

### **🔍 Investigation Process**
1. **Used GitHub CLI to identify failure:**
   ```bash
   gh pr checks 7
   # Result: build job failing, other tests passing
   ```

2. **Retrieved detailed logs:**
   ```bash
   gh run view 18227506199 --log-failed
   # Revealed: COPY scripts/docker-startup.sh /usr/local/bin/ failing
   ```

3. **Located actual file:**
   ```bash
   find scripts/ -name "*startup*" -o -name "*docker*"
   # Found: scripts/core/docker-startup.sh
   ```

### **✅ Solution Applied**
- **File Modified:** `Dockerfile` (line 120)
- **Change:** Updated path from `scripts/docker-startup.sh` to `scripts/core/docker-startup.sh`
- **Commit:** `d64c444` - "fix: update Dockerfile to use correct docker-startup.sh path"

### **📊 Impact**
- **Before:** Build job failing with exit code 1
- **After:** Build job should now pass (validation in progress)
- **Other Jobs:** No impact - unit, integration, performance, and docker-test jobs were already passing

### **🧠 Lessons Learned**
1. **Path Dependencies:** Directory reorganizations require careful tracking of all file references
2. **CI/CD Validation:** Essential for catching path mismatches that work locally but fail in clean environments
3. **GitHub CLI Efficiency:** `gh pr checks` and `gh run view --log-failed` provide rapid troubleshooting
4. **Systematic Investigation:** Start with high-level status, drill down to specific error messages

---

## 📋 **Issue #2: Docker Build Failure - Frontend Dist Path Mismatch**

### **🚨 Problem Identified**
- **Failure Point:** CI/CD Build Job (after Issue #1 fix)
- **Error Message:** `failed to calculate checksum of ref: "/app/frontend/dist": not found`
- **Root Cause:** Frontend build outputs to `../dist` but Dockerfile expects `/app/frontend/dist`

### **🔍 Investigation Process**
1. **Monitored CI/CD after Issue #1 fix:**
   ```bash
   gh pr checks 7
   # Result: build job still failing, but with different error
   ```

2. **Retrieved new failure logs:**
   ```bash
   gh run view 18227624796 --log-failed
   # Revealed: COPY --from=frontend-builder /app/frontend/dist ./frontend/dist failing
   ```

3. **Analyzed frontend build output:**
   - Frontend build shows: `../dist/index.html` (builds to parent directory)
   - Dockerfile expects: `/app/frontend/dist` (builds to current directory)
   - **Path Mismatch:** Our vite.config.ts change `outDir: '../dist'` conflicts with Dockerfile

### **✅ Solution Applied**
- **File Modified:** `frontend/config/vite.config.ts` (line 23)
- **Change:** Updated `outDir: '../dist'` back to `outDir: 'dist'` for Docker compatibility
- **Commit:** `062fe28` - "fix: correct frontend build output directory for Docker compatibility"

### **📊 Impact**
- **Before:** Frontend builds to `../dist`, Docker can't find `/app/frontend/dist`
- **After:** Frontend builds to `dist`, Docker can copy from `/app/frontend/dist`
- **Side Effects:** Local builds will now output to `frontend/dist` instead of project root

### **🧠 Lessons Learned**
1. **Multi-stage Docker Builds:** Changes to build output paths affect Docker COPY commands
2. **Configuration Conflicts:** Local development optimizations can break containerized builds
3. **Build Path Consistency:** Frontend build output must match Docker expectations
4. **Testing Scope:** Local testing doesn't catch Docker-specific path issues

---

## 📋 **Issue #3: Docker Health Check Failure - Connection Reset**

### **🚨 Problem Identified**
- **Failure Point:** CI/CD Build Job (after Issues #1 & #2 fixes)
- **Error Message:** `curl: (56) Recv failure: Connection reset by peer`
- **Root Cause:** Health check endpoint failing after 30-second wait

### **🔍 Investigation Process**
1. **Monitored CI/CD after Issue #2 fix:**
   ```bash
   gh pr checks 7
   # Result: build job failing again, but containers starting successfully
   ```

2. **Retrieved health check failure logs:**
   ```bash
   gh run view 18227731245 --log-failed
   # Revealed: curl -f http://localhost/ failing with connection reset
   ```

3. **Analysis:**
   - Containers start successfully: `pokehub-pokehub-app-1 Started`
   - 30-second wait completes
   - Health check fails: connection reset by peer
   - **Likely Issue:** App not ready after 30s or health endpoint misconfigured

### **🔍 Root Cause Analysis**
4. **Container startup script investigation:**
   ```bash
   # Reviewed scripts/core/docker-startup.sh
   # Found: python -m backend.app & (line 36)
   # Issue: Flask backend likely failing to start due to module path issues
   ```

5. **Container behavior:**
   - Redis starts successfully ✅
   - Database initialization runs ✅  
   - Pokemon seeding runs ✅
   - Flask backend fails to start ❌ (suspected)
   - Nginx starts but proxies to non-existent backend ❌
   - Health check fails: no working application ❌

### **✅ Solution Applied - Attempt #1**
- **Status:** ❌ **FAILED** - Module path fix didn't resolve the issue
- **Applied Fix:** Added `cd /app &&` before all Python commands in docker-startup.sh
- **Result:** Still getting "Connection reset by peer" after 30s wait

### **🔍 Additional Investigation - Issue #3 Continued**
6. **Timing analysis:**
   ```yaml
   # docker-compose.yml healthcheck:
   start_period: 40s  # Container needs 40s to be ready
   # CI/CD script:
   sleep 30           # Only waits 30s before health check
   ```

7. **Potential issues:**
   - ⏰ **Timing:** CI waits 30s, but container needs 40s to be ready
   - 🐍 **Flask startup:** Backend might still be failing to start
   - 🌐 **Nginx config:** Proxy configuration might be incorrect
   - 🔍 **Need container logs:** Must see what's happening inside container

### **✅ Solution Applied - Attempt #2**
- **Status:** 🔧 **IN PROGRESS** - Investigate timing and get container logs
- **Next Steps:** 
  1. Increase CI wait time from 30s to 45s
  2. Add container log output to CI for debugging
  3. Test locally to verify container behavior

---

## 🔄 **Current Status**

- **Issue #1:** ✅ **RESOLVED** - Docker startup script path corrected
- **Issue #2:** ✅ **RESOLVED** - Frontend dist path mismatch corrected  
- **Issue #3:** 🔧 **IN PROGRESS** - Docker health check connection failure
- **Other Jobs:** Unit, integration, performance, and docker-test jobs all passing

## 💡 **CI/CD Optimization Discussion**

**User Question:** "Do all tests need to run every time when we're stuck on build job?"

**Answer:** Absolutely not! Great observation. Here are optimization strategies:

### **🎯 Current Inefficiency:**
- Running unit (45s) + integration (31s) + performance (32s) + docker-test (1m25s) = ~3.5 minutes
- Then build job runs for another 1m20s
- **Total:** ~5 minutes per iteration for a build-specific issue

### **⚡ Optimization Options:**

1. **Skip Dependencies for Build Testing:**
   ```yaml
   build:
     runs-on: ubuntu-latest
     # Remove: needs: [test, docker-test]  # Skip for troubleshooting
   ```

2. **Conditional Job Execution:**
   ```yaml
   build:
     if: github.event.pull_request.draft == false  # Only run on ready PRs
   ```

3. **Parallel Execution:**
   ```yaml
   build:
     needs: []  # Run in parallel with tests, not after
   ```

4. **Manual Trigger for Build-Only:**
   ```yaml
   workflow_dispatch:  # Allow manual triggering
     inputs:
       skip_tests:
         description: 'Skip test jobs'
         type: boolean
   ```

**Recommendation:** For troubleshooting, temporarily remove `needs: [test, docker-test]` from build job to run it independently.

---

## 📝 **Future Issues Template**

### **🚨 Problem Identified**
- **Failure Point:** [CI/CD job name]
- **Error Message:** [Exact error from logs]
- **Root Cause:** [Brief description]

### **🔍 Investigation Process**
1. [Step-by-step investigation]
2. [Commands used]
3. [Key findings]

### **✅ Solution Applied**
- **File Modified:** [File path]
- **Change:** [Description of change]
- **Commit:** [Commit hash and message]

### **📊 Impact**
- **Before:** [State before fix]
- **After:** [Expected state after fix]
- **Side Effects:** [Any other impacts]

### **🧠 Lessons Learned**
- [Key takeaways for future reference]

---

## 🛠️ **Troubleshooting Tools & Commands**

### **GitHub CLI Commands**
```bash
# Check PR status
gh pr checks [PR_NUMBER]

# View run details
gh run view [RUN_ID]

# Get failed logs
gh run view [RUN_ID] --log-failed

# List PRs
gh pr list
```

### **File Investigation**
```bash
# Find files by pattern
find [directory] -name "*pattern*"

# Search for text in files
grep -r "search_term" [directory]

# Check file existence
ls -la [path]
```

### **Git Operations**
```bash
# Stage and commit fixes
git add [file]
git commit -m "fix: description"
git push origin [branch]
```

---

## 📚 **Related Documentation**

- [Frontend Organization Plan](../architecture/project-structure-cleanup-plan.md)
- [CI/CD Configuration](.github/workflows/ci.yml)
- [Docker Configuration](../../Dockerfile)
- [Scripts Directory Structure](../../scripts/README.md)

---

**Last Updated:** October 3, 2025  
**Next Update:** After resolving any additional CI/CD issues
