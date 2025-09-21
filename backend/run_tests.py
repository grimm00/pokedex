#!/usr/bin/env python3
"""
Test runner script for backend API tests
"""
import subprocess
import sys
import os


def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {command}")
    print(f"{'='*60}")
    
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ SUCCESS")
        if result.stdout:
            print(result.stdout)
    else:
        print("❌ FAILED")
        if result.stderr:
            print("STDERR:", result.stderr)
        if result.stdout:
            print("STDOUT:", result.stdout)
        return False
    
    return True


def main():
    """Main test runner"""
    print("🧪 Backend API Test Runner")
    print("=" * 60)
    
    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Install test dependencies
    if not run_command("pip install -r requirements-test.txt", "Installing test dependencies"):
        print("Failed to install dependencies")
        sys.exit(1)
    
    # Run different test suites
    test_commands = [
        ("pytest tests/api/ -v", "API Tests"),
        ("pytest tests/integration/ -v", "Integration Tests"),
        ("pytest tests/performance/ -v", "Performance Tests"),
        ("pytest tests/ -v --cov=backend --cov-report=term-missing", "All Tests with Coverage"),
    ]
    
    all_passed = True
    
    for command, description in test_commands:
        if not run_command(command, description):
            all_passed = False
    
    # Summary
    print(f"\n{'='*60}")
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("Backend API is working correctly")
    else:
        print("❌ SOME TESTS FAILED!")
        print("Please check the output above for details")
        sys.exit(1)
    print(f"{'='*60}")


if __name__ == "__main__":
    main()

