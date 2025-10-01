# Docker Quick Reference

## Essential Commands

### Container Management
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Start a container
docker start <container-name>

# Stop a container
docker stop <container-name>

# Restart a container
docker restart <container-name>

# Remove a container
docker rm <container-name>

# Remove all stopped containers
docker container prune
```

### Image Management
```bash
# List images
docker images

# Pull an image
docker pull <image-name>

# Build an image
docker build -t <image-name> .

# Build with specific Dockerfile
docker build -f Dockerfile.prod -t <image-name> .

# Remove an image
docker rmi <image-name>

# Remove all unused images
docker image prune -a
```

### Volume Management
```bash
# List volumes
docker volume ls

# Create a volume
docker volume create <volume-name>

# Remove a volume
docker volume rm <volume-name>

# Remove all unused volumes
docker volume prune
```

### Network Management
```bash
# List networks
docker network ls

# Create a network
docker network create <network-name>

# Remove a network
docker network rm <network-name>

# Remove all unused networks
docker network prune
```

## Docker Compose

### Basic Commands
```bash
# Start services
docker-compose up

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs <service-name>

# Follow logs
docker-compose logs -f
```

### Build and Deploy
```bash
# Build images
docker-compose build

# Build specific service
docker-compose build <service-name>

# Pull images
docker-compose pull

# Push images
docker-compose push
```

### Service Management
```bash
# Scale services
docker-compose up --scale <service-name>=3

# Execute command in running container
docker-compose exec <service-name> <command>

# Run one-time command
docker-compose run <service-name> <command>
```

## Multi-stage Builds

### Basic Multi-stage Build
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

### Multi-platform Build
```dockerfile
# Build stage
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM --platform=$TARGETPLATFORM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Registry Operations

### GitHub Container Registry
```bash
# Login to ghcr.io
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Tag image for ghcr.io
docker tag <local-image> ghcr.io/<owner>/<repo>/<image>:<tag>

# Push to ghcr.io
docker push ghcr.io/<owner>/<repo>/<image>:<tag>

# Pull from ghcr.io
docker pull ghcr.io/<owner>/<repo>/<image>:<tag>
```

### Docker Hub
```bash
# Login to Docker Hub
docker login

# Tag image for Docker Hub
docker tag <local-image> <username>/<image>:<tag>

# Push to Docker Hub
docker push <username>/<image>:<tag>

# Pull from Docker Hub
docker pull <username>/<image>:<tag>
```

### Private Registry
```bash
# Login to private registry
docker login <registry-url>

# Tag image for private registry
docker tag <local-image> <registry-url>/<image>:<tag>

# Push to private registry
docker push <registry-url>/<image>:<tag>

# Pull from private registry
docker pull <registry-url>/<image>:<tag>
```

## Security

### Image Scanning
```bash
# Scan image with Trivy
trivy image <image-name>

# Scan image and save results
trivy image --format sarif --output trivy-results.sarif <image-name>

# Scan filesystem
trivy fs .

# Scan with specific severity
trivy image --severity HIGH,CRITICAL <image-name>
```

### Image Signing
```bash
# Generate signing key
docker trust key generate <key-name>

# Add signer
docker trust signer add --key <key-name>.pub <signer-name> <image-name>

# Sign image
docker trust sign <image-name>:<tag>
```

### Content Trust
```bash
# Enable content trust
export DOCKER_CONTENT_TRUST=1

# Pull with content trust
docker pull <image-name>:<tag>

# Push with content trust
docker push <image-name>:<tag>
```

## Performance Optimization

### Build Optimization
```dockerfile
# Use specific base image
FROM node:18-alpine

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code last
COPY . .
RUN npm run build

# Use .dockerignore
# node_modules
# .git
# *.log
```

### Layer Optimization
```dockerfile
# Combine RUN commands
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Use multi-stage builds
FROM node:18-alpine AS builder
# ... build steps ...

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Resource Limits
```yaml
# docker-compose.yml
services:
  app:
    image: my-app
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Health Checks

### Dockerfile Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Docker Compose Health Check
```yaml
services:
  app:
    image: my-app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Manual Health Check
```bash
# Check container health
docker inspect <container-name> --format='{{.State.Health.Status}}'

# Check health logs
docker inspect <container-name> --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

## Debugging

### Container Debugging
```bash
# Execute shell in running container
docker exec -it <container-name> /bin/sh

# Execute shell in stopped container
docker run -it <image-name> /bin/sh

# View container logs
docker logs <container-name>

# Follow container logs
docker logs -f <container-name>

# View container details
docker inspect <container-name>
```

### Image Debugging
```bash
# View image history
docker history <image-name>

# View image details
docker inspect <image-name>

# View image layers
docker image inspect <image-name>
```

### System Debugging
```bash
# View system information
docker system info

# View disk usage
docker system df

# View events
docker events

# View processes
docker top <container-name>
```

## Cleanup

### Container Cleanup
```bash
# Remove all stopped containers
docker container prune

# Remove all containers
docker rm $(docker ps -aq)

# Remove containers with specific status
docker rm $(docker ps -aq --filter status=exited)
```

### Image Cleanup
```bash
# Remove all unused images
docker image prune -a

# Remove images older than 24 hours
docker image prune -a --filter until=24h

# Remove specific image
docker rmi <image-name>
```

### System Cleanup
```bash
# Remove all unused resources
docker system prune -a

# Remove all unused resources including volumes
docker system prune -a --volumes

# Remove all unused resources with confirmation
docker system prune -a --volumes --force
```

## Best Practices

### Dockerfile Best Practices
- Use specific base image versions
- Use multi-stage builds for optimization
- Copy package files before source code
- Use .dockerignore to exclude unnecessary files
- Combine RUN commands to reduce layers
- Use non-root user when possible
- Set proper health checks

### Security Best Practices
- Scan images for vulnerabilities
- Use minimal base images
- Keep base images updated
- Don't run as root
- Use secrets management
- Enable content trust
- Sign images

### Performance Best Practices
- Use build caching effectively
- Optimize layer ordering
- Use multi-stage builds
- Set resource limits
- Monitor resource usage
- Clean up unused resources

### Maintenance Best Practices
- Regular image updates
- Monitor image sizes
- Clean up old images
- Use image tags properly
- Document image dependencies
- Test images before deployment
