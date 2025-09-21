#!/usr/bin/env python3
"""
Simple test script to check if the Pokedex application is running
Tests both local and Docker endpoints
"""

import requests
import json
import sys
from datetime import datetime

def test_endpoint(url, name, timeout=5):
    """Test a single endpoint"""
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code == 200:
            print(f"✅ {name}: OK (200)")
            return True
        else:
            print(f"❌ {name}: Failed ({response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {name}: Error - {e}")
        return False

def test_docker_app():
    """Test the Docker application"""
    print("🐳 Testing Docker Application...")
    print("=" * 50)
    
    base_url = "http://localhost"
    tests = [
        (f"{base_url}/", "Health Check"),
        (f"{base_url}/api/v1/pokemon", "Pokemon List"),
        (f"{base_url}/api/v1/pokemon/types", "Pokemon Types"),
    ]
    
    passed = 0
    total = len(tests)
    
    for url, name in tests:
        if test_endpoint(url, name):
            passed += 1
    
    print("=" * 50)
    print(f"📊 Docker Tests: {passed}/{total} passed")
    return passed == total

def test_local_backend():
    """Test the local backend (if running)"""
    print("\n🖥️  Testing Local Backend...")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    tests = [
        (f"{base_url}/", "Health Check"),
        (f"{base_url}/api/v1/pokemon", "Pokemon List"),
        (f"{base_url}/api/v1/pokemon/types", "Pokemon Types"),
    ]
    
    passed = 0
    total = len(tests)
    
    for url, name in tests:
        if test_endpoint(url, name):
            passed += 1
    
    print("=" * 50)
    print(f"📊 Local Backend Tests: {passed}/{total} passed")
    return passed == total

def main():
    """Main test function"""
    print("🚀 Pokedex Application Test Runner")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Test Docker application first
    docker_success = test_docker_app()
    
    # Test local backend
    local_success = test_local_backend()
    
    print("\n" + "=" * 60)
    print("📋 SUMMARY")
    print("=" * 60)
    
    if docker_success:
        print("✅ Docker Application: RUNNING")
    else:
        print("❌ Docker Application: NOT RUNNING")
    
    if local_success:
        print("✅ Local Backend: RUNNING")
    else:
        print("❌ Local Backend: NOT RUNNING")
    
    if not docker_success and not local_success:
        print("\n💡 TIP: Start the application with:")
        print("   docker-compose up --build")
        print("   or")
        print("   python3 -m backend.app")
        sys.exit(1)
    else:
        print("\n🎉 At least one version of the application is running!")
        sys.exit(0)

if __name__ == "__main__":
    main()
