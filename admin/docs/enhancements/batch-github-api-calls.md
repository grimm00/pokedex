# Batch GitHub API Calls Enhancement

**Date**: October 3, 2025  
**Status**: 🔄 IN PROGRESS  
**Priority**: 🟡 MEDIUM  
**Target**: Version 1.x

---

## 📋 Overview

**Sourcery Feedback**: "Consider batching GitHub API calls (for example with a single `gh pr list` using multiple `--head` filters) to reduce CLI invocations when checking many branches."

**Goal**: Optimize branch cleanup by batching GitHub API calls instead of making individual calls per branch.

---

## ❌ Current Implementation (Inefficient)

**Location**: `scripts/workflow-helper.sh` - `clean` command

**How it works**:
```bash
# Check each branch individually
for branch in $ALL_REMOTE_BRANCHES; do
    # One API call per branch
    PR_STATE=$(gh pr list --head "$branch" --state merged --json state --jq '.[0].state' 2>/dev/null || echo "")
    if [ "$PR_STATE" = "MERGED" ]; then
        REMOTE_MERGED_BRANCHES="$REMOTE_MERGED_BRANCHES
$branch"
    fi
done
```

**Problems**:
- 🐌 **Slow**: 10 branches = 10 separate API calls
- ⚠️ **Rate Limiting Risk**: Each call counts against GitHub API limits
- 🌐 **Network Overhead**: Each call requires a full network round-trip
- ⏱️ **Time**: ~500ms per call = 5 seconds for 10 branches

---

## ✅ Proposed Implementation (Efficient)

**Single batched call**:
```bash
# OLD: Multiple calls (one per branch)
for branch in $branches; do
    gh pr list --head "$branch" --state merged
done

# NEW: Single batched call
gh pr list --state merged --json headRefName,state | \
    jq -r '.[] | select(.state=="MERGED") | .headRefName'
```

**How it works**:
1. **Single API call** - Get ALL merged PRs at once
2. **JSON output** - Get structured data with branch names
3. **Filter locally** - Use `jq` to extract merged branch names
4. **Compare** - Match against local branches

---

## 📈 Performance Comparison

### **Scenario: 20 Feature Branches**

| Method | API Calls | Time | Rate Limit Impact |
|--------|-----------|------|-------------------|
| **Current** | 20 calls | ~10 seconds | 20 requests used |
| **Batched** | 1 call | ~500ms | 1 request used |
| **Improvement** | **95% fewer** | **20x faster** | **95% less impact** |

### **Benefits**

| Aspect | Current | With Batching | Improvement |
|--------|---------|---------------|-------------|
| API Calls | N (per branch) | 1 | **~95% reduction** |
| Time | ~500ms × N | ~500ms | **Nx faster** |
| Rate Limiting | High risk | Low risk | **Safer** |
| Network | N round-trips | 1 round-trip | **Efficient** |

**Additional Benefits**:
- ✅ **Faster cleanup** - Especially with many branches
- ✅ **Reduced rate limiting risk** - Fewer API calls
- ✅ **Better scalability** - Works well with 50+ branches
- ✅ **Single network round-trip** - More reliable
- ✅ **Consistent performance** - Time doesn't scale with branch count

---

## ⚠️ Trade-offs

### **Complexity**
- Requires `jq` for JSON parsing (additional dependency)
- More complex query logic
- Less granular error handling per branch

### **Dependencies**
```bash
# New dependency: jq
brew install jq        # macOS
apt-get install jq     # Linux
choco install jq       # Windows
```

### **Error Handling**
- **Current**: Know which specific branch failed
- **Batched**: Single failure affects all branches
- **Solution**: Add retry logic + fallback to individual calls

---

## 💡 Implementation Plan

### **Phase 1: Add jq Dependency Check** ✅ IN PROGRESS

**File**: `scripts/core/git-flow-utils.sh`

```bash
# Check if jq is installed and available
gf_check_jq() {
    local msg_type="${1:-error}"  # error or warning
    
    if ! command -v jq &>/dev/null; then
        if [ "$msg_type" = "error" ]; then
            gf_print_status "$GF_RED" "❌ jq is required for GitHub API operations"
            echo ""
            echo "Install jq:"
            echo "  macOS:   brew install jq"
            echo "  Linux:   apt-get install jq"
            echo "  Windows: choco install jq"
            echo ""
            echo "More info: https://stedolan.github.io/jq/"
            return 1
        else
            gf_print_status "$GF_YELLOW" "⚠️  jq not found, using slower individual API calls"
            return 1
        fi
    fi
    return 0
}
```

**Integration**:
- Add to `gf_check_optional_dependencies()`
- Export function for use in other scripts
- Add to dependency documentation

### **Phase 2: Implement Batched API Call**

**File**: `scripts/workflow-helper.sh` - `clean` command

```bash
# Function to get merged branches using batched API call
get_merged_branches_batched() {
    local branches_to_check="$1"
    
    # Get ALL merged PRs in one call
    local merged_prs
    merged_prs=$(gh pr list --state merged --json headRefName,state \
        --jq '.[] | select(.state=="MERGED") | .headRefName' 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        gf_print_status "$GF_RED" "❌ Failed to fetch merged PRs from GitHub"
        return 1
    fi
    
    # Filter local branches against merged PRs
    local merged_branches=""
    for branch in $branches_to_check; do
        if echo "$merged_prs" | grep -q "^${branch}$"; then
            if [ -z "$merged_branches" ]; then
                merged_branches="$branch"
            else
                merged_branches="$merged_branches
$branch"
            fi
        fi
    done
    
    echo "$merged_branches"
    return 0
}
```

### **Phase 3: Add Fallback Logic**

```bash
# Try batched approach first, fallback to individual calls
if gf_check_jq "warning"; then
    echo "${CYAN}🚀 Using batched GitHub API calls (faster)${NC}"
    MERGED_BRANCHES=$(get_merged_branches_batched "$ALL_LOCAL_BRANCHES")
else
    echo "${YELLOW}⚠️  Using individual API calls (slower)${NC}"
    # Existing individual call logic
    for branch in $ALL_LOCAL_BRANCHES; do
        PR_STATE=$(gh pr list --head "$branch" --state merged --json state --jq '.[0].state' 2>/dev/null || echo "")
        if [ "$PR_STATE" = "MERGED" ]; then
            # ... existing logic ...
        fi
    done
fi
```

### **Phase 4: Update Documentation**

**Files to Update**:
- `README.md` - Add jq to optional dependencies
- `DEVELOPMENT.md` - Document jq requirement for optimal performance
- `scripts/setup/install-dependencies.sh` - Add jq installation
- `admin/docs/git-flow-enhancements-summary.md` - Document enhancement

---

## 🧪 Testing Plan

### **Test 1: With jq Installed**
```bash
# Install jq
brew install jq

# Run cleanup with verbose mode
./scripts/workflow-helper.sh clean --verbose

# Expected: "Using batched GitHub API calls (faster)"
# Expected: Significantly faster execution
```

### **Test 2: Without jq (Fallback)**
```bash
# Temporarily hide jq
alias jq='echo "jq not found" && false'

# Run cleanup
./scripts/workflow-helper.sh clean --verbose

# Expected: "Using individual API calls (slower)"
# Expected: Falls back to current implementation
```

### **Test 3: Performance Benchmark**
```bash
# Create 10 test branches
for i in {1..10}; do
    git checkout -b "test/branch-$i"
    git push -u origin "test/branch-$i"
done

# Time current implementation
time ./scripts/workflow-helper.sh clean

# Time batched implementation
time ./scripts/workflow-helper.sh clean

# Compare results
```

### **Test 4: Error Handling**
```bash
# Test with network issues
# Test with invalid GitHub token
# Test with rate limiting
# Verify graceful fallback
```

---

## 📊 Success Metrics

### **Performance Targets**

| Branches | Current Time | Target Time | Improvement |
|----------|--------------|-------------|-------------|
| 5 | ~2.5s | ~0.5s | 5x faster |
| 10 | ~5s | ~0.5s | 10x faster |
| 20 | ~10s | ~0.5s | 20x faster |
| 50 | ~25s | ~0.5s | 50x faster |

### **API Usage Targets**

| Branches | Current Calls | Target Calls | Reduction |
|----------|---------------|--------------|-----------|
| 5 | 5 | 1 | 80% |
| 10 | 10 | 1 | 90% |
| 20 | 20 | 1 | 95% |
| 50 | 50 | 1 | 98% |

---

## 🎯 Acceptance Criteria

- [ ] `gf_check_jq()` function implemented and tested
- [ ] Batched API call function implemented
- [ ] Fallback to individual calls when jq unavailable
- [ ] Performance improvement verified (>10x for 20+ branches)
- [ ] Error handling for API failures
- [ ] Documentation updated (README, DEVELOPMENT.md)
- [ ] All tests passing
- [ ] Backwards compatible (works without jq)

---

## 🔗 Related

- **Sourcery Feedback**: PR #25 comments
- **Related Enhancement**: Preflight Check for GitHub CLI (#12)
- **Documentation**: `admin/docs/sourcery-future-improvements.md`
- **Implementation**: `scripts/workflow-helper.sh`, `scripts/core/git-flow-utils.sh`

---

## 📝 Implementation Log

### **October 3, 2025 - Session 1**
- ✅ Created enhancement documentation (351 lines)
- ✅ **Phase 1 COMPLETE**: jq dependency check
  - Implemented `gf_check_jq()` function in `git-flow-utils.sh`
  - Added to exports for use in other scripts
  - Tested and verified working
  
- ✅ **Phase 2 COMPLETE**: Batched API call functions
  - Implemented `get_merged_branches_batched()` function
  - Implemented `get_merged_branches_individual()` fallback
  - Comprehensive error handling
  - Tested and verified working

- ✅ **Phase 3 COMPLETE**: Integration with cleanup command
  - Updated local branch cleanup logic
  - Updated remote branch cleanup logic
  - Automatic jq detection and fallback
  - User-friendly status messages

- 📋 **Phase 4 PENDING**: Documentation updates
  - Update README.md with jq dependency
  - Update DEVELOPMENT.md with performance notes
  - Update enhancement tracking

---

**Status**: Phases 1-3 complete (75% done)  
**Next Steps**: Phase 4 - Documentation updates  
**Expected Completion**: October 3, 2025 (today!)
