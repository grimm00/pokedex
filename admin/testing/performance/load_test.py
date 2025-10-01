#!/usr/bin/env python3
"""
Load Testing Script for Pokedex API

This script performs load testing on the Pokedex API to measure
performance under various load conditions.
"""

import requests
import time
import threading
import statistics
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any
import argparse

class LoadTester:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.results = []
        self.lock = threading.Lock()
    
    def single_request(self, endpoint: str, params: Dict = None) -> Dict[str, Any]:
        """Make a single request and measure performance."""
        start_time = time.time()
        try:
            response = requests.get(f"{self.base_url}{endpoint}", params=params, timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            result = {
                'endpoint': endpoint,
                'status_code': response.status_code,
                'response_time': response_time,
                'success': response.status_code == 200,
                'timestamp': start_time,
                'error': None
            }
            
        except Exception as e:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            
            result = {
                'endpoint': endpoint,
                'status_code': 0,
                'response_time': response_time,
                'success': False,
                'timestamp': start_time,
                'error': str(e)
            }
        
        with self.lock:
            self.results.append(result)
        
        return result
    
    def run_load_test(self, endpoint: str, concurrent_users: int, total_requests: int, 
                     params: Dict = None, delay: float = 0) -> Dict[str, Any]:
        """Run a load test with specified parameters."""
        print(f"🚀 Starting load test: {concurrent_users} users, {total_requests} requests")
        print(f"   Endpoint: {endpoint}")
        if params:
            print(f"   Params: {params}")
        
        self.results = []
        start_time = time.time()
        
        # Calculate requests per user
        requests_per_user = total_requests // concurrent_users
        remaining_requests = total_requests % concurrent_users
        
        with ThreadPoolExecutor(max_workers=concurrent_users) as executor:
            futures = []
            
            # Submit requests for each user
            for user_id in range(concurrent_users):
                user_requests = requests_per_user
                if user_id < remaining_requests:
                    user_requests += 1
                
                for _ in range(user_requests):
                    if delay > 0:
                        time.sleep(delay)
                    future = executor.submit(self.single_request, endpoint, params)
                    futures.append(future)
            
            # Wait for all requests to complete
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    print(f"Request failed: {e}")
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # Calculate statistics
        successful_requests = [r for r in self.results if r['success']]
        failed_requests = [r for r in self.results if not r['success']]
        
        if successful_requests:
            response_times = [r['response_time'] for r in successful_requests]
            avg_response_time = statistics.mean(response_times)
            min_response_time = min(response_times)
            max_response_time = max(response_times)
            median_response_time = statistics.median(response_times)
            p95_response_time = self._percentile(response_times, 95)
            p99_response_time = self._percentile(response_times, 99)
        else:
            avg_response_time = min_response_time = max_response_time = 0
            median_response_time = p95_response_time = p99_response_time = 0
        
        success_rate = (len(successful_requests) / len(self.results)) * 100
        requests_per_second = len(self.results) / total_duration
        
        summary = {
            'endpoint': endpoint,
            'concurrent_users': concurrent_users,
            'total_requests': total_requests,
            'successful_requests': len(successful_requests),
            'failed_requests': len(failed_requests),
            'success_rate': success_rate,
            'total_duration': total_duration,
            'requests_per_second': requests_per_second,
            'avg_response_time': avg_response_time,
            'min_response_time': min_response_time,
            'max_response_time': max_response_time,
            'median_response_time': median_response_time,
            'p95_response_time': p95_response_time,
            'p99_response_time': p99_response_time,
            'params': params
        }
        
        return summary
    
    def _percentile(self, data: List[float], percentile: int) -> float:
        """Calculate the nth percentile of a dataset."""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int((percentile / 100) * len(sorted_data))
        if index >= len(sorted_data):
            index = len(sorted_data) - 1
        return sorted_data[index]
    
    def run_light_load_test(self, endpoint: str = "/api/v1/pokemon") -> Dict[str, Any]:
        """Run light load test (10 users, 100 requests)."""
        print("\n🟢 Light Load Test (10 users, 100 requests)")
        return self.run_load_test(endpoint, 10, 100)
    
    def run_medium_load_test(self, endpoint: str = "/api/v1/pokemon") -> Dict[str, Any]:
        """Run medium load test (50 users, 500 requests)."""
        print("\n🟡 Medium Load Test (50 users, 500 requests)")
        return self.run_load_test(endpoint, 50, 500)
    
    def run_heavy_load_test(self, endpoint: str = "/api/v1/pokemon") -> Dict[str, Any]:
        """Run heavy load test (100 users, 1000 requests)."""
        print("\n🔴 Heavy Load Test (100 users, 1000 requests)")
        return self.run_load_test(endpoint, 100, 1000)
    
    def run_sustained_load_test(self, endpoint: str = "/api/v1/pokemon", 
                               duration_minutes: int = 5) -> Dict[str, Any]:
        """Run sustained load test (25 users for specified duration)."""
        print(f"\n⏱️  Sustained Load Test (25 users, {duration_minutes} minutes)")
        
        # Calculate requests for duration (10 requests per second)
        requests_per_second = 10
        total_requests = duration_minutes * 60 * requests_per_second
        delay = 1.0 / requests_per_second  # Delay between requests
        
        return self.run_load_test(endpoint, 25, total_requests, delay=delay)
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print a summary of load test results."""
        print(f"\n📊 Load Test Results for {summary['endpoint']}")
        print("=" * 60)
        print(f"Concurrent Users: {summary['concurrent_users']}")
        print(f"Total Requests: {summary['total_requests']}")
        print(f"Successful Requests: {summary['successful_requests']}")
        print(f"Failed Requests: {summary['failed_requests']}")
        print(f"Success Rate: {summary['success_rate']:.2f}%")
        print(f"Total Duration: {summary['total_duration']:.2f}s")
        print(f"Requests Per Second: {summary['requests_per_second']:.2f}")
        print(f"\nResponse Time Statistics:")
        print(f"  Average: {summary['avg_response_time']:.2f}ms")
        print(f"  Median: {summary['median_response_time']:.2f}ms")
        print(f"  Min: {summary['min_response_time']:.2f}ms")
        print(f"  Max: {summary['max_response_time']:.2f}ms")
        print(f"  95th Percentile: {summary['p95_response_time']:.2f}ms")
        print(f"  99th Percentile: {summary['p99_response_time']:.2f}ms")
        
        # Performance assessment
        if summary['success_rate'] >= 99 and summary['avg_response_time'] < 200:
            print("\n✅ Performance: EXCELLENT")
        elif summary['success_rate'] >= 95 and summary['avg_response_time'] < 500:
            print("\n⚠️  Performance: GOOD")
        elif summary['success_rate'] >= 90 and summary['avg_response_time'] < 1000:
            print("\n⚠️  Performance: ACCEPTABLE")
        else:
            print("\n❌ Performance: NEEDS IMPROVEMENT")
    
    def save_results(self, filename: str = "load_test_results.json"):
        """Save test results to JSON file."""
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)
        print(f"\n💾 Detailed results saved to {filename}")

def main():
    """Main function to run load tests."""
    parser = argparse.ArgumentParser(description='Pokedex API Load Testing')
    parser.add_argument('--endpoint', default='/api/v1/pokemon', help='API endpoint to test')
    parser.add_argument('--users', type=int, default=10, help='Number of concurrent users')
    parser.add_argument('--requests', type=int, default=100, help='Total number of requests')
    parser.add_argument('--type', default='fire', help='Pokemon type for filtering tests')
    parser.add_argument('--search', default='char', help='Search term for search tests')
    parser.add_argument('--test-type', choices=['light', 'medium', 'heavy', 'sustained', 'custom'], 
                       default='light', help='Type of load test to run')
    parser.add_argument('--duration', type=int, default=5, help='Duration in minutes for sustained test')
    
    args = parser.parse_args()
    
    print("Pokedex API Load Testing")
    print("=======================")
    
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
    tester = LoadTester()
    
    if args.test_type == 'light':
        summary = tester.run_light_load_test(args.endpoint)
    elif args.test_type == 'medium':
        summary = tester.run_medium_load_test(args.endpoint)
    elif args.test_type == 'heavy':
        summary = tester.run_heavy_load_test(args.endpoint)
    elif args.test_type == 'sustained':
        summary = tester.run_sustained_load_test(args.endpoint, args.duration)
    else:  # custom
        summary = tester.run_load_test(args.endpoint, args.users, args.requests)
    
    tester.print_summary(summary)
    tester.save_results()

if __name__ == "__main__":
    main()
