#!/usr/bin/env python3
"""
Search and Filtering Functionality Tests
Tests the search and filtering API endpoints for the Pokedex application
"""

import requests
import json
import time
from datetime import datetime

def test_endpoint(url, name, expected_min_results=0, expected_max_results=None, is_types_endpoint=False):
    """Test a single endpoint and return results"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Handle different response formats
            if is_types_endpoint:
                result_count = len(data) if isinstance(data, list) else 0
            else:
                result_count = len(data.get('pokemon', []))
            
            print(f"✅ {name}: {result_count} results")
            
            # Check if result count is within expected range
            if expected_min_results is not None and result_count < expected_min_results:
                print(f"   ⚠️  Warning: Expected at least {expected_min_results} results, got {result_count}")
                return False, result_count, data
                
            if expected_max_results is not None and result_count > expected_max_results:
                print(f"   ⚠️  Warning: Expected at most {expected_max_results} results, got {result_count}")
                return False, result_count, data
                
            return True, result_count, data
        else:
            print(f"❌ {name}: HTTP {response.status_code}")
            return False, 0, None
    except requests.exceptions.RequestException as e:
        print(f"❌ {name}: Error - {e}")
        return False, 0, None

def test_search_by_name():
    """Test search by Pokemon name"""
    print("\n🔍 Testing Search by Name...")
    print("=" * 50)
    
    test_cases = [
        ("char", "Search for 'char'", 1, 5),  # Should find Charmander, Charizard, etc.
        ("pika", "Search for 'pika'", 1, 3),  # Should find Pikachu, Pichu, etc.
        ("saur", "Search for 'saur'", 1, 3),  # Should find Bulbasaur, Ivysaur, etc.
        ("xyz", "Search for 'xyz'", 0, 0),    # Should find nothing
        ("", "Empty search", 0, 50),          # Should return all Pokemon
    ]
    
    results = []
    for search_term, description, min_results, max_results in test_cases:
        url = f"http://localhost/api/v1/pokemon?search={search_term}"
        success, count, data = test_endpoint(url, description, min_results, max_results)
        results.append((search_term, success, count))
        
        if success and data:
            # Show first few results
            pokemon_names = [p.get('name', 'Unknown') for p in data.get('pokemon', [])[:3]]
            print(f"   Found: {', '.join(pokemon_names)}")
    
    return results

def test_filter_by_type():
    """Test filtering by Pokemon type"""
    print("\n🏷️  Testing Filter by Type...")
    print("=" * 50)
    
    # First get available types
    types_url = "http://localhost/api/v1/pokemon/types"
    success, _, types_data = test_endpoint(types_url, "Get available types", is_types_endpoint=True)
    
    if not success or not types_data:
        print("❌ Could not get available types")
        return []
    
    available_types = types_data
    print(f"   Available types: {', '.join(available_types)}")
    
    test_cases = [
        ("fire", "Fire type", 1, 10),
        ("water", "Water type", 1, 10),
        ("grass", "Grass type", 0, 10),  # We don't have grass types in our data
        ("electric", "Electric type", 1, 5),
        ("dragon", "Dragon type", 0, 5),
    ]
    
    results = []
    for type_name, description, min_results, max_results in test_cases:
        url = f"http://localhost/api/v1/pokemon?type={type_name}"
        success, count, data = test_endpoint(url, description, min_results, max_results)
        results.append((type_name, success, count))
        
        if success and data:
            # Show first few results
            pokemon_names = [p.get('name', 'Unknown') for p in data.get('pokemon', [])[:3]]
            print(f"   Found: {', '.join(pokemon_names)}")
    
    return results

def test_combined_search():
    """Test combined search and filtering"""
    print("\n🔍🏷️  Testing Combined Search and Filter...")
    print("=" * 50)
    
    test_cases = [
        ("char", "fire", "Charmander search + Fire filter", 1, 3),
        ("pika", "electric", "Pikachu search + Electric filter", 1, 2),
        ("saur", "grass", "Saur search + Grass filter", 0, 3),  # We don't have grass types
        ("char", "water", "Charmander search + Water filter", 0, 0),  # Should find nothing
        ("xyz", "fire", "Non-existent search + Fire filter", 0, 0),   # Should find nothing
    ]
    
    results = []
    for search_term, type_filter, description, min_results, max_results in test_cases:
        url = f"http://localhost/api/v1/pokemon?search={search_term}&type={type_filter}"
        success, count, data = test_endpoint(url, description, min_results, max_results)
        results.append((f"{search_term}+{type_filter}", success, count))
        
        if success and data:
            # Show results
            pokemon_names = [p.get('name', 'Unknown') for p in data.get('pokemon', [])]
            print(f"   Found: {', '.join(pokemon_names)}")
    
    return results

def test_pagination():
    """Test pagination with search and filtering"""
    print("\n📄 Testing Pagination with Search...")
    print("=" * 50)
    
    # Test pagination with search
    url = "http://localhost/api/v1/pokemon?search=char&page=1&per_page=2"
    success, count, data = test_endpoint(url, "Search with pagination", 1, 2)
    
    if success and data:
        pagination = data.get('pagination', {})
        print(f"   Page: {pagination.get('page', 'N/A')}")
        print(f"   Per page: {pagination.get('per_page', 'N/A')}")
        print(f"   Total: {pagination.get('total', 'N/A')}")
        print(f"   Has next: {pagination.get('has_next', 'N/A')}")
        print(f"   Has prev: {pagination.get('has_prev', 'N/A')}")
    
    return success

def test_performance():
    """Test search performance"""
    print("\n⚡ Testing Search Performance...")
    print("=" * 50)
    
    test_queries = [
        "char",
        "pika", 
        "fire",
        "water",
        "char+fire"
    ]
    
    results = []
    for query in test_queries:
        if '+' in query:
            search_term, type_filter = query.split('+')
            url = f"http://localhost/api/v1/pokemon?search={search_term}&type={type_filter}"
        elif query in ['fire', 'water', 'grass', 'electric']:
            url = f"http://localhost/api/v1/pokemon?type={query}"
        else:
            url = f"http://localhost/api/v1/pokemon?search={query}"
        
        start_time = time.time()
        try:
            response = requests.get(url, timeout=10)
            end_time = time.time()
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                data = response.json()
                result_count = len(data.get('pokemon', []))
                print(f"✅ {query}: {result_count} results in {response_time:.2f}ms")
                results.append((query, True, response_time, result_count))
            else:
                print(f"❌ {query}: HTTP {response.status_code} in {response_time:.2f}ms")
                results.append((query, False, response_time, 0))
        except requests.exceptions.RequestException as e:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            print(f"❌ {query}: Error in {response_time:.2f}ms - {e}")
            results.append((query, False, response_time, 0))
    
    return results

def main():
    """Main test function"""
    print("🚀 Pokedex Search and Filtering Test Suite")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Test search by name
    name_results = test_search_by_name()
    
    # Test filter by type
    type_results = test_filter_by_type()
    
    # Test combined search
    combined_results = test_combined_search()
    
    # Test pagination
    pagination_success = test_pagination()
    
    # Test performance
    performance_results = test_performance()
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    
    # Name search results
    name_success = sum(1 for _, success, _ in name_results if success)
    name_total = len(name_results)
    print(f"🔍 Name Search: {name_success}/{name_total} tests passed")
    
    # Type filter results
    type_success = sum(1 for _, success, _ in type_results if success)
    type_total = len(type_results)
    print(f"🏷️  Type Filter: {type_success}/{type_total} tests passed")
    
    # Combined search results
    combined_success = sum(1 for _, success, _ in combined_results if success)
    combined_total = len(combined_results)
    print(f"🔍🏷️  Combined Search: {combined_success}/{combined_total} tests passed")
    
    # Pagination results
    print(f"📄 Pagination: {'✅ PASSED' if pagination_success else '❌ FAILED'}")
    
    # Performance results
    perf_success = sum(1 for _, success, _, _ in performance_results if success)
    perf_total = len(performance_results)
    avg_response_time = sum(response_time for _, success, response_time, _ in performance_results if success) / max(perf_success, 1)
    print(f"⚡ Performance: {perf_success}/{perf_total} tests passed (avg: {avg_response_time:.2f}ms)")
    
    # Overall results
    total_tests = name_total + type_total + combined_total + 1 + perf_total
    total_passed = name_success + type_success + combined_success + (1 if pagination_success else 0) + perf_success
    
    print(f"\n🎯 Overall: {total_passed}/{total_tests} tests passed")
    
    if total_passed == total_tests:
        print("🎉 All search and filtering tests PASSED!")
        return True
    else:
        print("❌ Some tests FAILED!")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
