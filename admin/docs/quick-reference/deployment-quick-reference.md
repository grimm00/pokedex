# Deployment Quick Reference

## Essential Commands

### Local Development
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop development environment
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Scale services
docker-compose up --scale backend=3
```

### Production Deployment
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Health check
./scripts/health-check.sh

# Rollback
./scripts/rollback.sh production
```

### GitHub Actions
```bash
# Trigger CI workflow
gh workflow run ci.yml

# Trigger CD workflow
gh workflow run cd.yml

# View workflow status
gh run list

# View workflow logs
gh run view <run-id>
```

## Environment Management

### Environment Variables
```bash
# Set environment variables
export DATABASE_URL="sqlite:///pokedex.db"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET_KEY="your-secret-key"

# Load from .env file
source .env

# Check environment variables
env | grep -E "(DATABASE|REDIS|JWT)"
```

### Docker Environment
```bash
# Set Docker environment variables
docker run -e DATABASE_URL="sqlite:///pokedex.db" my-app

# Use .env file with Docker
docker run --env-file .env my-app

# Set multiple environment variables
docker run -e VAR1=value1 -e VAR2=value2 my-app
```

### Docker Compose Environment
```yaml
# docker-compose.yml
services:
  app:
    image: my-app
    environment:
      - DATABASE_URL=sqlite:///pokedex.db
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env
```

## Health Checks

### Application Health
```bash
# Check API health
curl -f http://localhost/api/v1/health

# Check main page
curl -f http://localhost/

# Check specific endpoint
curl -f http://localhost/api/v1/pokemon

# Check with timeout
curl -f --max-time 10 http://localhost/api/v1/health
```

### Docker Health
```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check specific container health
docker inspect <container-name> --format='{{.State.Health.Status}}'

# Check health logs
docker inspect <container-name> --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

### Service Health
```bash
# Check all services
docker-compose ps

# Check specific service
docker-compose ps <service-name>

# Check service logs
docker-compose logs <service-name>

# Check service status
docker-compose exec <service-name> curl -f http://localhost:3000/health
```

## Monitoring

### Log Monitoring
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs <service-name>

# Follow logs in real-time
docker-compose logs -f

# View logs with timestamps
docker-compose logs -t

# View last 100 lines
docker-compose logs --tail=100
```

### Resource Monitoring
```bash
# View container resource usage
docker stats

# View specific container stats
docker stats <container-name>

# View system resource usage
docker system df

# View container processes
docker top <container-name>
```

### Performance Monitoring
```bash
# Run performance tests
cd backend && python -m pytest tests/performance/ -v

# Run load tests
k6 run load-test.js

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost/api/v1/pokemon
```

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check container logs
docker logs <container-name>

# Check container status
docker ps -a

# Check container configuration
docker inspect <container-name>

# Restart container
docker restart <container-name>
```

#### Service Unavailable
```bash
# Check service status
docker-compose ps

# Check service logs
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose up --build -d <service-name>
```

#### Database Issues
```bash
# Check database connection
docker-compose exec backend python -c "from backend.database import db; print('Connected')"

# Check database logs
docker-compose logs backend

# Reset database
docker-compose exec backend python -c "from backend.database import db; db.drop_all(); db.create_all()"
```

#### Redis Issues
```bash
# Check Redis connection
docker-compose exec redis redis-cli ping

# Check Redis logs
docker-compose logs redis

# Check Redis memory usage
docker-compose exec redis redis-cli info memory
```

### Debug Commands
```bash
# Debug container
docker exec -it <container-name> /bin/sh

# Debug with specific user
docker exec -it -u root <container-name> /bin/sh

# Debug network
docker network ls
docker network inspect <network-name>

# Debug volumes
docker volume ls
docker volume inspect <volume-name>
```

### Log Analysis
```bash
# Search logs for errors
docker-compose logs | grep -i error

# Search logs for specific pattern
docker-compose logs | grep "database"

# Count log entries
docker-compose logs | wc -l

# Save logs to file
docker-compose logs > deployment.log
```

## Rollback Procedures

### Application Rollback
```bash
# Rollback to previous version
./scripts/rollback.sh production

# Rollback specific service
docker-compose down
docker-compose up -d <service-name>

# Rollback with specific tag
docker-compose down
docker-compose up -d --scale <service-name>=1
```

### Database Rollback
```bash
# Backup current database
docker-compose exec backend python -c "from backend.database import db; db.backup()"

# Restore from backup
docker-compose exec backend python -c "from backend.database import db; db.restore()"

# Reset to clean state
docker-compose exec backend python -c "from backend.database import db; db.drop_all(); db.create_all()"
```

### Configuration Rollback
```bash
# Revert configuration changes
git checkout HEAD~1 docker-compose.yml

# Restart with old configuration
docker-compose down
docker-compose up -d

# Check configuration
docker-compose config
```

## Security

### Security Scanning
```bash
# Scan for vulnerabilities
trivy image <image-name>

# Scan filesystem
trivy fs .

# Scan with specific severity
trivy image --severity HIGH,CRITICAL <image-name>

# Scan and save results
trivy image --format sarif --output trivy-results.sarif <image-name>
```

### Access Control
```bash
# Check container permissions
docker inspect <container-name> --format='{{.Config.User}}'

# Check file permissions
docker-compose exec <service-name> ls -la

# Check network access
docker network inspect <network-name>
```

### Secret Management
```bash
# Check secrets
docker-compose config --services

# Verify secret values
docker-compose exec <service-name> env | grep -E "(SECRET|PASSWORD|KEY)"

# Rotate secrets
# Update .env file
# Restart services
docker-compose restart
```

## Performance

### Performance Testing
```bash
# Run unit tests
cd frontend && npm run test:run
cd ../backend && python -m pytest tests/unit/ -v

# Run integration tests
cd backend && python -m pytest tests/integration/ -v

# Run performance tests
cd backend && python -m pytest tests/performance/ -v
```

### Load Testing
```bash
# Run load tests
k6 run load-test.js

# Run load tests with specific scenario
k6 run --vus 10 --duration 30s load-test.js

# Run load tests with custom data
k6 run --data data.json load-test.js
```

### Optimization
```bash
# Check image sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Check container resource usage
docker stats --no-stream

# Check build cache
docker system df

# Clean up unused resources
docker system prune -a
```

## Maintenance

### Regular Maintenance
```bash
# Update images
docker-compose pull

# Rebuild images
docker-compose build --no-cache

# Clean up old images
docker image prune -a

# Clean up old containers
docker container prune

# Clean up old volumes
docker volume prune
```

### Backup Procedures
```bash
# Backup database
docker-compose exec backend python -c "from backend.database import db; db.backup()"

# Backup volumes
docker run --rm -v <volume-name>:/data -v $(pwd):/backup alpine tar czf /backup/volume-backup.tar.gz -C /data .

# Backup configuration
cp docker-compose.yml docker-compose.yml.backup
cp .env .env.backup
```

### Update Procedures
```bash
# Update application
git pull origin main
docker-compose down
docker-compose up --build -d

# Update dependencies
cd frontend && npm update
cd ../backend && pip install --upgrade -r requirements.txt

# Update base images
docker-compose pull
docker-compose up -d
```

## Best Practices

### Deployment Best Practices
- Always test in staging before production
- Use blue-green deployment for zero downtime
- Implement proper health checks
- Monitor deployment metrics
- Have rollback procedures ready

### Security Best Practices
- Scan images for vulnerabilities
- Use secrets management
- Implement access controls
- Regular security updates
- Monitor for security issues

### Performance Best Practices
- Monitor resource usage
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets
- Regular performance testing

### Maintenance Best Practices
- Regular backups
- Update dependencies regularly
- Monitor system health
- Clean up unused resources
- Document procedures
