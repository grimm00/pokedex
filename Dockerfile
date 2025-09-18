# Multi-stage Pokedex Dockerfile
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Backend with Frontend
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    redis-server \
    sqlite3 \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code (excludes files in .dockerignore)
COPY backend/ ./backend/
COPY migrations/ ./migrations/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create instance directory for SQLite database
RUN mkdir -p instance && chmod 777 instance

# Configure nginx to serve frontend and proxy API
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    # Serve frontend static files \
    location / { \
    root /app/frontend/dist; \
    try_files $uri $uri/ /index.html; \
    } \
    \
    # Proxy API requests to Flask \
    location /api/ { \
    proxy_pass http://localhost:5000; \
    proxy_set_header Host $host; \
    proxy_set_header X-Real-IP $remote_addr; \
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
    proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    }' > /etc/nginx/sites-available/default

# Set environment variables
ENV FLASK_APP=backend.app
ENV FLASK_ENV=production
ENV DATABASE_URL=sqlite:////app/instance/pokedex_dev.db
ENV REDIS_URL=redis://localhost:6379/0

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start Redis, Flask app, and nginx
CMD ["sh", "-c", "redis-server --daemonize yes && python -m flask db upgrade && python -m backend.utils.seed_pokemon seed-range 1 50 && python -m backend.app & nginx -g 'daemon off;'"]
