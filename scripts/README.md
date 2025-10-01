# Scripts Directory

This directory contains utility scripts for development, deployment, testing, and project management.

## 📁 Script Categories

### **Development & Setup**
- `setup.sh` - Initial project setup script
- `test-docker.sh` - Docker testing utilities

### **GitHub & CI/CD**
- `setup-github-ci-cd.sh` - Complete GitHub Actions setup
- `setup-github-secrets.sh` - GitHub secrets configuration
- `configure-github-permissions.sh` - GitHub workflow permissions
- `setup-production-secrets.sh` - Production environment secrets

### **Deployment & Operations**
- `deploy.sh` - Application deployment script
- `rollback.sh` - Rollback deployment script
- `health-check.sh` - Health check utilities
- `invalidate-cache.sh` - Cache invalidation script

### **Testing & Quality**
- `test-phase4b-comprehensive.sh` - Comprehensive Phase 4B testing
- `test-phase4b-quick.sh` - Quick Phase 4B validation
- `test-phase4b-simple.sh` - Simple Phase 4B testing

### **Project Management**
- `verify-project-status.sh` - Project status verification
- `automated-status-check.sh` - Automated status monitoring
- `weekly-status-review.sh` - Weekly project review

## 🚀 Quick Reference

### **Development Setup**
```bash
# Initial setup
./scripts/setup.sh

# Test Docker setup
./scripts/test-docker.sh
```

### **GitHub Setup**
```bash
# Complete GitHub Actions setup
./scripts/setup-github-ci-cd.sh

# Configure secrets
./scripts/setup-github-secrets.sh
```

### **Deployment**
```bash
# Deploy application
./scripts/deploy.sh

# Health check
./scripts/health-check.sh

# Rollback if needed
./scripts/rollback.sh
```

### **Testing**
```bash
# Comprehensive testing
./scripts/test-phase4b-comprehensive.sh

# Quick validation
./scripts/test-phase4b-quick.sh
```

### **Project Management**
```bash
# Verify project status
./scripts/verify-project-status.sh

# Weekly review
./scripts/weekly-status-review.sh
```

## 📝 Script Documentation

Each script includes:
- **Purpose**: What the script does
- **Usage**: How to run it
- **Dependencies**: What's required
- **Output**: What to expect
- **Error Handling**: How errors are managed

## 🔧 Customization

Scripts are designed to be:
- **Configurable**: Environment variables for customization
- **Portable**: Work across different environments
- **Maintainable**: Clear structure and documentation
- **Testable**: Include validation and error checking

## 🚨 Important Notes

- **Permissions**: Some scripts may require `chmod +x` to execute
- **Environment**: Ensure proper environment variables are set
- **Dependencies**: Check script dependencies before running
- **Backup**: Always backup before running deployment scripts

---

**Last Updated**: October 1, 2025  
**Status**: ✅ Organized and Documented
