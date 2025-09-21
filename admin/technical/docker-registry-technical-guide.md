# Docker Registry Technical Guide

## Overview
This document provides a comprehensive technical guide to Docker registries, focusing on how GitHub Actions can interact with various container registries and the technical implementation details.

## Table of Contents
1. [Docker Registry Fundamentals](#docker-registry-fundamentals)
2. [GitHub Container Registry (ghcr.io)](#github-container-registry-ghcrio)
3. [Docker Hub Integration](#docker-hub-integration)
4. [Private Registry Setup](#private-registry-setup)
5. [Image Management Strategies](#image-management-strategies)
6. [Security and Authentication](#security-and-authentication)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

## Docker Registry Fundamentals

### What is a Docker Registry?
A Docker registry is a storage and distribution system for Docker images. It allows you to:
- Store Docker images in a centralized location
- Share images across different environments
- Version control your container images
- Implement access control and security policies

### Registry Types
1. **Public Registries**: Docker Hub, GitHub Container Registry
2. **Private Registries**: Self-hosted, cloud-managed
3. **Hybrid Registries**: Mix of public and private

### Key Concepts
- **Repository**: A collection of related images
- **Tag**: A label for a specific version of an image
- **Manifest**: Metadata about an image
- **Layer**: Individual filesystem changes
- **Digest**: Unique identifier for an image

## GitHub Container Registry (ghcr.io)

### Overview
GitHub Container Registry is GitHub's built-in container registry that integrates seamlessly with GitHub Actions.

### Authentication
```yaml
- name: Log in to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

### Image Naming Convention
```
ghcr.io/OWNER/REPOSITORY/IMAGE_NAME:TAG
```

### Example: Our Pokedex Images
```
ghcr.io/grimm00/pokedex/frontend:latest
ghcr.io/grimm00/pokedex/backend:latest
ghcr.io/grimm00/pokedex/nginx:latest
```

### Building and Pushing Images
```yaml
- name: Build and push frontend
  uses: docker/build-push-action@v5
  with:
    context: ./frontend
    file: ./frontend/Dockerfile
    push: true
    tags: |
      ghcr.io/${{ github.repository }}/frontend:latest
      ghcr.io/${{ github.repository }}/frontend:${{ github.sha }}
    labels: |
      org.opencontainers.image.title=Frontend
      org.opencontainers.image.description=React frontend for Pokedex
      org.opencontainers.image.version=${{ github.sha }}
```

### Pulling Images
```yaml
- name: Pull image
  run: |
    docker pull ghcr.io/${{ github.repository }}/frontend:latest
    docker run --rm ghcr.io/${{ github.repository }}/frontend:latest
```

### Image Metadata
```yaml
- name: Extract metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: |
      ghcr.io/${{ github.repository }}/frontend
    tags: |
      type=ref,event=branch
      type=sha,prefix={{branch}}-
      type=raw,value=latest,enable={{is_default_branch}}
```

## Docker Hub Integration

### Authentication
```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
```

### Building and Pushing
```yaml
- name: Build and push to Docker Hub
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      your-username/pokedex:latest
      your-username/pokedex:${{ github.sha }}
```

### Multi-Platform Builds
```yaml
- name: Build and push multi-platform
  uses: docker/build-push-action@v5
  with:
    context: .
    platforms: linux/amd64,linux/arm64
    push: true
    tags: your-username/pokedex:latest
```

## Private Registry Setup

### Self-Hosted Registry
```yaml
- name: Log in to private registry
  uses: docker/login-action@v3
  with:
    registry: your-registry.com
    username: ${{ secrets.REGISTRY_USERNAME }}
    password: ${{ secrets.REGISTRY_PASSWORD }}
```

### AWS ECR Integration
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Login to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v1

- name: Build and push to ECR
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    registry: ${{ steps.login-ecr.outputs.registry }}
    repository: pokedex
    tags: latest
```

### Azure Container Registry
```yaml
- name: Log in to Azure
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Build and push to ACR
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    registry: your-registry.azurecr.io
    repository: pokedex
    tags: latest
```

## Image Management Strategies

### Tagging Strategies

#### 1. Semantic Versioning
```yaml
tags: |
  ghcr.io/${{ github.repository }}/frontend:1.0.0
  ghcr.io/${{ github.repository }}/frontend:1.0
  ghcr.io/${{ github.repository }}/frontend:1
  ghcr.io/${{ github.repository }}/frontend:latest
```

#### 2. Git-based Tagging
```yaml
tags: |
  ghcr.io/${{ github.repository }}/frontend:${{ github.sha }}
  ghcr.io/${{ github.repository }}/frontend:${{ github.ref_name }}
  ghcr.io/${{ github.repository }}/frontend:latest
```

#### 3. Environment-based Tagging
```yaml
tags: |
  ghcr.io/${{ github.repository }}/frontend:staging
  ghcr.io/${{ github.repository }}/frontend:production
```

### Image Cleanup
```yaml
- name: Clean up old images
  run: |
    # Remove images older than 30 days
    docker image prune -a --filter "until=720h" -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused volumes
    docker volume prune -f
```

### Image Scanning
```yaml
- name: Scan image for vulnerabilities
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/${{ github.repository }}/frontend:latest
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## Security and Authentication

### Token-based Authentication
```yaml
- name: Create registry token
  run: |
    echo "REGISTRY_TOKEN=$(echo -n '${{ secrets.REGISTRY_USERNAME }}:${{ secrets.REGISTRY_PASSWORD }}' | base64)" >> $GITHUB_ENV

- name: Use token for authentication
  run: |
    echo "${{ secrets.REGISTRY_PASSWORD }}" | docker login ghcr.io -u "${{ secrets.REGISTRY_USERNAME }}" --password-stdin
```

### OAuth Authentication
```yaml
- name: Log in with OAuth
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

### Image Signing
```yaml
- name: Sign image
  run: |
    docker trust key generate pokedex-key
    docker trust signer add --key pokedex-key.pub pokedex-signer ghcr.io/${{ github.repository }}/frontend
    docker trust sign ghcr.io/${{ github.repository }}/frontend:latest
```

### Content Trust
```yaml
- name: Enable content trust
  run: |
    export DOCKER_CONTENT_TRUST=1
    docker pull ghcr.io/${{ github.repository }}/frontend:latest
```

## Performance Optimization

### Build Caching
```yaml
- name: Build with cache
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}/frontend:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Multi-stage Builds
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

### Layer Optimization
```dockerfile
# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code last
COPY . .
RUN npm run build
```

### Parallel Builds
```yaml
strategy:
  matrix:
    service: [frontend, backend, nginx]
    
- name: Build ${{ matrix.service }}
  uses: docker/build-push-action@v5
  with:
    context: ./${{ matrix.service }}
    push: true
    tags: ghcr.io/${{ github.repository }}/${{ matrix.service }}:latest
```

## Troubleshooting

### Common Issues

#### 1. Authentication Failures
```yaml
- name: Debug authentication
  run: |
    echo "Registry: ${{ inputs.registry }}"
    echo "Username: ${{ inputs.username }}"
    echo "Password length: ${#PASSWORD}"
```

#### 2. Image Push Failures
```yaml
- name: Debug push
  run: |
    docker images | grep pokedex
    docker push ghcr.io/${{ github.repository }}/frontend:latest --debug
```

#### 3. Pull Failures
```yaml
- name: Debug pull
  run: |
    docker pull ghcr.io/${{ github.repository }}/frontend:latest --debug
    docker inspect ghcr.io/${{ github.repository }}/frontend:latest
```

#### 4. Permission Issues
```yaml
- name: Fix permissions
  run: |
    sudo chown -R $USER:$USER .
    chmod +x scripts/*.sh
```

### Debugging Commands
```yaml
- name: Debug Docker environment
  run: |
    docker version
    docker info
    docker system df
    docker images
    docker ps -a
```

### Registry Health Checks
```yaml
- name: Check registry health
  run: |
    curl -f https://ghcr.io/v2/ || echo "Registry is down"
    curl -f https://ghcr.io/v2/${{ github.repository }}/frontend/tags/list || echo "Repository not found"
```

## Best Practices

### 1. Image Management
- Use semantic versioning for tags
- Implement image cleanup policies
- Scan images for vulnerabilities
- Use multi-stage builds for optimization

### 2. Security
- Never commit credentials to code
- Use least-privilege access
- Implement image signing
- Regular security scanning

### 3. Performance
- Use build caching
- Optimize Dockerfile layers
- Implement parallel builds
- Monitor registry performance

### 4. Maintenance
- Regular image updates
- Monitor registry usage
- Implement backup strategies
- Document image dependencies

## Integration with Our Pokedex Project

### Current Implementation
Our Pokedex project uses GitHub Container Registry (ghcr.io) for:
- Frontend React application
- Backend Flask API
- Nginx reverse proxy
- Redis cache

### Image Structure
```
ghcr.io/grimm00/pokedex/
├── frontend:latest
├── backend:latest
└── nginx:latest
```

### Workflow Integration
- **CI Workflow**: Builds and tests images
- **CD Workflow**: Pushes images to registry
- **Security Workflow**: Scans images for vulnerabilities
- **Cleanup Workflow**: Removes old images

### Environment Variables
- `GITHUB_TOKEN`: Automatic authentication
- `REGISTRY_URL`: Registry endpoint
- `IMAGE_TAG`: Image version tag

## Learning Resources

### Official Documentation
- [Docker Registry Documentation](https://docs.docker.com/registry/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Build Push Action](https://github.com/docker/build-push-action)

### Community Resources
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Container Security](https://docs.docker.com/engine/security/)
- [Registry Management](https://docs.docker.com/registry/configuration/)

### Our Project Examples
- Check `.github/workflows/` for registry integration
- Review `Dockerfile` files for build optimization
- Examine `docker-compose.yml` for service definitions

## Conclusion

Docker registries are essential for containerized applications, providing centralized storage and distribution of Docker images. Our Pokedex project leverages GitHub Container Registry for seamless integration with GitHub Actions, enabling automated building, testing, and deployment of our containerized application.

The key to success is understanding how to:
1. **Authenticate with registries** securely
2. **Build and push images** efficiently
3. **Manage image versions** and tags
4. **Implement security scanning** and signing
5. **Optimize for performance** and reliability

This technical guide serves as a reference for understanding and extending our Docker registry implementation.
