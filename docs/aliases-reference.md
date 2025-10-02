# Pokehub Development Aliases Reference

This document lists all the convenient aliases added to your `.zshrc` for Pokehub development.

## 🚀 Comprehensive Workflow Helper

### Main Workflow Commands
```bash
wf                   # Show workflow helper menu
wf-help              # Show detailed help
wf-status            # Show comprehensive project status
```

## 🌳 Git Flow Aliases

### Main Git Flow Helper
```bash
gf                    # Show Git Flow helper menu
gf-status            # Show current Git Flow status
gf-sync              # Sync develop branch with main
```

### Enhanced Git Flow (Workflow Helper Integration)
```bash
sf <name>            # Start new feature branch (short for start-feature)
fix <name>           # Start new fix branch  
hotfix <name>        # Start hotfix branch from main
wf-release <version> # Prepare release with version bump
wf-sync              # Sync develop with main
```

### Legacy Git Flow Helper
```bash
gf-feature <name>    # Start new feature branch from develop
gf-fix <name>        # Start new fix branch from develop  
gf-hotfix <name>     # Start hotfix branch from main
gf-release <version> # Prepare release with version bump
gf-sync              # Sync develop with main
```

### Examples
```bash
sf user-authentication    # Enhanced workflow helper
fix search-performance    # Enhanced workflow helper
hotfix security-patch     # Enhanced workflow helper
wf-release 1.3.0         # Enhanced release management
```

## 🚀 Pokehub Development Shortcuts

### Project Navigation
```bash
pokehub             # Navigate to Pokehub project directory
```

### Development Commands
```bash
pokehub-backend     # Start the backend server
pokehub-test        # Run all tests (frontend + backend)
pokehub-setup       # Run project setup script
pokedex-frontend    # Start frontend development server
wf-dev              # Start both backend and frontend servers
wf-test             # Run comprehensive test suite
```

## 📝 GitHub Integration Aliases

### Pull Request Management
```bash
pr                  # Create PR (auto-detects target branch)
pr-main             # Create PR to main branch
prs                 # List open pull requests
prv [number]        # View PR in browser
```

### CI/CD Integration
```bash
ci                  # Show GitHub Actions workflow status
ci-logs [run-id]    # Show workflow logs
```

## 🔄 Enhanced Workflow Aliases

### Development Workflow
```bash
wf-push             # Push current branch to origin
wf-pull             # Pull current branch from origin
wf-clean            # Clean up merged branches
```

## 📋 Git Workflow Shortcuts

### Branch Operations
```bash
gst                 # git status
gco <branch>        # git checkout <branch>
gcb <branch>        # git checkout -b <branch> (create new branch)
gbranch             # git branch -v (show branches with last commit)
```

### Push/Pull Operations
```bash
gpush               # Push current branch to origin
gpull               # Pull current branch from origin
```

### History and Logs
```bash
glog                # Show last 10 commits in oneline format
```

## 🔄 Enhanced Workflow Examples

### Complete Feature Development Workflow
```bash
# Start new feature
sf user-profiles           # Creates feat/user-profiles from develop
# Work on your feature...
wf-test                    # Run all tests
wf-push                    # Push to origin
pr                         # Create PR (auto-detects target: develop)
```

### Bug Fix Workflow with GitHub Integration
```bash
fix broken-search          # Creates fix/broken-search from develop
# Fix the issue...
wf-test                    # Verify fix with tests
pr                         # Create PR and open in browser
prs                        # Check PR status
```

### Hotfix Workflow
```bash
hotfix security-patch      # Creates fix/security-patch from main
# Fix critical issue...
pr-main                    # Create PR to main branch
# After merge to main:
wf-sync                    # Sync develop with main changes
```

### Development Session
```bash
pokehub                    # Navigate to project
wf-status                  # Comprehensive project status
wf-dev                     # Start both servers automatically
```

### Release Management
```bash
wf-release 1.3.0          # Prepare release with version bump
pr-main                    # Create PR to main
# After merge and deployment:
wf-clean                   # Clean up merged branches
```

### CI/CD Monitoring
```bash
ci                         # Check GitHub Actions status
ci-logs 12345              # View specific workflow run logs
prs                        # Check open PRs
```

## 💡 Tips

1. **New Terminal Sessions**: These aliases will be available in new terminal sessions after restarting your terminal or running `source ~/.zshrc`

2. **Current Session**: If aliases don't work in current session, restart your terminal or manually source: `source ~/.zshrc`

3. **Customization**: You can modify these aliases in your `~/.zshrc` file

4. **Git Flow**: Always use `gf-feature` and `gf-fix` instead of manual branch creation to maintain proper Git Flow

5. **Status Checking**: Use `gf-status` regularly to see your current Git Flow state

## 🔧 Troubleshooting

If aliases don't work:
```bash
# Reload your shell configuration
source ~/.zshrc

# Check if alias exists
alias gf-status

# Manually navigate and run if needed
cd /Users/cdwilson/Projects/pokedex
./scripts/git-flow-helper.sh status
```
