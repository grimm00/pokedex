# CI/CD Quick Reference Guide

**Date**: January 20, 2025  
**Status**: READY  
**Purpose**: Quick reference for CI/CD implementation

## 🚀 **Quick Start Commands**

### **Local Development**
```bash
# Run tests locally
npm run test
pytest tests/ -v

# Run Docker tests
cd tests/docker
docker-compose -f docker-compose.test.yml up --build -d

# Check test status
docker-compose -f docker-compose.test.yml ps
```

### **GitHub Actions**
```bash
# Trigger CI pipeline
git push origin develop

# Trigger CD pipeline
git push origin main

# Check workflow status
gh run list
gh run view <run-id>
```

### **Docker Registry**
```bash
# Login to registry
docker login ghcr.io

# Pull images
docker pull ghcr.io/username/pokedex/frontend:latest
docker pull ghcr.io/username/pokedex/backend:latest

# Push images (automated via GitHub Actions)
# Manual push if needed
docker tag pokedex-frontend ghcr.io/username/pokedex/frontend:latest
docker push ghcr.io/username/pokedex/frontend:latest
```

## 📋 **Workflow Triggers**

| Event | Branch | Action | Result |
|-------|--------|--------|---------|
| **Push** | `develop` | Run tests + Deploy to dev | Auto-deploy to development |
| **Push** | `main` | Full pipeline + Deploy to prod | Auto-deploy to production |
| **PR** | `main` | Run tests + Security scan | Block merge if tests fail |
| **Tag** | `v*` | Create release + Deploy | Tagged release deployment |

## 🔧 **Environment Configuration**

### **Development**
- **URL**: `dev.pokedex.local`
- **Database**: SQLite (local)
- **Redis**: Local instance
- **Features**: Full debugging, hot reload

### **Staging**
- **URL**: `staging.pokedex.com`
- **Database**: PostgreSQL
- **Redis**: Redis instance
- **Features**: Production-like, testing

### **Production**
- **URL**: `pokedex.com`
- **Database**: PostgreSQL (high availability)
- **Redis**: Redis cluster
- **Features**: Full production, monitoring

## 🐳 **Docker Commands**

### **Build Images**
```bash
# Frontend
docker build -t pokedex-frontend ./frontend

# Backend
docker build -t pokedex-backend .

# Nginx
docker build -t pokedex-nginx ./nginx
```

### **Run Locally**
```bash
# Development
docker-compose up -d

# Staging
docker-compose -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### **Health Checks**
```bash
# Check all services
docker-compose ps

# Check specific service
docker-compose exec backend curl http://localhost:5000/health
docker-compose exec frontend curl http://localhost:3000/health
```

## 📊 **Monitoring Commands**

### **View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### **Check Metrics**
```bash
# Backend metrics
curl http://localhost:5000/metrics

# Frontend metrics
curl http://localhost:3000/metrics

# Nginx status
curl http://localhost/nginx_status
```

### **Health Status**
```bash
# Overall health
curl http://localhost/health

# Readiness check
curl http://localhost/ready

# Backend health
curl http://localhost/api/health
```

## 🚨 **Troubleshooting**

### **Common Issues**

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Tests Failing** | CI pipeline red | Check test logs, fix failing tests |
| **Build Failing** | Docker build error | Check Dockerfile, dependencies |
| **Deploy Failing** | Service not starting | Check environment variables, logs |
| **Health Check Failing** | Service unhealthy | Check dependencies, configuration |

### **Debug Commands**
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs <service>

# Execute shell in container
docker-compose exec <service> sh

# Check environment variables
docker-compose exec <service> env

# Check network connectivity
docker-compose exec <service> ping <other-service>
```

### **Emergency Procedures**

#### **Rollback Deployment**
```bash
# Rollback to previous version
./scripts/rollback.sh production

# Or manually
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

#### **Restart Services**
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

#### **Clear Everything**
```bash
# Stop and remove all containers
docker-compose down

# Remove all images
docker-compose down --rmi all

# Remove all volumes
docker-compose down -v
```

## 📈 **Performance Monitoring**

### **Key Metrics**
- **Response Time**: < 200ms average
- **Error Rate**: < 1%
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Disk Usage**: < 85%

### **Monitoring Commands**
```bash
# Check resource usage
docker stats

# Check disk usage
docker system df

# Check network usage
docker network ls
docker network inspect <network>
```

## 🔐 **Security Checklist**

### **Pre-Deployment**
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Dependencies updated
- [ ] Secrets rotated
- [ ] Access logs reviewed

### **Post-Deployment**
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested
- [ ] Incident response ready
- [ ] Documentation updated

## 📚 **Useful Resources**

### **Documentation**
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [Prometheus Docs](https://prometheus.io/docs/)

### **Tools**
- [GitHub Actions](https://github.com/features/actions)
- [Docker Hub](https://hub.docker.com/)
- [GitHub Container Registry](https://github.com/features/packages)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)

---

**Status**: READY FOR IMPLEMENTATION  
**Next Action**: Begin Phase 1 - Basic CI/CD Setup  
**Support**: Check logs, run health checks, follow troubleshooting guide
