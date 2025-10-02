# Performance Optimization Guide

## Overview
This guide provides comprehensive performance optimization strategies for the Pokedex project, covering frontend, backend, database, and infrastructure optimization.

## Table of Contents
1. [Frontend Performance](#frontend-performance)
2. [Backend Performance](#backend-performance)
3. [Database Performance](#database-performance)
4. [Infrastructure Performance](#infrastructure-performance)
5. [Caching Strategies](#caching-strategies)
6. [Monitoring and Profiling](#monitoring-and-profiling)
7. [Load Testing](#load-testing)

## Frontend Performance

### Bundle Optimization
```typescript
// Vite configuration for optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### Code Splitting
```typescript
// Lazy loading components
import { lazy, Suspense } from 'react';

const PokemonPage = lazy(() => import('./pages/PokemonPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/pokemon" element={<PokemonPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
    </Suspense>
  );
};
```

### Image Optimization
```typescript
// Optimized image loading
const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className="pokemon-card">
      {!imageLoaded && <div className="skeleton-loader" />}
      <img
        src={pokemon.sprites.front_default}
        alt={pokemon.name}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        style={{ display: imageLoaded ? 'block' : 'none' }}
      />
    </div>
  );
};
```

### State Management Optimization
```typescript
// Optimized Zustand store
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface PokemonStore {
  pokemon: Pokemon[];
  loading: boolean;
  error: string | null;
  fetchPokemon: () => Promise<void>;
}

export const usePokemonStore = create<PokemonStore>()(
  subscribeWithSelector((set, get) => ({
    pokemon: [],
    loading: false,
    error: null,
    fetchPokemon: async () => {
      set({ loading: true, error: null });
      try {
        const response = await fetch('/api/v1/pokemon');
        const data = await response.json();
        set({ pokemon: data.pokemon, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    }
  }))
);

// Selector optimization
export const usePokemonCount = () => usePokemonStore(state => state.pokemon.length);
export const usePokemonLoading = () => usePokemonStore(state => state.loading);
```

### Debouncing and Throttling
```typescript
// Debounced search
import { useCallback, useRef } from 'react';

const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: any[]) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

const PokemonSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchPokemon } = usePokemonStore();
  
  const debouncedSearch = useDebounce((term: string) => {
    fetchPokemon({ search: term });
  }, 300);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Search Pokemon..."
    />
  );
};
```

## Backend Performance

### Database Query Optimization
```python
# Optimized database queries
from sqlalchemy.orm import joinedload, selectinload

class PokemonService:
    @staticmethod
    def get_pokemon_with_favorites(user_id=None, page=1, per_page=20):
        query = Pokemon.query
        
        # Use eager loading to prevent N+1 queries
        query = query.options(joinedload(Pokemon.types))
        
        # Add favorites information if user is authenticated
        if user_id:
            query = query.outerjoin(
                UserPokemon, 
                and_(
                    UserPokemon.pokemon_id == Pokemon.pokemon_id,
                    UserPokemon.user_id == user_id
                )
            ).add_columns(
                UserPokemon.user_id.label('is_favorite')
            )
        
        # Apply pagination
        offset = (page - 1) * per_page
        return query.offset(offset).limit(per_page).all()
```

### Caching Implementation
```python
# Redis caching
import redis
from functools import wraps
import json
import hashlib

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expiry=300):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key
            cache_key = f"{func.__name__}:{hashlib.md5(str(args).encode()).hexdigest()}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, expiry, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache_result(expiry=600)
def get_pokemon_types():
    return Pokemon.query.with_entities(Pokemon.types).distinct().all()
```

### API Response Optimization
```python
# Optimized API responses
from flask import jsonify
from marshmallow import Schema, fields

class PokemonSchema(Schema):
    pokemon_id = fields.Int()
    name = fields.Str()
    height = fields.Int()
    weight = fields.Int()
    types = fields.List(fields.Str())
    sprites = fields.Dict()
    is_favorite = fields.Bool(allow_none=True)

pokemon_schema = PokemonSchema(many=True)

@app.route('/api/v1/pokemon')
def get_pokemon():
    pokemon = PokemonService.get_pokemon_with_favorites(
        user_id=get_jwt_identity(),
        page=request.args.get('page', 1, type=int),
        per_page=request.args.get('per_page', 20, type=int)
    )
    
    return jsonify({
        'pokemon': pokemon_schema.dump(pokemon),
        'total': Pokemon.query.count(),
        'page': request.args.get('page', 1, type=int),
        'per_page': request.args.get('per_page', 20, type=int)
    })
```

### Connection Pooling
```python
# Database connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

## Database Performance

### Indexing Strategy
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_pokemon_name ON pokemon(name);
CREATE INDEX idx_pokemon_types ON pokemon USING GIN(types);
CREATE INDEX idx_pokemon_height ON pokemon(height);
CREATE INDEX idx_pokemon_weight ON pokemon(weight);
CREATE INDEX idx_user_pokemon_user_id ON user_pokemon(user_id);
CREATE INDEX idx_user_pokemon_pokemon_id ON user_pokemon(pokemon_id);

-- Composite indexes for complex queries
CREATE INDEX idx_pokemon_type_height ON pokemon(types, height);
CREATE INDEX idx_user_pokemon_user_pokemon ON user_pokemon(user_id, pokemon_id);
```

### Query Optimization
```python
# Optimized queries with proper indexing
def get_pokemon_by_type_and_height(pokemon_type, min_height, max_height):
    return Pokemon.query.filter(
        Pokemon.types.contains([pokemon_type]),
        Pokemon.height >= min_height,
        Pokemon.height <= max_height
    ).order_by(Pokemon.name).all()

# Use database-level sorting instead of Python sorting
def get_pokemon_sorted(sort_by='name', order='asc'):
    if sort_by == 'name':
        order_func = Pokemon.name.asc() if order == 'asc' else Pokemon.name.desc()
    elif sort_by == 'height':
        order_func = Pokemon.height.asc() if order == 'asc' else Pokemon.height.desc()
    elif sort_by == 'weight':
        order_func = Pokemon.weight.asc() if order == 'asc' else Pokemon.weight.desc()
    
    return Pokemon.query.order_by(order_func).all()
```

### Database Connection Optimization
```python
# Database connection configuration
DATABASE_CONFIG = {
    'pool_size': 20,
    'max_overflow': 30,
    'pool_pre_ping': True,
    'pool_recycle': 3600,
    'echo': False,  # Set to True for debugging
    'echo_pool': False
}
```

## Infrastructure Performance

### Docker Optimization
```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine AS frontend-prod
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Optimize nginx configuration
RUN apk add --no-cache nginx-mod-http-headers-more
```

### Nginx Configuration
```nginx
# Nginx performance optimization
worker_processes auto;
worker_cpu_affinity auto;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API caching
    location /api/v1/pokemon {
        proxy_pass http://backend:5000;
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    }
}
```

### Load Balancing
```yaml
# Docker Compose with load balancing
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend

  backend:
    image: ghcr.io/grimm00/pokedex/backend:latest
    deploy:
      replicas: 3
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/pokedex
      - REDIS_URL=redis://redis:6379/0

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=pokedex
      - POSTGRES_USER=pokedex
      - POSTGRES_PASSWORD=password

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

## Caching Strategies

### Redis Caching
```python
# Redis caching implementation
import redis
import json
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

class CacheManager:
    @staticmethod
    def get(key):
        try:
            value = redis_client.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    @staticmethod
    def set(key, value, expiry=300):
        try:
            redis_client.setex(key, expiry, json.dumps(value))
        except Exception as e:
            print(f"Cache set error: {e}")
    
    @staticmethod
    def delete(key):
        try:
            redis_client.delete(key)
        except Exception as e:
            print(f"Cache delete error: {e}")

def cache_key(prefix, *args, **kwargs):
    key_parts = [prefix] + [str(arg) for arg in args]
    if kwargs:
        key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
    return ":".join(key_parts)

def cached(expiry=300):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = cache_key(func.__name__, *args, **kwargs)
            cached_result = CacheManager.get(key)
            if cached_result is not None:
                return cached_result
            
            result = func(*args, **kwargs)
            CacheManager.set(key, result, expiry)
            return result
        return wrapper
    return decorator
```

### Application-Level Caching
```python
# In-memory caching for frequently accessed data
from functools import lru_cache
import time

class PokemonCache:
    def __init__(self, max_size=1000, ttl=300):
        self.cache = {}
        self.max_size = max_size
        self.ttl = ttl
    
    def get(self, key):
        if key in self.cache:
            value, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return value
            else:
                del self.cache[key]
        return None
    
    def set(self, key, value):
        if len(self.cache) >= self.max_size:
            # Remove oldest entry
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k][1])
            del self.cache[oldest_key]
        
        self.cache[key] = (value, time.time())

# Global cache instance
pokemon_cache = PokemonCache()

@lru_cache(maxsize=100)
def get_pokemon_types():
    return Pokemon.query.with_entities(Pokemon.types).distinct().all()
```

## Monitoring and Profiling

### Performance Monitoring
```python
# Performance monitoring decorator
import time
import functools
from flask import g

def monitor_performance(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        print(f"{func.__name__} executed in {execution_time:.4f} seconds")
        
        # Log slow queries
        if execution_time > 1.0:
            print(f"SLOW QUERY: {func.__name__} took {execution_time:.4f} seconds")
        
        return result
    return wrapper

# Database query monitoring
from sqlalchemy import event
from sqlalchemy.engine import Engine
import time

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(Engine, "after_cursor_execute")
def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - context._query_start_time
    if total > 0.1:  # Log queries taking more than 100ms
        print(f"SLOW QUERY: {statement[:100]}... took {total:.4f} seconds")
```

### Application Metrics
```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Number of active connections')

@app.before_request
def before_request():
    g.start_time = time.time()

@app.after_request
def after_request(response):
    if hasattr(g, 'start_time'):
        duration = time.time() - g.start_time
        REQUEST_DURATION.observe(duration)
        REQUEST_COUNT.labels(method=request.method, endpoint=request.endpoint).inc()
    
    return response

@app.route('/metrics')
def metrics():
    return generate_latest()
```

## Load Testing

### K6 Load Testing
```javascript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 20 },   // Ramp up to 20 users
    { duration: '5m', target: 20 },   // Stay at 20 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

export default function () {
  // Test Pokemon API
  let response = http.get('http://localhost/api/v1/pokemon');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Test search functionality
  response = http.get('http://localhost/api/v1/pokemon?search=pikachu');
  check(response, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  sleep(1);
}
```

### Performance Testing with pytest
```python
# Performance tests
import pytest
import time
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_pokemon_api_performance(client):
    start_time = time.time()
    response = client.get('/api/v1/pokemon')
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 0.5  # Should respond within 500ms

def test_pokemon_search_performance(client):
    start_time = time.time()
    response = client.get('/api/v1/pokemon?search=pikachu')
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 0.3  # Search should be faster

def test_database_query_performance():
    start_time = time.time()
    pokemon = Pokemon.query.limit(20).all()
    end_time = time.time()
    
    assert len(pokemon) <= 20
    assert (end_time - start_time) < 0.1  # Database query should be fast
```

## Performance Best Practices

### Frontend Best Practices
- Use code splitting and lazy loading
- Optimize images and assets
- Implement proper caching strategies
- Minimize bundle size
- Use efficient state management
- Implement debouncing and throttling

### Backend Best Practices
- Optimize database queries
- Implement proper caching
- Use connection pooling
- Monitor and profile performance
- Implement rate limiting
- Use efficient serialization

### Database Best Practices
- Create proper indexes
- Optimize query patterns
- Use connection pooling
- Monitor query performance
- Implement proper data types
- Use database-level sorting

### Infrastructure Best Practices
- Use load balancing
- Implement proper caching
- Monitor resource usage
- Optimize container images
- Use CDN for static assets
- Implement proper logging

## Conclusion

Performance optimization is an ongoing process that requires monitoring, profiling, and continuous improvement. Regular performance testing and monitoring help identify bottlenecks and ensure the application performs well under various load conditions.

Remember to:
- Monitor performance metrics regularly
- Profile code to identify bottlenecks
- Test performance under load
- Optimize based on real-world usage patterns
- Keep performance optimization in mind during development