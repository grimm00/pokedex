# Docker Compose Troubleshooting Guide

## 🚨 **Common Issue: "Stuck on Attaching"**

### **Problem**
When running `docker-compose up`, the command appears to get stuck on:
```
Attaching to pokedex-app-1, redis-1
```

### **Root Cause**
This happens because `docker-compose up` runs in **foreground mode** and continuously displays logs, making it appear "stuck" when it's actually working normally.

## ✅ **Solutions**

### **1. Use Detached Mode (Recommended)**
```bash
# Start containers in background
docker-compose up -d

# Check status
docker-compose ps

# View logs when needed
docker-compose logs -f
```

### **2. If Already Running in Foreground**
- Press `Ctrl+C` to stop and return to terminal
- Then run `docker-compose up -d` for background mode

### **3. Check Container Status**
```bash
# See all containers (running and stopped)
docker ps -a

# See only running containers
docker ps

# Check specific service status
docker-compose ps
```

## 🛠️ **Troubleshooting Commands**

### **Container Management**
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart pokedex-app-1

# Restart all services
docker-compose restart
```

### **Logs and Debugging**
```bash
# View logs for all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f pokedex-app-1

# View last 50 lines
docker-compose logs --tail 50
```

### **Health Checks**
```bash
# Check if API is responding
curl http://localhost/api/v1/pokemon

# Check if frontend is accessible
curl http://localhost/

# Test search functionality
curl "http://localhost/api/v1/pokemon?search=char"
```

## 🔧 **Common Issues and Fixes**

### **Issue: Containers Exit Immediately**
```bash
# Check logs for errors
docker-compose logs

# Rebuild containers
docker-compose up -d --build --force-recreate
```

### **Issue: Port Already in Use**
```bash
# Check what's using port 80
lsof -i :80

# Stop conflicting services
sudo systemctl stop nginx  # if nginx is running
```

### **Issue: Permission Denied**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Rebuild with proper permissions
docker-compose up -d --build
```

## 📋 **Quick Reference**

### **Daily Commands**
```bash
# Start application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop application
docker-compose down
```

### **Development Commands**
```bash
# Rebuild and start
docker-compose up -d --build

# Force recreate
docker-compose up -d --force-recreate

# Clean up
docker-compose down -v  # removes volumes too
```

### **Debugging Commands**
```bash
# Enter container shell
docker-compose exec pokedex-app-1 bash

# Check container resources
docker stats

# Inspect container
docker inspect pokedex-pokedex-app-1
```

## 🎯 **Best Practices**

1. **Always use `-d` flag** for background operation
2. **Check logs** when troubleshooting: `docker-compose logs -f`
3. **Verify health** with API calls: `curl http://localhost/api/v1/pokemon`
4. **Use `docker-compose ps`** to check container status
5. **Clean up regularly**: `docker system prune -f`

---

**Remember**: `docker-compose up` without `-d` is for debugging only. Use `docker-compose up -d` for normal operation!
