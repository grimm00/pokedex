# GitHub Actions Quick Reference

## Essential Commands

### Workflow Management
```bash
# List all workflows
gh workflow list

# Run a specific workflow
gh workflow run ci.yml

# View workflow runs
gh run list

# View specific run details
gh run view <run-id>

# View run logs
gh run view <run-id> --log

# Cancel a running workflow
gh run cancel <run-id>

# Rerun a failed workflow
gh run rerun <run-id>
```

### Repository Management
```bash
# Clone repository
gh repo clone grimm00/pokedex

# View repository details
gh repo view grimm00/pokedex

# List repository secrets
gh secret list

# Set repository secret
gh secret set SECRET_NAME --body "secret-value"

# Delete repository secret
gh secret delete SECRET_NAME
```

## Common Workflow Patterns

### Basic Workflow Structure
```yaml
name: Workflow Name
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - name: Step name
        run: echo "Hello World"
```

### Environment Setup
```yaml
# Node.js setup
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'

# Python setup
- name: Set up Python
  uses: actions/setup-node@v4
  with:
    python-version: '3.13'
    cache: 'pip'

# Docker setup
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

### Caching
```yaml
# Cache Node modules
- name: Cache Node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# Cache Python packages
- name: Cache pip packages
  uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
```

### Matrix Strategy
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

### Conditional Steps
```yaml
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: echo "Deploying to staging"

- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: echo "Deploying to production"
```

## Docker Integration

### Build and Push
```yaml
- name: Log in to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}/app:latest
```

### Multi-platform Build
```yaml
- name: Build and push multi-platform
  uses: docker/build-push-action@v5
  with:
    context: .
    platforms: linux/amd64,linux/arm64
    push: true
    tags: ghcr.io/${{ github.repository }}/app:latest
```

## Security

### Vulnerability Scanning
```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
    output: 'trivy-results.sarif'

- name: Upload Trivy scan results
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'
```

### Code Quality Analysis
```yaml
- name: Run CodeQL Analysis
  uses: github/codeql-action/analyze@v3
  with:
    languages: javascript, python
```

### Dependency Review
```yaml
- name: Dependency Review
  uses: actions/dependency-review-action@v4
  with:
    fail-on-severity: moderate
```

## Testing

### Unit Tests
```yaml
- name: Run unit tests
  run: |
    npm test
    python -m pytest tests/unit/
```

### Integration Tests
```yaml
- name: Run integration tests
  run: |
    python -m pytest tests/integration/
```

### Performance Tests
```yaml
- name: Run performance tests
  run: |
    python -m pytest tests/performance/
```

## Deployment

### Environment-based Deployment
```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: echo "Deploying to staging"

  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: echo "Deploying to production"
```

### Health Checks
```yaml
- name: Wait for deployment
  run: |
    timeout 300 bash -c 'until curl -f http://localhost/health; do sleep 5; done'
```

## Troubleshooting

### Debug Commands
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

### Common Issues
```yaml
# Permission issues
- name: Fix permissions
  run: |
    chmod +x scripts/*.sh
    sudo chown -R $USER:$USER .

# Cache issues
- name: Clear cache
  run: |
    npm cache clean --force
    pip cache purge

# Docker issues
- name: Debug Docker
  run: |
    docker version
    docker info
    docker system df
```

## Environment Variables

### Built-in Variables
```yaml
- name: Use built-in variables
  run: |
    echo "Repository: ${{ github.repository }}"
    echo "Actor: ${{ github.actor }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    echo "Workflow: ${{ github.workflow }}"
    echo "Job: ${{ github.job }}"
    echo "Step: ${{ github.step }}"
```

### Custom Environment Variables
```yaml
- name: Set environment variables
  run: |
    echo "CUSTOM_VAR=value" >> $GITHUB_ENV
    echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> $GITHUB_ENV
```

## Secrets Management

### Using Secrets
```yaml
- name: Use secret
  run: echo ${{ secrets.MY_SECRET }}
```

### Setting Secrets
```bash
# Set repository secret
gh secret set SECRET_NAME --body "secret-value"

# Set environment secret
gh secret set SECRET_NAME --body "secret-value" --env staging
```

## Artifacts

### Upload Artifacts
```yaml
- name: Upload test results
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: test-results/
```

### Download Artifacts
```yaml
- name: Download artifacts
  uses: actions/download-artifact@v4
  with:
    name: test-results
    path: test-results/
```

## Notifications

### Slack Notification
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#deployments'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notification
```yaml
- name: Send email
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "Deployment Status"
    body: "Deployment completed successfully"
    to: admin@example.com
```

## Best Practices

### Workflow Organization
- Keep workflows focused and single-purpose
- Use descriptive names and comments
- Group related steps together
- Use environment variables for configuration

### Security
- Never commit secrets to code
- Use least-privilege permissions
- Regularly update action versions
- Scan for vulnerabilities

### Performance
- Use caching where appropriate
- Run jobs in parallel when possible
- Clean up resources after use
- Monitor workflow execution times

### Maintenance
- Regularly update action versions
- Monitor workflow success rates
- Document complex workflows
- Test changes in feature branches
