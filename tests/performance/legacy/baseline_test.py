#!/usr/bin/env python3
"""
Baseline Performance Testing Script for Pokedex API

This script performs basic performance testing on the Pokedex API endpoints
to establish baseline performance metrics with 50 Pokemon.
"""

import requests
import time
import json
import statistics
from typing import List, Dict, Any

class PerformanceTester:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.results = {}
    
    def test_endpoint(self, endpoint: str, params: Dict = None, iterations: int = 10) -> Dict[str, Any]:
        """Test a single endpoint multiple times and collect metrics."""
        print(f"Testing {endpoint}...")
        
        response_times = []
        success_count = 0
        error_count = 0
        
        for i in range(iterations):
            try:
                start_time = time.time()
                response = requests.get(f"{self.base_url}{endpoint}", params=params)
                end_time = time.time()
                
                response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                response_times.append(response_time)
                
                if response.status_code == 200:
                    success_count += 1
                else:
                    error_count += 1
                    print(f"  Error {i+1}: Status {response.status_code}")
                    
            except Exception as e:
                error_count += 1
                print(f"  Exception {i+1}: {str(e)}")
        
        # Calculate statistics
        if response_times:
            avg_time = statistics.mean(response_times)
            min_time = min(response_times)
            max_time = max(response_times)
            median_time = statistics.median(response_times)
            p95_time = self._percentile(response_times, 95)
            p99_time = self._percentile(response_times, 99)
        else:
            avg_time = min_time = max_time = median_time = p95_time = p99_time = 0
        
        success_rate = (success_count / iterations) * 100
        
        result = {
            'endpoint': endpoint,
            'iterations': iterations,
            'success_count': success_count,
            'error_count': error_count,
            'success_rate': success_rate,
            'avg_response_time': avg_time,
            'min_response_time': min_time,
            'max_response_time': max_time,
            'median_response_time': median_time,
            'p95_response_time': p95_time,
            'p99_response_time': p99_time,
            'response_times': response_times
        }
        
        self.results[endpoint] = result
        return result
    
    def _percentile(self, data: List[float], percentile: int) -> float:
        """Calculate the nth percentile of a dataset."""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int((percentile / 100) * len(sorted_data))
        if index >= len(sorted_data):
            index = len(sorted_data) - 1
        return sorted_data[index]
    
    def test_pokemon_listing(self) -> Dict[str, Any]:
        """Test Pokemon listing endpoint."""
        return self.test_endpoint("/api/v1/pokemon", iterations=10)
    
    def test_pokemon_details(self) -> Dict[str, Any]:
        """Test individual Pokemon details endpoint."""
        return self.test_endpoint("/api/v1/pokemon/1", iterations=10)
    
    def test_pokemon_filtering(self) -> Dict[str, Any]:
        """Test Pokemon filtering by type."""
        return self.test_endpoint("/api/v1/pokemon", params={"type": "fire"}, iterations=10)
    
    def test_pokemon_search(self) -> Dict[str, Any]:
        """Test Pokemon search functionality."""
        return self.test_endpoint("/api/v1/pokemon", params={"search": "char"}, iterations=10)
    
    def test_pagination(self) -> Dict[str, Any]:
        """Test pagination functionality."""
        return self.test_endpoint("/api/v1/pokemon", params={"per_page": 10, "page": 1}, iterations=10)
    
    def test_health_endpoint(self) -> Dict[str, Any]:
        """Test health check endpoint."""
        return self.test_endpoint("/", iterations=5)
    
    def run_all_tests(self):
        """Run all baseline performance tests."""
        print("🚀 Starting Baseline Performance Testing")
        print("=" * 50)
        
        # Test all endpoints
        self.test_health_endpoint()
        self.test_pokemon_listing()
        self.test_pokemon_details()
        self.test_pokemon_filtering()
        self.test_pokemon_search()
        self.test_pagination()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print a summary of all test results."""
        print("\n📊 Performance Test Summary")
        print("=" * 50)
        
        for endpoint, result in self.results.items():
            print(f"\n{endpoint}:")
            print(f"  Success Rate: {result['success_rate']:.1f}%")
            print(f"  Avg Response Time: {result['avg_response_time']:.2f}ms")
            print(f"  Median Response Time: {result['median_response_time']:.2f}ms")
            print(f"  95th Percentile: {result['p95_response_time']:.2f}ms")
            print(f"  Min/Max: {result['min_response_time']:.2f}ms / {result['max_response_time']:.2f}ms")
        
        # Overall statistics
        all_avg_times = [r['avg_response_time'] for r in self.results.values() if r['avg_response_time'] > 0]
        if all_avg_times:
            overall_avg = statistics.mean(all_avg_times)
            print(f"\n🎯 Overall Average Response Time: {overall_avg:.2f}ms")
            
            # Performance assessment
            if overall_avg < 200:
                print("✅ Performance: EXCELLENT (< 200ms)")
            elif overall_avg < 500:
                print("⚠️  Performance: GOOD (200-500ms)")
            elif overall_avg < 1000:
                print("⚠️  Performance: ACCEPTABLE (500-1000ms)")
            else:
                print("❌ Performance: NEEDS IMPROVEMENT (> 1000ms)")
    
    def save_results(self, filename: str = "baseline_test_results.json"):
        """Save test results to JSON file."""
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\n💾 Results saved to {filename}")

def main():
    """Main function to run baseline performance tests."""
    print("Pokedex API Baseline Performance Testing")
    print("========================================")
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:5000/", timeout=5)
        if response.status_code != 200:
            print("❌ Server is not responding properly")
            return
    except requests.exceptions.RequestException:
        print("❌ Server is not running. Please start the server first.")
        print("   Command: export DATABASE_URL='sqlite:///$(pwd)/backend/instance/pokedex_dev.db' && python3 -m backend.app")
        return
    
    # Run tests
    tester = PerformanceTester()
    tester.run_all_tests()
    tester.save_results()

if __name__ == "__main__":
    main()
