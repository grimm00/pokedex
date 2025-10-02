# Pokehub Development Aliases Reference

This document lists all the convenient aliases added to your `.zshrc` for Pokehub development.

## 🌳 Git Flow Aliases

### Main Git Flow Helper
```bash
gf                    # Show Git Flow helper menu
gf-status            # Show current Git Flow status
gf-sync              # Sync develop branch with main
```

### Branch Management
```bash
gf-feature <name>    # Start new feature branch from develop
gf-fix <name>        # Start new fix branch from develop  
gf-hotfix <name>     # Start hotfix branch from main
gf-release <version> # Prepare release with version bump
```

### Examples
```bash
gf-feature user-authentication
gf-fix search-performance
gf-hotfix security-patch
gf-release 1.3.0
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

## 🔄 Typical Workflow Examples

### Starting New Feature
```bash
gf-feature user-profiles    # Creates feat/user-profiles from develop
# Work on your feature...
gpush                       # Push to origin/feat/user-profiles
```

### Bug Fix Workflow
```bash
gf-fix broken-search       # Creates fix/broken-search from develop
# Fix the issue...
gpush                      # Push to origin/fix/broken-search
```

### Quick Status Check
```bash
gf-status                  # See Git Flow status
gst                        # See git status
glog                       # See recent commits
```

### Development Session
```bash
pokehub                    # Navigate to project
gf-status                  # Check current state
pokehub-backend            # Start backend (Terminal 1)
pokedex-frontend           # Start frontend (Terminal 2)
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
