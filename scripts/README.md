# 🛠️ Pokehub Scripts Directory

This directory contains all automation scripts for the Pokehub project, organized by function for better maintainability.

## 📁 Directory Structure

```
scripts/
├── workflow-helper.sh          # 🌟 Main workflow automation tool
├── core/                       # Essential operational scripts
├── deployment/                 # CI/CD and deployment scripts
├── setup/                      # Initial project setup scripts
├── monitoring/                 # Status and monitoring scripts
├── testing/                    # Test automation scripts
└── deprecated/                 # Legacy scripts (kept for reference)
```

## 🌟 Main Tool

### `workflow-helper.sh`
The primary automation tool that provides:
- **Git Flow**: Feature/fix/hotfix branch management
- **GitHub Integration**: PR creation, status checking, CI/CD monitoring
- **Development**: Start servers, run tests, push/pull operations
- **Repository Management**: Branch cleanup, status reporting, releases

**Quick Start:**
```bash
./scripts/workflow-helper.sh help          # Show all commands
./scripts/workflow-helper.sh status        # Project status
./scripts/workflow-helper.sh sf my-feature # Start feature branch
```

## 📂 Core Scripts (`core/`)

Essential operational scripts for the application:

| Script | Purpose |
|--------|---------|
| `docker-startup.sh` | Container initialization and startup sequence |
| `health-check.sh` | Application health monitoring |
| `invalidate-cache.sh` | Cache management and invalidation |

## 🚀 Deployment Scripts (`deployment/`)

CI/CD and deployment automation:

| Script | Purpose |
|--------|---------|
| `deploy.sh` | Application deployment automation |
| `rollback.sh` | Deployment rollback procedures |
| `test-docker.sh` | Docker container testing |

## ⚙️ Setup Scripts (`setup/`)

Initial project configuration and setup:

| Script | Purpose |
|--------|---------|
| `github-setup.sh` | 🔄 Consolidated GitHub CI/CD and permissions setup |
| `production-setup.sh` | 🔄 Consolidated production and secrets configuration |
| `security-toggle.sh` | 🔄 Consolidated security scans enable/disable |
| `configure-github-permissions.sh` | Legacy: GitHub permissions (use github-setup.sh) |
| `setup-github-ci-cd.sh` | Legacy: CI/CD setup (use github-setup.sh) |
| `setup-github-secrets.sh` | Legacy: GitHub secrets (use production-setup.sh) |
| `setup-production-secrets.sh` | Legacy: Production secrets (use production-setup.sh) |

**Recommended Usage:**
```bash
# Complete GitHub setup
./scripts/setup/github-setup.sh

# Production environment setup
./scripts/setup/production-setup.sh

# Toggle security scans
./scripts/setup/security-toggle.sh enable
```

## 📊 Monitoring Scripts (`monitoring/`)

Project status and monitoring automation:

| Script | Purpose |
|--------|---------|
| `automated-status-check.sh` | CI/CD status verification |
| `verify-project-status.sh` | Project state validation |
| `weekly-status-review.sh` | Weekly progress reporting |

## 🧪 Testing Scripts (`testing/`)

Test automation organized by feature/phase:

### Phase 4B Testing (`testing/phase4b/`)
| Script | Purpose |
|--------|---------|
| `comprehensive.sh` | Full Phase 4B feature testing |
| `quick.sh` | CI/CD optimized quick validation |
| `simple.sh` | Basic functionality validation |

## 🗑️ Deprecated Scripts (`deprecated/`)

Legacy scripts kept for reference:

| Script | Status | Replacement |
|--------|--------|-------------|
| `git-flow-helper.sh` | ❌ Superseded | `workflow-helper.sh` |
| `enable-security-scans.sh` | ❌ Consolidated | `setup/security-toggle.sh enable` |
| `disable-security-scans.sh` | ❌ Consolidated | `setup/security-toggle.sh disable` |

## 🔧 Shell Aliases

The project includes comprehensive shell aliases for common operations:

```bash
# Main workflow commands
wf                    # Direct workflow helper access
status               # Project status
sf <name>            # Start feature branch
fix <name>           # Start fix branch
chore <name>         # Start chore branch
cleanup              # Clean merged branches

# GitHub integration
pr                   # Create pull request
prs                  # List pull requests
ci                   # CI/CD status

# Development
wf-dev               # Start development servers
wf-test              # Run tests
```

## 📋 Usage Examples

### Starting a New Feature
```bash
sf user-authentication          # Start feature branch
# ... make changes ...
wf-push                        # Push changes
pr                            # Create pull request
```

### Project Status Check
```bash
status                        # Comprehensive status
ci                           # CI/CD status
./scripts/monitoring/verify-project-status.sh  # Detailed verification
```

### Setup New Environment
```bash
./scripts/setup/github-setup.sh      # Configure GitHub
./scripts/setup/production-setup.sh  # Configure production
```

## 🔄 Recent Improvements

- **Consolidated Scripts**: Reduced from 21 to 15 scripts by eliminating redundancy
- **Better Organization**: Logical grouping by function
- **Enhanced Workflow**: Single `workflow-helper.sh` replaces multiple tools
- **Improved Aliases**: Comprehensive shell integration
- **Clear Documentation**: Better structure and usage examples

## 🚀 Getting Started

1. **Use the main workflow tool**: `./scripts/workflow-helper.sh help`
2. **Set up aliases**: Source your shell configuration to load aliases
3. **Start development**: `sf my-feature` to begin working
4. **Check status**: `status` for comprehensive project overview

For detailed command help, run any script with `--help` or check the workflow helper: `./scripts/workflow-helper.sh help`