# Port Management Guide
**Date:** 2025-09-11  
**Purpose:** Guide for managing ports and processes in development

## Overview
This guide covers how to identify, manage, and free up ports when processes are using them during development.

## **🔍 Method 1: Find and Kill the Process (Recommended)**

### **Step 1: Find what's using the port**
```bash
# Find process using port 5001
lsof -i :5001

# Alternative method
netstat -tulpn | grep :5001
```

### **Step 2: Kill the process**
```bash
# If you see a PID (Process ID) from the above command
kill <PID>

# Force kill if needed
kill -9 <PID>

# Example:
# lsof -i :5001
# kill 83581
```

## **🔍 Method 2: One-liner to kill by port**
```bash
# Kill any process using port 5001
lsof -ti:5001 | xargs kill

# Force kill version
lsof -ti:5001 | xargs kill -9
```

## **🔍 Method 3: Using pkill (if you know the process name)**
```bash
# Kill all processes with "test_app" in the name
pkill -f test_app

# Force kill
pkill -9 -f test_app
```

## **🔍 Method 4: Check background jobs**
```bash
# See background jobs
jobs

# Kill a specific job (the [1] number from jobs output)
kill %1

# Or bring it to foreground and then Ctrl+C
fg %1
# Then press Ctrl+C
```

## **🔍 Method 5: Using ps and grep**
```bash
# Find the process
ps aux | grep test_app

# Kill by PID
kill <PID>
```

## **🔍 Common Development Scenarios**

### **Flask Development Server**
```bash
# Find Flask processes
lsof -i :5000
lsof -i :5001

# Kill Flask processes
lsof -ti:5000 | xargs kill
lsof -ti:5001 | xargs kill
```

### **Database Ports**
```bash
# PostgreSQL
lsof -i :5432

# MySQL
lsof -i :3306

# SQLite (no port, but you can find processes)
ps aux | grep sqlite
```

### **React Development Server**
```bash
# React dev server
lsof -i :3000

# Kill React processes
lsof -ti:3000 | xargs kill
```

## **🔍 Verify the port is free**
```bash
# Check if port 5001 is free
lsof -i :5001

# Should return nothing if port is free
```

## **💡 Pro Tips**

1. **Always try `kill` first** before `kill -9` (force kill)
2. **Use `lsof -i :PORT`** to quickly find what's using a port
3. **Check `jobs`** for background processes you started
4. **Use `ps aux | grep`** to find processes by name
5. **`kill -9`** is a "nuclear option" - use sparingly as it doesn't allow graceful shutdown
6. **Use `jobs`** to see background processes you started in the current terminal
7. **Use `fg`** to bring background jobs to foreground before killing them

## **🔍 Quick Reference Commands**
```bash
# Find process using port
lsof -i :5001

# Kill by port (one-liner)
lsof -ti:5001 | xargs kill

# Check if port is free
lsof -i :5001

# See background jobs
jobs

# Kill background job
kill %1

# Find process by name
ps aux | grep process_name

# Kill by process name
pkill -f process_name
```

## **🔍 Troubleshooting Common Issues**

### **"Address already in use" Error**
```bash
# Find what's using the port
lsof -i :5001

# Kill the process
kill <PID>

# Or use one-liner
lsof -ti:5001 | xargs kill
```

### **Process won't die with regular kill**
```bash
# Use force kill
kill -9 <PID>

# Or force kill by port
lsof -ti:5001 | xargs kill -9
```

### **Background job stuck**
```bash
# See background jobs
jobs

# Kill specific job
kill %1

# Or bring to foreground and Ctrl+C
fg %1
```

### **Multiple processes with same name**
```bash
# Find all processes
ps aux | grep process_name

# Kill specific PID
kill <specific_PID>

# Or kill all matching processes
pkill -f process_name
```

## **🔍 Port Ranges for Common Services**

| Service | Default Port | Command |
|---------|-------------|---------|
| Flask Dev | 5000 | `lsof -i :5000` |
| Flask Test | 5001 | `lsof -i :5001` |
| React Dev | 3000 | `lsof -i :3000` |
| PostgreSQL | 5432 | `lsof -i :5432` |
| MySQL | 3306 | `lsof -i :3306` |
| Redis | 6379 | `lsof -i :6379` |
| MongoDB | 27017 | `lsof -i :27017` |

## **🔍 Safety Notes**

- **Always check what you're killing** before using `kill -9`
- **Use `kill` first** before `kill -9` to allow graceful shutdown
- **Be careful with `pkill`** as it can kill multiple processes
- **Check `jobs`** for background processes you started
- **Use `fg`** to bring background jobs to foreground before killing

## **🔍 Advanced Commands**

### **Kill multiple processes by port range**
```bash
# Kill processes using ports 5000-5009
for port in {5000..5009}; do lsof -ti:$port | xargs kill; done
```

### **Kill all Python processes**
```bash
# Kill all Python processes (use with caution)
pkill -f python
```

### **Kill processes older than X minutes**
```bash
# Kill processes older than 30 minutes
ps -eo pid,etime,comm | awk '$2 ~ /^[0-9]+:[0-9]+:[0-9]+$/ {print $1}' | xargs kill
```

## **🔍 Monitoring Commands**

### **Watch port usage**
```bash
# Monitor port 5001
watch -n 1 'lsof -i :5001'
```

### **Monitor all listening ports**
```bash
# See all listening ports
netstat -tulpn | grep LISTEN
```

### **Monitor process activity**
```bash
# Monitor specific process
top -p <PID>

# Monitor all processes
top
```

## **🔍 Best Practices**

1. **Always check what's using a port** before killing
2. **Use the least destructive method first** (kill before kill -9)
3. **Keep track of background jobs** you start
4. **Use descriptive process names** when possible
5. **Document port usage** in your project
6. **Use environment variables** for port configuration
7. **Implement graceful shutdown** in your applications

## **🔍 Project-Specific Commands**

### **Pokedex Project**
```bash
# Kill test server
lsof -ti:5001 | xargs kill

# Kill main server
lsof -ti:5000 | xargs kill

# Check background jobs
jobs

# Kill background job
kill %1
```

### **Database Management**
```bash
# Check SQLite processes
ps aux | grep sqlite

# Check PostgreSQL
lsof -i :5432

# Check MySQL
lsof -i :3306
```

## **🔍 Emergency Commands**

### **Nuclear option (use with extreme caution)**
```bash
# Kill all Python processes
pkill -9 python

# Kill all processes using ports 5000-5009
for port in {5000..5009}; do lsof -ti:$port | xargs kill -9; done
```

### **System recovery**
```bash
# Reboot (last resort)
sudo reboot

# Or restart specific services
sudo systemctl restart postgresql
sudo systemctl restart mysql
```

---

**Remember:** Always check what you're killing before using force kill commands. Use `lsof -i :PORT` to identify processes, and try graceful shutdown first.

