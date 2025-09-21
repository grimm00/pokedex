# Production Deployment Guide

This guide provides comprehensive instructions for deploying the Pokedex application to production using the CI/CD pipeline.

## 🎯 Overview

The Pokedex application uses a fully automated CI/CD pipeline with:
- **GitHub Actions** for continuous integration and deployment
- **GitHub Container Registry** for Docker image storage
- **Single-container deployment** with Nginx, Flask, and Redis
- **Automated health checks** and smoke tests
- **Environment-specific secrets** management

## 🔐 Production Secrets Configuration

### Required Secrets

The following secrets have been configured in the `production` environment:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `PRODUCTION_DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PRODUCTION_REDIS_URL` | Redis connection string | `redis://:pass@host:6379/0` |
| `PRODUCTION_JWT_SECRET_KEY` | JWT signing key (64 chars) | `c316cbec9be2ebf7ec63...` |

### Updating Secrets

To update production secrets:

```bash
# Update database URL
gh secret set PRODUCTION_DATABASE_URL -b"new_value" --env production --repo grimm00/pokedex

# Update Redis URL
gh secret set PRODUCTION_REDIS_URL -b"new_value" --env production --repo grimm00/pokedex

# Update JWT secret
gh secret set PRODUCTION_JWT_SECRET_KEY -b"new_value" --env production --repo grimm00/pokedex
```

## 🗄️ Database Setup

### PostgreSQL Configuration

**Recommended Production Database:**
- **Type**: PostgreSQL 13+
- **Host**: Your production database server
- **Port**: 5432
- **Database**: `pokedex_production`
- **Username**: `pokedex_user`
- **Password**: Generated secure password

**Database Setup Commands:**
```sql
-- Create database
CREATE DATABASE pokedex_production;

-- Create user
CREATE USER pokedex_user WITH PASSWORD 'your_secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE pokedex_production TO pokedex_user;
GRANT ALL ON SCHEMA public TO pokedex_user;
```

### Database Migration

The application will automatically run database migrations on startup:
```bash
python -m flask db upgrade
```

## 🔴 Redis Setup

### Redis Configuration

**Production Redis Setup:**
- **Host**: Your production Redis server
- **Port**: 6379
- **Password**: Generated secure password
- **Database**: 0 (default)

**Redis Configuration:**
```redis
# Set password
requirepass your_secure_password

# Configure memory policy
maxmemory 256mb
maxmemory-policy allkeys-lru

# Enable persistence
save 900 1
save 300 10
save 60 10000
```

## 🚀 Deployment Process

### Automatic Deployment

The production deployment is triggered automatically when code is pushed to the `main` branch:

1. **Code Push** → Triggers CI/CD pipeline
2. **Tests Run** → Unit, integration, and performance tests
3. **Security Scan** → Vulnerability scanning with Trivy and CodeQL
4. **Docker Build** → Multi-stage build with frontend and backend
5. **Image Push** → Push to GitHub Container Registry
6. **Staging Deploy** → Deploy to staging environment
7. **Smoke Tests** → Health checks and basic functionality tests
8. **Production Deploy** → Deploy to production (requires approval)

### Manual Deployment

To manually trigger a production deployment:

```bash
# Trigger deployment via GitHub CLI
gh workflow run "Continuous Deployment" --ref main

# Or via GitHub web interface
# Go to Actions → Continuous Deployment → Run workflow
```

## 🏥 Health Monitoring

### Health Check Endpoints

The application provides several health check endpoints:

| Endpoint | Description | Expected Response |
|----------|-------------|-------------------|
| `/` | Main health check | `{"status": "healthy", "message": "Pokedex API is running"}` |
| `/api/v1/pokemon` | Pokemon API | List of Pokemon with pagination |
| `/api/v1/pokemon/types` | Pokemon types | List of available types |
| `/api/v1/cache/health` | Cache health | Redis connection status |

### Monitoring Commands

```bash
# Check application health
curl -f http://your-production-domain.com/

# Check API health
curl -f http://your-production-domain.com/api/v1/pokemon

# Check cache health
curl -f http://your-production-domain.com/api/v1/cache/health
```

## 🔧 Production Configuration

### Environment Variables

The production container uses these environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://:pass@host:6379/0

# JWT
JWT_SECRET_KEY=your_64_character_secret_key

# Flask
FLASK_ENV=production
FLASK_DEBUG=False
```

### Container Configuration

The production container includes:
- **Nginx**: Web server and reverse proxy
- **Flask**: Python backend API
- **Redis**: Caching and session storage
- **SQLite**: Local database (can be replaced with PostgreSQL)

## 📊 Monitoring and Logging

### Application Logs

View container logs:
```bash
# View all logs
docker logs pokedex-production

# Follow logs
docker logs -f pokedex-production

# View specific service logs
docker exec pokedex-production tail -f /var/log/nginx/access.log
docker exec pokedex-production tail -f /var/log/nginx/error.log
```

### Performance Monitoring

The application includes built-in performance monitoring:
- **Response time tracking**
- **Database query monitoring**
- **Cache hit/miss ratios**
- **Memory usage tracking**

## 🔒 Security Considerations

### Production Security Checklist

- [ ] **HTTPS**: Configure SSL/TLS certificates
- [ ] **Firewall**: Restrict database and Redis access
- [ ] **Secrets**: Use secure secret management
- [ ] **Updates**: Regular security updates
- [ ] **Monitoring**: Set up security monitoring
- [ ] **Backups**: Regular database backups

### SSL/TLS Configuration

For production, configure SSL/TLS:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check database connectivity
docker exec pokedex-production python -c "from backend.database import db; print('DB OK')"
```

**2. Redis Connection Failed**
```bash
# Check Redis connectivity
docker exec pokedex-production redis-cli ping
```

**3. Health Check Failed**
```bash
# Check application status
curl -v http://your-domain.com/
```

**4. Container Won't Start**
```bash
# Check container logs
docker logs pokedex-production

# Check container status
docker ps -a
```

### Recovery Procedures

**Rollback Deployment:**
```bash
# Stop current container
docker stop pokedex-production

# Start previous version
docker run -d --name pokedex-production -p 80:80 \
  ghcr.io/grimm00/pokedex/pokedex:previous-version
```

**Database Recovery:**
```bash
# Restore from backup
pg_restore -d pokedex_production backup_file.sql
```

## 📈 Scaling and Performance

### Horizontal Scaling

To scale the application:

1. **Load Balancer**: Add a load balancer (nginx, HAProxy)
2. **Multiple Containers**: Run multiple container instances
3. **Database Scaling**: Use read replicas for database
4. **Cache Clustering**: Set up Redis cluster

### Performance Optimization

- **CDN**: Use CloudFlare or AWS CloudFront
- **Caching**: Implement Redis caching strategies
- **Database**: Optimize queries and add indexes
- **Monitoring**: Set up APM tools (New Relic, DataDog)

## 📞 Support and Maintenance

### Regular Maintenance Tasks

- **Weekly**: Review logs and performance metrics
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Full security audit and penetration testing

### Contact Information

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/grimm00/pokedex/issues)
- **Documentation**: [Technical documentation](https://github.com/grimm00/pokedex/tree/main/admin/technical)
- **CI/CD Status**: [GitHub Actions](https://github.com/grimm00/pokedex/actions)

---

**Last Updated**: 2025-09-21  
**Version**: 1.0  
**Status**: Production Ready ✅
