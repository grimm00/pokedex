# API Versioning Strategy

## Overview
This document outlines our API versioning strategy for the Pokedex project, including implementation details and future planning.

## Current Implementation

### **Version Structure**
- **Current Version**: v1
- **API Version**: 1.0.0
- **URL Pattern**: `/api/v1/`
- **Documentation**: `/docs/`

### **Versioned Endpoints**
All API endpoints now use the `/api/v1/` prefix:

#### Pokemon Endpoints
- `GET /api/v1/pokemon` - List all Pokemon
- `POST /api/v1/pokemon` - Create Pokemon
- `GET /api/v1/pokemon/<id>` - Get specific Pokemon
- `PUT /api/v1/pokemon/<id>` - Update Pokemon
- `DELETE /api/v1/pokemon/<id>` - Delete Pokemon

#### User Endpoints (Protected - Authentication Required)
- `GET /api/v1/users` - List all users (admin only)
- `GET /api/v1/users/<id>` - Get specific user (own data or admin)
- `PUT /api/v1/users/<id>` - Update user (own data only)
- `DELETE /api/v1/users/<id>` - Delete user (admin only)
- `GET /api/v1/users/<id>/favorites` - Get user favorites (own data only)
- `POST /api/v1/users/<id>/favorites` - Add favorite (own data only)
- `DELETE /api/v1/users/<id>/favorites` - Remove favorite (own data only)

#### Authentication Endpoints (Public)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh (protected)
- `POST /api/v1/auth/logout` - User logout (protected)
- `GET /api/v1/auth/profile` - Get profile (protected)
- `PUT /api/v1/auth/profile` - Update profile (protected)

#### Utility Endpoints
- `GET /` - Health check with version info
- `GET /api/version` - API version information
- `GET /docs/` - Interactive API documentation

## Versioning Benefits

### **1. Backward Compatibility**
- Old clients continue working
- New features don't break existing integrations
- Gradual migration path for clients

### **2. Future-Proofing**
- Easy to add new features in v2
- Can deprecate old features safely
- Clear upgrade path for clients

### **3. Learning Value**
- Teaches production API management
- Understanding of API evolution
- Industry best practices

## Version Lifecycle

### **Version States**
1. **Development** - New features being developed
2. **Active** - Currently supported and maintained
3. **Deprecated** - Still supported but not recommended
4. **Retired** - No longer supported

### **Current Status**
- **v1**: Active (current)
- **Future v2**: Development (when needed)

## Future Version Planning

### **When to Create v2**
- Breaking changes to existing endpoints
- Major feature additions
- Significant data model changes
- Performance improvements requiring API changes

### **Example v2 Changes**
```json
// v1 Response
{
  "pokemon": [...],
  "pagination": {...}
}

// Potential v2 Response
{
  "data": [...],
  "meta": {
    "pagination": {...},
    "filters": {...},
    "sorting": {...}
  }
}
```

## Implementation Details

### **URL Structure**
```
/api/v1/pokemon          # v1 endpoints
/api/v2/pokemon          # Future v2 endpoints
/api/version             # Version information
/docs/                   # Documentation (always current)
```

### **Version Detection**
Clients can detect available versions via:
```bash
curl http://localhost:5000/api/version
```

Response:
```json
{
  "current_version": "v1",
  "api_version": "1.0.0",
  "supported_versions": ["v1"],
  "deprecated_versions": [],
  "endpoints": {
    "v1": {
      "pokemon": "/api/v1/pokemon",
      "users": "/api/v1/users",
      "docs": "/docs/"
    }
  }
}
```

## Migration Strategy

### **For New Clients**
- Always use the latest version
- Check `/api/version` for current version
- Use versioned URLs from the start

### **For Existing Clients**
- Continue using v1 until ready to migrate
- Monitor deprecation notices
- Plan migration to v2 when available

### **Deprecation Process**
1. **Announcement** - 6 months notice
2. **Deprecation** - Mark as deprecated in responses
3. **Sunset** - Remove after grace period

## Testing Versioned APIs

### **Test All Versions**
```bash
# Test v1
curl http://localhost:5000/api/v1/pokemon

# Test version info
curl http://localhost:5000/api/version

# Test health check
curl http://localhost:5000/
```

### **Version-Specific Testing**
- Test each version independently
- Verify backward compatibility
- Test migration scenarios

## Best Practices

### **1. Consistent Versioning**
- All endpoints use same version prefix
- Version info available at `/api/version`
- Clear version in documentation

### **2. Backward Compatibility**
- Don't break existing functionality
- Add new fields, don't remove old ones
- Use deprecation warnings

### **3. Clear Documentation**
- Document each version separately
- Show migration guides
- Provide examples for each version

### **4. Client Support**
- Provide SDKs for each version
- Clear upgrade instructions
- Support multiple versions simultaneously

## Monitoring and Metrics

### **Version Usage Tracking**
- Track which versions clients use
- Monitor deprecation adoption
- Measure migration success

### **Performance Monitoring**
- Compare performance across versions
- Identify version-specific issues
- Optimize based on usage patterns

## Conclusion

API versioning is essential for:
- **Production APIs** - Maintain backward compatibility
- **Learning** - Understand API evolution
- **Future Growth** - Plan for feature additions
- **Client Support** - Provide upgrade paths

Our current v1 implementation provides a solid foundation for future API evolution while maintaining backward compatibility and clear upgrade paths.
