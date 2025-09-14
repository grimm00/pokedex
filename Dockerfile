# Pokedex API Dockerfile
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    redis-server \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (excludes files in .dockerignore)
COPY . .

# Create instance directory for SQLite database
RUN mkdir -p instance && chmod 777 instance

# Set environment variables
ENV FLASK_APP=backend.app
ENV FLASK_ENV=production
ENV DATABASE_URL=sqlite:////app/instance/pokedex_dev.db
ENV REDIS_URL=redis://localhost:6379/0

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Start Redis and Flask app
CMD ["sh", "-c", "redis-server --daemonize yes && python -m flask db upgrade && python -m backend.utils.seed_pokemon seed-range 1 50 && python -m backend.app"]
