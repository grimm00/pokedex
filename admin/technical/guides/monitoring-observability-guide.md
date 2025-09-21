# Monitoring and Observability Guide

## Overview
This guide provides comprehensive monitoring and observability strategies for the Pokedex project, covering application monitoring, infrastructure monitoring, logging, and alerting.

## Table of Contents
1. [Application Monitoring](#application-monitoring)
2. [Infrastructure Monitoring](#infrastructure-monitoring)
3. [Logging Strategies](#logging-strategies)
4. [Metrics and Dashboards](#metrics-and-dashboards)
5. [Alerting and Notifications](#alerting-and-notifications)
6. [Distributed Tracing](#distributed-tracing)
7. [Health Checks](#health-checks)

## Application Monitoring

### Performance Metrics
```python
# Prometheus metrics for Flask application
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time
from flask import request, g

# Define metrics
REQUEST_COUNT = Counter(
    'http_requests_total', 
    'Total HTTP requests', 
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

DATABASE_QUERIES = Counter(
    'database_queries_total',
    'Total database queries',
    ['query_type']
)

CACHE_HITS = Counter(
    'cache_hits_total',
    'Total cache hits',
    ['cache_type']
)

CACHE_MISSES = Counter(
    'cache_misses_total',
    'Total cache misses',
    ['cache_type']
)

# Middleware for metrics collection
@app.before_request
def before_request():
    g.start_time = time.time()
    ACTIVE_CONNECTIONS.inc()

@app.after_request
def after_request(response):
    if hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.endpoint
        ).observe(duration)
        
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.endpoint,
            status_code=response.status_code
        ).inc()
    
    ACTIVE_CONNECTIONS.dec()
    return response

# Metrics endpoint
@app.route('/metrics')
def metrics():
    return generate_latest()
```

### Business Metrics
```python
# Business-specific metrics
POKEMON_VIEWS = Counter(
    'pokemon_views_total',
    'Total Pokemon views',
    ['pokemon_id', 'pokemon_name']
)

FAVORITES_ADDED = Counter(
    'favorites_added_total',
    'Total favorites added',
    ['user_id']
)

SEARCH_QUERIES = Counter(
    'search_queries_total',
    'Total search queries',
    ['search_term', 'result_count']
)

API_ERRORS = Counter(
    'api_errors_total',
    'Total API errors',
    ['error_type', 'endpoint']
)

# Track business metrics
@app.route('/api/v1/pokemon/<int:pokemon_id>')
def get_pokemon_detail(pokemon_id):
    pokemon = Pokemon.query.get(pokemon_id)
    if pokemon:
        POKEMON_VIEWS.labels(
            pokemon_id=pokemon_id,
            pokemon_name=pokemon.name
        ).inc()
    return jsonify(pokemon)

@app.route('/api/v1/favorites', methods=['POST'])
def add_favorite():
    try:
        # Add favorite logic
        FAVORITES_ADDED.labels(user_id=get_jwt_identity()).inc()
        return jsonify({'message': 'Favorite added'})
    except Exception as e:
        API_ERRORS.labels(
            error_type=type(e).__name__,
            endpoint='add_favorite'
        ).inc()
        raise
```

## Infrastructure Monitoring

### Docker Container Monitoring
```yaml
# Docker Compose with monitoring
version: '3.8'
services:
  app:
    image: ghcr.io/grimm00/pokedex/app:latest
    ports:
      - "5000:5000"
    environment:
      - PROMETHEUS_MULTIPROC_DIR=/tmp
    volumes:
      - /tmp:/tmp
    labels:
      - "prometheus.io/scrape=true"
      - "prometheus.io/port=5000"
      - "prometheus.io/path=/metrics"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/var/lib/grafana/dashboards
      - ./grafana/provisioning:/etc/grafana/provisioning

volumes:
  prometheus_data:
  grafana_data:
```

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'pokedex-app'
    static_configs:
      - targets: ['app:5000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Node Exporter for System Metrics
```yaml
# Add to docker-compose.yml
  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
```

## Logging Strategies

### Structured Logging
```python
# Structured logging configuration
import logging
import json
from datetime import datetime
from flask import request, g

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add request context if available
        if hasattr(g, 'request_id'):
            log_entry['request_id'] = g.request_id
        
        if request:
            log_entry['method'] = request.method
            log_entry['url'] = request.url
            log_entry['remote_addr'] = request.remote_addr
            log_entry['user_agent'] = request.headers.get('User-Agent')
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry)

# Configure logging
def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JSONFormatter())
    logger.addHandler(console_handler)
    
    # File handler
    file_handler = logging.FileHandler('app.log')
    file_handler.setFormatter(JSONFormatter())
    logger.addHandler(file_handler)
    
    return logger
```

### Request Logging
```python
# Request logging middleware
import uuid
from flask import g

@app.before_request
def before_request():
    g.request_id = str(uuid.uuid4())
    g.start_time = time.time()
    
    logger.info("Request started", extra={
        'request_id': g.request_id,
        'method': request.method,
        'url': request.url,
        'remote_addr': request.remote_addr
    })

@app.after_request
def after_request(response):
    if hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        
        logger.info("Request completed", extra={
            'request_id': g.request_id,
            'status_code': response.status_code,
            'duration': duration,
            'response_size': len(response.get_data())
        })
    
    return response
```

### Error Logging
```python
# Error logging and handling
import traceback
from flask import jsonify

@app.errorhandler(Exception)
def handle_exception(e):
    error_id = str(uuid.uuid4())
    
    logger.error("Unhandled exception", extra={
        'error_id': error_id,
        'exception_type': type(e).__name__,
        'exception_message': str(e),
        'traceback': traceback.format_exc()
    })
    
    return jsonify({
        'error': 'Internal server error',
        'error_id': error_id
    }), 500

@app.errorhandler(404)
def handle_not_found(e):
    logger.warning("Resource not found", extra={
        'url': request.url,
        'method': request.method
    })
    
    return jsonify({'error': 'Resource not found'}), 404
```

## Metrics and Dashboards

### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "Pokedex Application Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      },
      {
        "title": "Active Connections",
        "type": "singlestat",
        "targets": [
          {
            "expr": "active_connections",
            "legendFormat": "Active Connections"
          }
        ]
      }
    ]
  }
}
```

### Custom Metrics Dashboard
```python
# Custom metrics endpoint
@app.route('/api/v1/metrics/summary')
def metrics_summary():
    from prometheus_client import REGISTRY
    
    metrics = {}
    for metric in REGISTRY.collect():
        if metric.name.startswith('http_'):
            metrics[metric.name] = {
                'samples': len(metric.samples),
                'type': metric.type
            }
    
    return jsonify(metrics)
```

## Alerting and Notifications

### Alert Rules
```yaml
# alert_rules.yml
groups:
  - name: pokedex_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      - alert: DatabaseConnectionFailure
        expr: up{job="pokedex-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"
          description: "Cannot connect to database"
```

### Slack Notifications
```yaml
# alertmanager.yml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#alerts'
        title: 'Pokedex Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
        send_resolved: true
```

### Email Notifications
```python
# Email alerting
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_alert_email(alert_data):
    msg = MIMEMultipart()
    msg['From'] = "alerts@pokedex.com"
    msg['To'] = "admin@pokedex.com"
    msg['Subject'] = f"Alert: {alert_data['title']}"
    
    body = f"""
    Alert: {alert_data['title']}
    Description: {alert_data['description']}
    Severity: {alert_data['severity']}
    Time: {alert_data['timestamp']}
    """
    
    msg.attach(MIMEText(body, 'plain'))
    
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login("alerts@pokedex.com", "password")
    server.send_message(msg)
    server.quit()
```

## Distributed Tracing

### OpenTelemetry Integration
```python
# OpenTelemetry setup
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

# Configure tracing
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Configure Jaeger exporter
jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger",
    agent_port=6831,
)

# Add span processor
span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# Instrument Flask and requests
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()

# Custom spans
@app.route('/api/v1/pokemon')
def get_pokemon():
    with tracer.start_as_current_span("get_pokemon"):
        with tracer.start_as_current_span("database_query"):
            pokemon = Pokemon.query.all()
        
        with tracer.start_as_current_span("serialize_response"):
            return jsonify([p.to_dict() for p in pokemon])
```

### Jaeger Configuration
```yaml
# docker-compose.yml addition
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true
```

## Health Checks

### Comprehensive Health Checks
```python
# Health check endpoint
@app.route('/health')
def health_check():
    health_status = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'checks': {}
    }
    
    # Database health check
    try:
        db.session.execute('SELECT 1')
        health_status['checks']['database'] = 'healthy'
    except Exception as e:
        health_status['checks']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Redis health check
    try:
        redis_client.ping()
        health_status['checks']['redis'] = 'healthy'
    except Exception as e:
        health_status['checks']['redis'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Disk space check
    try:
        import shutil
        disk_usage = shutil.disk_usage('/')
        free_space_gb = disk_usage.free / (1024**3)
        if free_space_gb < 1:  # Less than 1GB free
            health_status['checks']['disk'] = f'unhealthy: {free_space_gb:.2f}GB free'
            health_status['status'] = 'unhealthy'
        else:
            health_status['checks']['disk'] = f'healthy: {free_space_gb:.2f}GB free'
    except Exception as e:
        health_status['checks']['disk'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    status_code = 200 if health_status['status'] == 'healthy' else 503
    return jsonify(health_status), status_code
```

### Kubernetes Health Checks
```yaml
# Kubernetes deployment with health checks
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pokedex-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pokedex-app
  template:
    metadata:
      labels:
        app: pokedex-app
    spec:
      containers:
      - name: pokedex-app
        image: ghcr.io/grimm00/pokedex/app:latest
        ports:
        - containerPort: 5000
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Monitoring Best Practices

### Application Monitoring
- Monitor key business metrics
- Track user behavior and engagement
- Monitor API performance and errors
- Set up proper alerting thresholds
- Use distributed tracing for complex flows

### Infrastructure Monitoring
- Monitor system resources (CPU, memory, disk)
- Track network performance
- Monitor database performance
- Set up log aggregation and analysis
- Implement proper backup monitoring

### Alerting Best Practices
- Set up multiple alert channels
- Use appropriate severity levels
- Implement alert escalation
- Regular alert testing
- Document alert procedures

### Logging Best Practices
- Use structured logging
- Include correlation IDs
- Log at appropriate levels
- Implement log rotation
- Secure sensitive information

## Conclusion

Effective monitoring and observability are essential for maintaining a healthy, performant application. This guide provides the foundation for implementing comprehensive monitoring across all layers of the Pokedex application.

Remember to:
- Start with basic metrics and gradually add more
- Monitor both technical and business metrics
- Set up proper alerting and escalation
- Regularly review and tune monitoring
- Document monitoring procedures and runbooks
