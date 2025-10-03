# Security Hardening Guide

## Overview
This guide provides comprehensive security hardening strategies for the Pokedex project, covering container security, application security, and infrastructure security.

## Table of Contents
1. [Container Security](#container-security)
2. [Application Security](#application-security)
3. [Infrastructure Security](#infrastructure-security)
4. [Network Security](#network-security)
5. [Data Protection](#data-protection)
6. [Monitoring and Alerting](#monitoring-and-alerting)
7. [Incident Response](#incident-response)

## Container Security

### Base Image Security
```dockerfile
# Use minimal base images
FROM node:18-alpine AS frontend-build
FROM nginx:alpine AS frontend-prod

# Use specific versions
FROM node:18.16.0-alpine3.18

# Use distroless images when possible
FROM gcr.io/distroless/nodejs18-debian11
```

### Multi-stage Build Security
```dockerfile
# Build stage with build tools
FROM node:18-alpine AS builder
RUN apk add --no-cache build-base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage without build tools
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Remove unnecessary packages
RUN apk del build-base
```

### User Security
```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Switch to non-root user
USER nextjs

# Set proper permissions
RUN chown -R nextjs:nodejs /app
```

### Image Scanning
```yaml
# GitHub Actions security scanning
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/${{ github.repository }}/frontend:latest
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'HIGH,CRITICAL'
```

### Image Signing
```yaml
# Sign images with Cosign
- name: Sign image with Cosign
  uses: sigstore/cosign-installer@v3
  with:
    cosign-release: 'v2.0.0'

- name: Sign image
  run: |
    cosign sign --key cosign.key ghcr.io/${{ github.repository }}/frontend:latest
```

## Application Security

### Environment Variables
```yaml
# Secure environment variable handling
- name: Set secure environment variables
  run: |
    echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> $GITHUB_ENV
    echo "JWT_SECRET_KEY=${{ secrets.JWT_SECRET_KEY }}" >> $GITHUB_ENV
    echo "REDIS_URL=${{ secrets.REDIS_URL }}" >> $GITHUB_ENV
```

### Secret Management
```yaml
# Use GitHub Secrets
- name: Use secrets
  run: |
    echo "Secret value: ${{ secrets.MY_SECRET }}"
    # Never log secret values
    echo "Secret length: ${#SECRET_VALUE}"
```

### Input Validation
```python
# Backend input validation
from marshmallow import Schema, fields, validate

class PokemonSearchSchema(Schema):
    search = fields.Str(validate=validate.Length(max=100))
    type = fields.Str(validate=validate.OneOf(['all', 'fire', 'water', 'grass']))
    sort = fields.Str(validate=validate.OneOf(['id', 'name', 'type', 'favorites']))
    page = fields.Int(validate=validate.Range(min=1, max=1000))
    per_page = fields.Int(validate=validate.Range(min=1, max=100))
```

### SQL Injection Prevention
```python
# Use parameterized queries
def get_pokemon_by_type(pokemon_type):
    return Pokemon.query.filter(Pokemon.types.contains([pokemon_type])).all()

# Never use string concatenation
# BAD: f"SELECT * FROM pokemon WHERE type = '{pokemon_type}'"
# GOOD: Use ORM or parameterized queries
```

### XSS Prevention
```typescript
// Frontend XSS prevention
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Use React's built-in XSS protection
const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
  return (
    <div>
      <h3>{pokemon.name}</h3> {/* React automatically escapes */}
    </div>
  );
};
```

### CSRF Protection
```python
# Flask CSRF protection
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
csrf = CSRFProtect(app)

# Include CSRF token in forms
@app.route('/api/v1/favorites', methods=['POST'])
@csrf.exempt  # Only for API endpoints
def add_favorite():
    # Validate CSRF token for web forms
    pass
```

## Infrastructure Security

### Network Security
```yaml
# Docker Compose network security
version: '3.8'
services:
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    networks:
      - frontend-network

  backend:
    image: ghcr.io/grimm00/pokedex/backend:latest
    networks:
      - backend-network
      - database-network
    expose:
      - "5000"

  database:
    image: postgres:15-alpine
    networks:
      - database-network
    environment:
      - POSTGRES_DB=pokedex
      - POSTGRES_USER=pokedex
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
  database-network:
    driver: bridge
    internal: true

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### Firewall Configuration
```bash
# UFW firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### SSL/TLS Configuration
```nginx
# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name pokedex.example.com;
    
    ssl_certificate /etc/ssl/certs/pokedex.crt;
    ssl_certificate_key /etc/ssl/private/pokedex.key;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

## Network Security

### API Rate Limiting
```python
# Flask rate limiting
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/v1/pokemon')
@limiter.limit("100 per hour")
def get_pokemon():
    pass
```

### CORS Configuration
```python
# Flask CORS configuration
from flask_cors import CORS

cors = CORS(app, resources={
    r"/api/*": {
        "origins": ["https://pokedex.example.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### Request Validation
```python
# Request size limits
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Request timeout
@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    if hasattr(request, 'start_time'):
        duration = time.time() - request.start_time
        if duration > 30:  # 30 seconds
            app.logger.warning(f"Slow request: {request.endpoint} took {duration}s")
    return response
```

## Data Protection

### Data Encryption
```python
# Encrypt sensitive data
from cryptography.fernet import Fernet

class DataEncryption:
    def __init__(self, key):
        self.cipher = Fernet(key)
    
    def encrypt(self, data):
        return self.cipher.encrypt(data.encode())
    
    def decrypt(self, encrypted_data):
        return self.cipher.decrypt(encrypted_data).decode()
```

### Database Security
```python
# Database connection security
DATABASE_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'pokedex'),
    'user': os.getenv('DB_USER', 'pokedex'),
    'password': os.getenv('DB_PASSWORD'),
    'sslmode': 'require',
    'sslcert': '/path/to/client-cert.pem',
    'sslkey': '/path/to/client-key.pem',
    'sslrootcert': '/path/to/ca-cert.pem'
}
```

### Data Masking
```python
# Mask sensitive data in logs
import logging
import re

class SensitiveDataFilter(logging.Filter):
    def filter(self, record):
        # Mask passwords
        record.msg = re.sub(r'password["\']?\s*[:=]\s*["\']?[^"\']+', 
                           'password="***"', str(record.msg))
        # Mask tokens
        record.msg = re.sub(r'token["\']?\s*[:=]\s*["\']?[^"\']+', 
                           'token="***"', str(record.msg))
        return True

# Apply filter to logger
logger = logging.getLogger(__name__)
logger.addFilter(SensitiveDataFilter())
```

## Monitoring and Alerting

### Security Monitoring
```yaml
# Security monitoring with Falco
- name: Run Falco security monitoring
  uses: falcosecurity/falco-action@main
  with:
    rules_file: falco-rules.yaml
    config_file: falco-config.yaml
```

### Log Analysis
```bash
# Security log analysis
grep -i "failed\|error\|unauthorized\|forbidden" /var/log/nginx/access.log
grep -i "sql injection\|xss\|csrf" /var/log/application.log
grep -i "brute force\|dictionary attack" /var/log/auth.log
```

### Alerting
```yaml
# Security alerting
- name: Security Alert
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    channel: '#security-alerts'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    fields: repo,message,commit,author,action,eventName,ref,workflow
```

## Incident Response

### Incident Response Plan
1. **Detection**: Monitor logs and alerts
2. **Assessment**: Determine severity and scope
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threats
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Document and improve

### Emergency Procedures
```bash
# Emergency container shutdown
docker-compose down --remove-orphans

# Emergency database backup
docker-compose exec database pg_dump -U pokedex pokedex > emergency_backup.sql

# Emergency log collection
docker-compose logs --tail=1000 > incident_logs.txt

# Emergency system isolation
iptables -A INPUT -j DROP
iptables -A OUTPUT -j DROP
```

### Recovery Procedures
```bash
# Restore from backup
docker-compose down
docker-compose up -d database
docker-compose exec database psql -U pokedex pokedex < emergency_backup.sql
docker-compose up -d

# Verify system integrity
./scripts/health-check.sh
curl -f http://localhost/api/v1/health
```

## Security Best Practices

### Development Security
- Use secure coding practices
- Regular security code reviews
- Automated security testing
- Dependency vulnerability scanning
- Secure configuration management

### Deployment Security
- Use secure base images
- Implement least privilege access
- Regular security updates
- Network segmentation
- Monitoring and logging

### Operational Security
- Regular security assessments
- Incident response procedures
- Security training and awareness
- Regular backup and recovery testing
- Continuous monitoring and alerting

## Compliance and Standards

### Security Standards
- OWASP Top 10
- NIST Cybersecurity Framework
- ISO 27001
- SOC 2 Type II
- PCI DSS (if applicable)

### Security Controls
- Access controls
- Authentication and authorization
- Data encryption
- Network security
- Monitoring and logging
- Incident response
- Business continuity

## Conclusion

This security hardening guide provides comprehensive strategies for securing the Pokedex project at all levels. Regular security assessments, updates, and monitoring are essential for maintaining a secure application environment.

Remember to:
- Regularly update dependencies and base images
- Monitor security advisories and patches
- Conduct regular security assessments
- Maintain incident response procedures
- Keep security documentation current
