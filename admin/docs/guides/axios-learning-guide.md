# Axios Learning Guide

## What is Axios?

**Axios** is a popular, promise-based HTTP client library for JavaScript and TypeScript. It's designed to make HTTP requests from both browsers and Node.js environments simple and powerful.

## Why Do We Need Axios?

### The Problem: Making HTTP Requests
When building web applications, you need to communicate with APIs (like our Flask backend). JavaScript has built-in ways to do this, but they're not very user-friendly:

```javascript
// Native JavaScript fetch() - verbose and complex
fetch('http://localhost:5000/api/v1/pokemon')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### The Solution: Axios
Axios makes this much simpler and more powerful:

```javascript
// Axios - clean and simple
import axios from 'axios';

axios.get('http://localhost:5000/api/v1/pokemon')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## Key Features of Axios

### 1. **Promise-Based**
- Uses modern JavaScript Promises
- Works great with async/await
- Easy error handling

### 2. **Request/Response Interceptors**
- Automatically add headers (like authentication tokens)
- Transform request/response data
- Handle errors globally

### 3. **Automatic JSON Parsing**
- Automatically converts JSON responses to JavaScript objects
- No need to call `.json()` like with fetch()

### 4. **Request/Response Transformation**
- Convert data before sending
- Transform responses before returning
- Handle different data formats

### 5. **Error Handling**
- Automatic error detection
- Detailed error information
- Network error handling

### 6. **Request Cancellation**
- Cancel requests when needed
- Prevent memory leaks
- Better user experience

## How Axios Fits in Our Project

### Current State
```
Frontend (React) ──fetch()──> Backend (Flask API)
```

### With Axios
```
Frontend (React) ──Axios──> Backend (Flask API)
                     │
                     ├── Automatic JSON parsing
                     ├── Error handling
                     ├── Request interceptors
                     └── Response interceptors
```

## Axios vs Other Options

| Feature | Axios | Fetch API | jQuery AJAX |
|---------|-------|-----------|-------------|
| **Browser Support** | Modern browsers | Modern browsers | All browsers |
| **Node.js Support** | ✅ Yes | ❌ No | ❌ No |
| **JSON Parsing** | ✅ Automatic | ❌ Manual | ✅ Automatic |
| **Request Interceptors** | ✅ Yes | ❌ No | ✅ Yes |
| **Error Handling** | ✅ Advanced | ❌ Basic | ✅ Basic |
| **Request Cancellation** | ✅ Yes | ✅ Yes | ❌ No |
| **Bundle Size** | ~13KB | Built-in | ~30KB |

## Installation and Setup

### 1. Install Axios
```bash
cd frontend
npm install axios
```

### 2. Basic Usage
```typescript
import axios from 'axios';

// Simple GET request
const response = await axios.get('http://localhost:5000/api/v1/pokemon');
console.log(response.data);

// POST request with data
const newPokemon = await axios.post('http://localhost:5000/api/v1/pokemon', {
  name: 'pikachu',
  type: 'electric'
});
```

### 3. Create API Client (Our Approach)
```typescript
// services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```

## Advanced Axios Features

### 1. **Request Interceptors**
```typescript
// Add authentication token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. **Response Interceptors**
```typescript
// Handle common responses globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. **Error Handling**
```typescript
try {
  const response = await apiClient.get('/pokemon');
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('API Error:', error.response?.data);
    console.error('Status:', error.response?.status);
  }
  throw error;
}
```

### 4. **Request Cancellation**
```typescript
const source = axios.CancelToken.source();

// Make request
const response = await apiClient.get('/pokemon', {
  cancelToken: source.token
});

// Cancel request if needed
source.cancel('Request cancelled by user');
```

## Real-World Example: Our Pokemon API

### 1. **Pokemon Service**
```typescript
// services/api/pokemon.ts
import apiClient from './client';

export const pokemonService = {
  // Get all Pokemon with pagination
  async getPokemon(page = 1, perPage = 20, search = '') {
    const response = await apiClient.get('/pokemon', {
      params: { page, per_page: perPage, search }
    });
    return response.data;
  },

  // Get single Pokemon
  async getPokemonById(id: number) {
    const response = await apiClient.get(`/pokemon/${id}`);
    return response.data;
  },

  // Search Pokemon
  async searchPokemon(query: string) {
    const response = await apiClient.get('/pokemon', {
      params: { search: query }
    });
    return response.data;
  }
};
```

### 2. **Using in React Components**
```typescript
// components/PokemonPage.tsx
import { useEffect, useState } from 'react';
import { pokemonService } from '../services/api/pokemon';

const PokemonPage = () => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        const data = await pokemonService.getPokemon();
        setPokemon(data.pokemon);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {pokemon.map(poke => (
        <div key={poke.id}>{poke.name}</div>
      ))}
    </div>
  );
};
```

## Best Practices

### 1. **Create a Centralized API Client**
- Single configuration point
- Consistent error handling
- Easy to maintain

### 2. **Use TypeScript Interfaces**
```typescript
interface Pokemon {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
```

### 3. **Handle Errors Gracefully**
```typescript
const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    console.error('Server Error:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('Network Error:', error.message);
  } else {
    // Something else happened
    console.error('Error:', error.message);
  }
};
```

### 4. **Use Environment Variables**
```typescript
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
});
```

## Common Patterns

### 1. **Retry Logic**
```typescript
const retryRequest = async (fn: () => Promise<any>, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};
```

### 2. **Request Deduplication**
```typescript
const requestCache = new Map();

const deduplicatedRequest = async (key: string, fn: () => Promise<any>) => {
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }
  
  const promise = fn();
  requestCache.set(key, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    requestCache.delete(key);
  }
};
```

## Debugging Axios

### 1. **Enable Request Logging**
```typescript
apiClient.interceptors.request.use((config) => {
  console.log('Making request:', config.method?.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Request failed:', error.message);
    return Promise.reject(error);
  }
);
```

### 2. **Network Tab in DevTools**
- See all HTTP requests
- Check request/response headers
- Monitor timing and size

### 3. **Axios DevTools Extension**
- Browser extension for debugging
- Visual request/response inspection
- Performance monitoring

## Security Considerations

### 1. **CSRF Protection**
```typescript
apiClient.defaults.xsrfCookieName = 'csrftoken';
apiClient.defaults.xsrfHeaderName = 'X-CSRFToken';
```

### 2. **Content Security Policy**
```typescript
// Ensure API calls are allowed in CSP
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // Include cookies
});
```

### 3. **Input Validation**
```typescript
const validatePokemonData = (data: any): Pokemon => {
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Invalid Pokemon name');
  }
  return data;
};
```

## Performance Tips

### 1. **Request Timeout**
```typescript
const apiClient = axios.create({
  timeout: 10000, // 10 seconds
});
```

### 2. **Concurrent Requests**
```typescript
// Make multiple requests simultaneously
const [pokemon, types, abilities] = await Promise.all([
  pokemonService.getPokemon(),
  pokemonService.getTypes(),
  pokemonService.getAbilities()
]);
```

### 3. **Request Cancellation**
```typescript
// Cancel requests when component unmounts
useEffect(() => {
  const source = axios.CancelToken.source();
  
  const fetchData = async () => {
    try {
      const response = await apiClient.get('/pokemon', {
        cancelToken: source.token
      });
      setPokemon(response.data);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setError(error.message);
      }
    }
  };
  
  fetchData();
  
  return () => {
    source.cancel('Component unmounted');
  };
}, []);
```

## Summary

Axios is a powerful, feature-rich HTTP client that makes API communication simple and robust. For our Pokemon project, it will:

1. **Simplify API calls** - Clean, readable code
2. **Handle errors gracefully** - Better user experience
3. **Add authentication** - Automatic token management
4. **Provide interceptors** - Global request/response handling
5. **Support TypeScript** - Type safety and better development experience

**Next Steps:**
1. Install Axios in our frontend
2. Create the API client configuration
3. Build Pokemon service functions
4. Integrate with our React components

This will be the foundation for connecting our React frontend to our Flask backend API! 🚀
