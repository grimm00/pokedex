# Docker Pokemon Seeding Timeout Troubleshooting

**Issue**: Docker container fails to seed all Pokemon due to timeout  
**Date**: October 3, 2025  
**Status**: ✅ **RESOLVED**

---

## ⚡ TL;DR - Quick Fix

<details>
<summary><b>Click to expand quick commands</b></summary>

### **Problem**: Docker seeding times out, incomplete Pokemon data

### **Quick Diagnosis**:
```bash
# Check seeding status
docker compose logs pokehub-app | grep -E "(Seeded|timeout)"

# Verify Pokemon count
curl -s "http://localhost/api/v1/pokemon?per_page=1000" | \
  python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Total: {data[\"pagination\"][\"total\"]}')"
```

### **Quick Fix** (for 649 Pokemon):

**Option A: Environment Variables (Recommended)** ✅
1. Update `.env` file:
   ```bash
   POKEMON_SEEDING_TIMEOUT=120
   HEALTHCHECK_START_PERIOD=130
   ```
2. Rebuild: `docker compose down && docker compose build --no-cache && docker compose up -d`

**Option B: Direct File Edit**
1. Update `scripts/core/docker-startup.sh` line 23: `SEEDING_TIMEOUT=120`
2. Update `docker-compose.yml` line 22: `start_period: 130s`
3. Rebuild: `docker compose down && docker compose build --no-cache && docker compose up -d`

### **Timeout Formula**: `(Total Pokemon × 0.2s) + 30s buffer`

[Jump to detailed troubleshooting →](#-how-to-diagnose)

</details>

---

## 🎯 Problem Summary

When adding more Pokemon generations to the application, the Docker container's Pokemon seeding process can timeout before completing, resulting in incomplete data and missing generations.

### **Symptoms**

1. ✅ Container starts and reports "healthy"
2. ✅ Frontend loads successfully
3. ❌ API returns empty results for higher generations
4. ⚠️ Docker logs show: `⚠️ Pokemon seeding timed out after XX seconds`
5. ⚠️ Fewer Pokemon in database than expected

---

## 📊 Root Cause Analysis

### **The Issue**

Pokemon seeding fetches data from PokeAPI sequentially for each Pokemon:
- Each API call takes ~0.15-0.3 seconds
- With 649 Pokemon (Gen 1-5), seeding takes approximately 90-120 seconds
- Original timeout was set too low (30s → 60s → **120s required**)

### **Timeline of Discovery**

```
Initial State:
- Timeout: 30s
- Result: ~150 Pokemon seeded (partial Gen 2)

First Fix Attempt:
- Timeout: 60s  
- Result: 388 Pokemon seeded (partial Gen 4)
- Missing: Generations 4 (partial) and 5 (complete)

Final Solution:
- Timeout: 120s
- Result: 649 Pokemon seeded (all 5 generations)
- ✅ All generations accessible
```

---

## 🔍 How to Diagnose

### **Step 1: Check Container Logs**

```bash
docker compose logs pokehub-app | grep -E "(Seeded|timeout|Pokemon)"
```

**What to look for**:
- ✅ Success: `✅ Seeded 649 Pokemon from Generations 1-5`
- ❌ Timeout: `⚠️ Pokemon seeding timed out after XX seconds`
- ⚠️ Partial: `✅ Seeded XXX Pokemon` (where XXX < expected total)

### **Step 2: Verify Total Count via API**

```bash
curl -s "http://localhost/api/v1/pokemon?per_page=1000" | \
  python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Total Pokemon: {data[\"pagination\"][\"total\"]}')"
```

**Expected Results by Generation**:
- Gen 1 (Kanto): 151 total
- Gen 1-2 (Johto): 251 total
- Gen 1-3 (Hoenn): 386 total
- Gen 1-4 (Sinnoh): 493 total
- Gen 1-5 (Unova): 649 total

### **Step 3: Test Specific Generation**

```bash
# Test highest generation (Gen 5 for current setup)
curl -s "http://localhost/api/v1/pokemon?generation=5&per_page=3" | python3 -m json.tool
```

**What to look for**:
- ✅ Success: Returns Pokemon data (Victini, Snivy, etc.)
- ❌ Failure: Returns empty array `"pokemon": []`

### **Step 4: Check Container Health**

```bash
docker ps
```

**Status Indicators**:
- ✅ `Up X minutes (healthy)` - Container passed health checks
- ⚠️ `Up X minutes (health: starting)` - Still initializing (wait for seeding)
- ❌ `Up X minutes (unhealthy)` - Health checks failing

---

## 🛠️ Solution

### **Files to Update**

When adding more Pokemon generations, update these files:

#### **1. `scripts/core/docker-startup.sh`**

**Location**: Pokemon seeding timeout
```bash
# OLD (insufficient)
cd /app && timeout 60s python -c "

# NEW (calculate based on Pokemon count)
cd /app && timeout 120s python -c "
```

**Calculation Formula**:
```
Timeout (seconds) = (Total Pokemon × 0.2s) + 30s buffer
```

**Examples**:
- 151 Pokemon (Gen 1): `timeout 60s` (151 × 0.2 + 30 = 60s)
- 386 Pokemon (Gen 1-3): `timeout 110s` (386 × 0.2 + 30 = 107s)
- 649 Pokemon (Gen 1-5): `timeout 120s` (649 × 0.2 + 30 = 160s, capped at 120s with optimization)
- 898 Pokemon (Gen 1-8): `timeout 210s` (898 × 0.2 + 30 = 210s)

Also update the success message:
```bash
print(f'✅ Seeded {result[\"successful\"]} Pokemon from Generations 1-5')
#                                                                    ^^^
#                                                           Update generation range
```

And error message:
```bash
echo "⚠️ Pokemon seeding timed out after 120 seconds"
#                                              ^^^
#                                    Match timeout value
```

#### **2. `docker-compose.yml`**

**Location**: Health check `start_period`

```yaml
healthcheck:
  test: [ "CMD", "curl", "-f", "http://localhost/" ]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 130s  # <-- Update this
```

**Calculation Formula**:
```
start_period = Seeding Timeout + 10s buffer
```

**Examples**:
- 60s seeding timeout → `start_period: 70s`
- 120s seeding timeout → `start_period: 130s`
- 210s seeding timeout → `start_period: 220s`

---

## 📋 Step-by-Step Fix Procedure

### **When Adding New Generations**

1. **Calculate Required Timeout**
   ```bash
   # Example for Gen 1-6 (721 Pokemon)
   Total Pokemon: 721
   Timeout needed: (721 × 0.2) + 30 = 174s
   Round up to: 180s
   ```

2. **Update `docker-startup.sh`**
   ```bash
   vim scripts/core/docker-startup.sh
   
   # Change line 22:
   cd /app && timeout 180s python -c "
   
   # Change line 28:
   print(f'✅ Seeded {result["successful"]} Pokemon from Generations 1-6')
   
   # Change line 33:
   echo "⚠️ Pokemon seeding timed out after 180 seconds"
   ```

3. **Update `docker-compose.yml`**
   ```bash
   vim docker-compose.yml
   
   # Change line 22:
   start_period: 190s
   ```

4. **Update Backend Configuration**
   ```bash
   vim backend/utils/generation_config.py
   # Add new generation entries
   
   vim backend/utils/pokemon_seeder.py
   # Add new seed_generation_X methods
   # Update seed_all_generations()
   ```

5. **Rebuild and Test**
   ```bash
   # Stop containers
   docker compose down
   
   # Rebuild with no cache
   docker compose build --no-cache
   
   # Start containers
   docker compose up -d
   
   # Monitor seeding progress
   docker compose logs -f pokehub-app
   ```

6. **Verify Success**
   ```bash
   # Wait for seeding to complete (watch logs)
   # Then verify total count
   curl -s "http://localhost/api/v1/pokemon?per_page=1000" | \
     python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Total: {data[\"pagination\"][\"total\"]}')"
   
   # Test highest generation
   curl -s "http://localhost/api/v1/pokemon?generation=6&per_page=3" | python3 -m json.tool
   ```

---

## 🔄 Historical Timeout Values

| Date | Generations | Total Pokemon | Timeout | Health Check | Status |
|------|-------------|---------------|---------|--------------|--------|
| Early Dev | 1-3 | 386 | 30s | 40s | ❌ Insufficient |
| Mid Dev | 1-5 | 649 | 60s | 70s | ❌ Partial seeding |
| **Current** | **1-5** | **649** | **120s** | **130s** | ✅ **Working** |

---

## 💡 Optimization Tips

### **Speed Up Seeding (Future Improvements)**

1. **Parallel API Calls**
   - Use `asyncio` or `concurrent.futures` to fetch multiple Pokemon simultaneously
   - Could reduce seeding time by 50-70%
   ```python
   # Instead of sequential:
   for pokemon_id in range(1, 650):
       fetch_pokemon(pokemon_id)
   
   # Use parallel:
   with ThreadPoolExecutor(max_workers=10) as executor:
       executor.map(fetch_pokemon, range(1, 650))
   ```

2. **Caching Strategy**
   - Pre-download Pokemon data during Docker build
   - Store in SQLite file included in image
   - Skip API calls entirely during startup

3. **Selective Seeding**
   - Seed only new generations on updates
   - Check existing data before fetching
   ```python
   if pokemon_exists(pokemon_id):
       continue  # Skip already seeded
   ```

4. **Background Seeding**
   - Start Flask/Nginx immediately
   - Seed Pokemon in background task
   - Mark data as "loading" until complete

---

## 🎯 Prevention Checklist

When adding new Pokemon generations, ensure:

- [ ] Updated `scripts/core/docker-startup.sh` timeout
- [ ] Updated `docker-compose.yml` health check `start_period`
- [ ] Updated generation message in success output
- [ ] Updated generation message in timeout output
- [ ] Added new generation to `backend/utils/generation_config.py`
- [ ] Added seed method to `backend/utils/pokemon_seeder.py`
- [ ] Updated `seed_all_generations()` to include new generation
- [ ] Tested with `docker compose build --no-cache`
- [ ] Verified complete seeding in logs
- [ ] Verified API returns correct total count
- [ ] Verified new generation is accessible
- [ ] Updated documentation (this file!)

---

## 🐛 Common Mistakes

### **Mistake 1: Only Updating One File**
❌ **Wrong**: Update timeout in `docker-startup.sh` but forget `docker-compose.yml`  
✅ **Right**: Update both files to keep timeouts in sync

### **Mistake 2: Timeout Too Close to Seeding Time**
❌ **Wrong**: Seeding takes 100s, set timeout to 100s  
✅ **Right**: Add 10-30s buffer for network variability

### **Mistake 3: Forgetting to Rebuild**
❌ **Wrong**: Change files and run `docker compose up`  
✅ **Right**: Always rebuild: `docker compose build --no-cache`

### **Mistake 4: Not Verifying Complete Seeding**
❌ **Wrong**: Assume it worked because container is healthy  
✅ **Right**: Check logs and verify Pokemon count via API

---

## 📚 Related Documentation

- [Backend Pokemon Seeder](../../technical/backend-overview.md#pokemon-seeder)
- [Docker Setup Guide](../../technical/guides/docker-guide.md)
- [PokeAPI Integration Strategy](../../planning/adrs/adr-005-pokeapi-integration-strategy.md)
- [Generation Configuration](../../../backend/utils/generation_config.py)

---

## 📝 Quick Reference Commands

```bash
# Stop containers
docker compose down

# Rebuild (no cache)
docker compose build --no-cache

# Start containers
docker compose up -d

# Watch logs
docker compose logs -f pokehub-app

# Check total Pokemon
curl -s "http://localhost/api/v1/pokemon?per_page=1000" | \
  python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Total: {data[\"pagination\"][\"total\"]}')"

# Test generation (replace 5 with target generation)
curl -s "http://localhost/api/v1/pokemon?generation=5&per_page=3" | python3 -m json.tool

# Check container status
docker ps

# View full logs
docker compose logs pokehub-app

# Check health
docker inspect pokedex-pokehub-app-1 | grep -A 10 Health
```

---

## ✅ Resolution Summary

**Problem**: Docker seeding timed out at 60s, only seeding 388 of 649 Pokemon  
**Solution**: Increased timeout to 120s and health check `start_period` to 130s  
**Result**: All 649 Pokemon across 5 generations successfully seeded  
**Lesson**: Always calculate timeout based on Pokemon count, not guesswork

---

**Last Updated**: October 3, 2025  
**Author**: grimm00  
**Next Review**: When adding Generation 6+ Pokemon
