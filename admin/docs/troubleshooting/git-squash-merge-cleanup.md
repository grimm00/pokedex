# Git Squash Merge Cleanup Troubleshooting

**Issue**: Remote branches persist after PR is merged (squash merge)  
**Date**: October 3, 2025  
**Status**: ✅ **RESOLVED**

---

## 🎯 Quick Summary

**Problem**: Branches remain after merging PRs using squash merge  
**Root Cause**: `git branch --merged` doesn't detect squash-merged branches  
**Solution**: Use GitHub API to check PR status instead of Git merge detection  
**Fixed In**: PR #15 - Enhanced cleanup command

---

## 🔍 Symptoms

1. ✅ Pull request shows as "MERGED" on GitHub
2. ❌ Remote branch still exists after merge
3. ❌ `cleanup --yes` reports "No remote merged branches to clean up"
4. ⚠️ Local branch persists after merge

---

## 📋 Quick Diagnosis

###Step 1: Check PR Status**
```bash
gh pr view <PR-NUMBER> --json state,mergedAt
# Expected: {"state":"MERGED", "mergedAt":"2025-10-03T22:XX:XX"}
```

### **Step 2: Check Remote Branch**
```bash
git ls-remote --heads origin <branch-name>
# If output exists, branch is still on remote
```

### **Step 3: Verify Cleanup Detection**
```bash
cleanup --yes
# Should now detect and delete squash-merged branches
```

---

## 🛠️ Solution

### **Root Cause Explained**

**Squash Merges Rewrite History**:
- Traditional merge: Creates merge commit linking branch history
- Squash merge: Combines all commits into ONE new commit
- Git loses the connection between branch and merged commits
- `git branch --merged` can't detect the merge

**The Fix** (PR #15):
- Query GitHub API for PR status
- Check ALL remote feature/fix/chore branches
- Delete only branches with confirmed MERGED PRs

---

## ✅ Verification After Fix

### **Test Cleanup Command**:
```bash
cleanup --yes
```

**Expected Output**:
```
🧹 Cleaning up merged branches (non-interactive mode)
🔍 Checking remote branches...
Checking PR status for remote branches...
Found merged remote branches:
  feat/some-feature
  fix/some-bug
Deleting remote merged branches...
✅ Remote cleanup complete
🎉 Branch cleanup complete!
```

### **Verify Branch Deleted**:
```bash
# Check remote
git ls-remote --heads origin <branch-name>
# (should be empty)

# Check local branches
git branch -a
# (should not show origin/<branch-name>)
```

---

## 🔄 Manual Cleanup (If Needed)

If you need to manually clean up a squash-merged branch:

```bash
# Delete remote branch
git push origin --delete <branch-name>

# Delete local branch
git branch -D <branch-name>

# Or use the enhanced cleanup command
cleanup --yes
```

---

## 💡 Prevention

The enhanced cleanup command (PR #15) handles this automatically:

1. **Always use the cleanup command after merges**
   ```bash
   cleanup --yes
   ```

2. **Or use GitHub's auto-delete feature**
   - Go to repo Settings → General
   - Enable "Automatically delete head branches"

3. **Use the workflow helper aliases**
   ```bash
   # After PR is merged
   cleanup --yes
   ```

---

## 📚 Technical Details

### **Why Git's `--merged` Flag Fails**

```bash
# Traditional merge (works):
git checkout main
git merge feature-branch  # Creates merge commit
git branch --merged       # ✅ Detects feature-branch

# Squash merge (doesn't work):
gh pr merge --squash      # Rewrites history into 1 commit
git branch --merged       # ❌ Doesn't detect feature-branch
```

### **GitHub API Solution**

```bash
# Check PR status via API
gh pr list --head "feat/my-feature" --state merged --json state
# Returns: [{"state":"MERGED"}] if squash-merged
```

---

## 🎯 Related Documentation

- [Git Flow Safety System](../git-flow-safety-improvements.md)
- [Workflow Helper Commands](../../../scripts/workflow-helper.sh)
- [GitHub Squash Merge Documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#squash-and-merge-your-commits)

---

## 📝 Quick Reference Commands

```bash
# Check PR status
gh pr view <PR-NUMBER> --json state,mergedAt

# Check if remote branch exists
git ls-remote --heads origin <branch-name>

# Run enhanced cleanup
cleanup --yes

# Manual remote branch deletion
git push origin --delete <branch-name>

# Manual local branch deletion
git branch -D <branch-name>

# List all branches
git branch -a
```

---

**Last Updated**: October 3, 2025  
**Fixed In**: PR #15  
**Status**: ✅ Resolved - cleanup command now handles squash merges
