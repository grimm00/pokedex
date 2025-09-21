# GitHub Actions Technical Guide

## Overview
This document provides a comprehensive technical guide to GitHub Actions, focusing on how they can run images from repositories and their integration with our Pokedex project.

## Table of Contents
1. [GitHub Actions Fundamentals](#github-actions-fundamentals)
2. [Running Images from Repositories](#running-images-from-repositories)
3. [Our CI/CD Pipeline Architecture](#our-cicd-pipeline-architecture)
4. [Docker Integration Patterns](#docker-integration-patterns)
5. [Security Considerations](#security-considerations)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Advanced Patterns](#advanced-patterns)

## GitHub Actions Fundamentals

### What are GitHub Actions?
GitHub Actions is a CI/CD platform that allows you to automate workflows directly in your GitHub repository. It can build, test, and deploy your code from GitHub.

### Key Components
- **Workflows**: YAML files that define automated processes
- **Jobs**: A set of steps that execute on the same runner
- **Steps**: Individual tasks that can run commands or use actions
- **Actions**: Reusable units of code that can be shared
- **Runners**: Servers that execute your workflows

### Workflow Triggers
```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday at 2 AM
  workflow_dispatch: # Manual trigger
```

## Running Images from Repositories

### 1. GitHub Container Registry (ghcr.io)
GitHub provides a built-in container registry where you can store and manage Docker images.

#### Pushing Images to ghcr.io
```yaml
- name: Log in to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build and push image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}/my-app:${{ github.sha }}
```

#### Pulling Images from ghcr.io
```yaml
- name: Pull image from registry
  run: |
    docker pull ghcr.io/${{ github.repository }}/my-app:latest
    docker run ghcr.io/${{ github.repository }}/my-app:latest
```

### 2. Docker Hub Integration
```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}

- name: Build and push to Docker Hub
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      your-username/pokedex:latest
      your-username/pokedex:${{ github.sha }}
```

### 3. Private Registries
```yaml
- name: Log in to private registry
  uses: docker/login-action@v3
  with:
    registry: your-registry.com
    username: ${{ secrets.REGISTRY_USERNAME }}
    password: ${{ secrets.REGISTRY_PASSWORD }}
```

## Our CI/CD Pipeline Architecture

### 1. CI Workflow (`ci.yml`)
```yaml
name: Continuous Integration

on:
  push:
    branches: [ main, develop, feat/* ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-type: [unit, integration, performance]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.13'
        cache: 'pip'
```

### 2. CD Workflow (`cd.yml`)
```yaml
name: Continuous Deployment

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - name: Build and push images
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ghcr.io/${{ github.repository }}/frontend:${{ github.sha }}
```

### 3. Security Workflow (`security.yml`)
```yaml
name: Security Scanning

on:
  push:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * 1' # Weekly

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
```

## Docker Integration Patterns

### 1. Multi-Stage Builds
```dockerfile
# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

### 2. Service Dependencies
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - 6379:6379
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3. Health Checks
```yaml
- name: Wait for services to be healthy
  run: |
    timeout 300 bash -c 'until curl -f http://localhost/api/v1/health; do sleep 5; done'
```

## Security Considerations

### 1. Secrets Management
```yaml
- name: Use secret
  run: echo ${{ secrets.MY_SECRET }}
```

### 2. Environment Variables
```yaml
- name: Set environment variables
  run: |
    echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> $GITHUB_ENV
    echo "API_KEY=${{ secrets.API_KEY }}" >> $GITHUB_ENV
```

### 3. Token Permissions
```yaml
permissions:
  contents: read
  packages: write
  security-events: write
```

### 4. Vulnerability Scanning
```yaml
- name: Run security scan
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## Performance Optimization

### 1. Caching
```yaml
- name: Cache Node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 2. Matrix Strategies
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

### 3. Parallel Jobs
```yaml
jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps: [...]
    
  test-backend:
    runs-on: ubuntu-latest
    steps: [...]
    
  test-integration:
    runs-on: ubuntu-latest
    needs: [test-frontend, test-backend]
    steps: [...]
```

## Troubleshooting Guide

### Common Issues

#### 1. Permission Denied
```yaml
- name: Fix permissions
  run: |
    chmod +x scripts/*.sh
    sudo chown -R $USER:$USER .
```

#### 2. Docker Build Failures
```yaml
- name: Debug Docker build
  run: |
    docker build --no-cache --progress=plain -t debug-image .
    docker run --rm debug-image ls -la
```

#### 3. Service Timeouts
```yaml
- name: Wait with timeout
  run: |
    timeout 300 bash -c 'until curl -f http://localhost/health; do sleep 5; done'
```

#### 4. Cache Issues
```yaml
- name: Clear cache
  run: |
    npm cache clean --force
    pip cache purge
```

### Debugging Commands
```yaml
- name: Debug environment
  run: |
    echo "OS: ${{ runner.os }}"
    echo "Node: $(node --version)"
    echo "Python: $(python --version)"
    echo "Docker: $(docker --version)"
    echo "Available memory: $(free -h)"
    echo "Disk space: $(df -h)"
```

## Advanced Patterns

### 1. Conditional Steps
```yaml
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: echo "Deploying to staging"

- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: echo "Deploying to production"
```

### 2. Dynamic Matrix
```yaml
- name: Generate matrix
  id: matrix
  run: |
    echo "matrix={\"include\":[{\"os\":\"ubuntu-latest\",\"node\":\"18\"},{\"os\":\"windows-latest\",\"node\":\"20\"}]}" >> $GITHUB_OUTPUT

strategy:
  matrix: ${{ fromJson(steps.matrix.outputs.matrix) }}
```

### 3. Custom Actions
```yaml
- name: Use custom action
  uses: ./.github/actions/my-custom-action
  with:
    input1: value1
    input2: value2
```

### 4. Workflow Dependencies
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]
    
  test:
    runs-on: ubuntu-latest
    needs: build
    steps: [...]
    
  deploy:
    runs-on: ubuntu-latest
    needs: [build, test]
    steps: [...]
```

## Best Practices

### 1. Workflow Organization
- Keep workflows focused and single-purpose
- Use descriptive names and comments
- Group related steps together
- Use environment variables for configuration

### 2. Security
- Never commit secrets to code
- Use least-privilege permissions
- Regularly update action versions
- Scan for vulnerabilities

### 3. Performance
- Use caching where appropriate
- Run jobs in parallel when possible
- Clean up resources after use
- Monitor workflow execution times

### 4. Maintenance
- Regularly update action versions
- Monitor workflow success rates
- Document complex workflows
- Test changes in feature branches

## Integration with Our Pokedex Project

### Current Workflows
1. **CI Workflow**: Tests on every push/PR
2. **CD Workflow**: Deploys to staging/production
3. **Security Workflow**: Weekly vulnerability scanning
4. **Performance Workflow**: Weekly load testing
5. **Cleanup Workflow**: Weekly artifact cleanup

### Docker Images We Build
- `ghcr.io/grimm00/pokedex/frontend`
- `ghcr.io/grimm00/pokedex/backend`
- `ghcr.io/grimm00/pokedex/nginx`

### Environment Variables
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET_KEY`: JWT signing key
- `API_KEY`: External API key

### Secrets Required
- `GITHUB_TOKEN`: Automatically provided
- `DOCKER_USERNAME`: For Docker Hub (optional)
- `DOCKER_PASSWORD`: For Docker Hub (optional)
- `REGISTRY_USERNAME`: For private registry (optional)
- `REGISTRY_PASSWORD`: For private registry (optional)

## Learning Resources

### Official Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Actions](https://github.com/docker/build-push-action)
- [Security Actions](https://github.com/aquasecurity/trivy-action)

### Community Resources
- [Awesome Actions](https://github.com/sdras/awesome-actions)
- [GitHub Actions Examples](https://github.com/actions/starter-workflows)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Our Project Examples
- Check `.github/workflows/` directory for our implementations
- Review `scripts/` directory for deployment scripts
- Examine `docker-compose.yml` for service definitions

## Conclusion

GitHub Actions provides powerful capabilities for running images from repositories, enabling sophisticated CI/CD pipelines. Our Pokedex project leverages these capabilities to create a comprehensive automation system that builds, tests, and deploys our application across multiple environments.

The key to success is understanding how to:
1. **Build and push images** to registries
2. **Pull and run images** in workflows
3. **Manage secrets and environment variables**
4. **Implement proper security scanning**
5. **Optimize for performance and reliability**

This technical guide serves as a reference for understanding and extending our GitHub Actions implementation.
