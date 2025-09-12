#!/bin/bash

# Performance Testing Execution Script
# This script runs comprehensive performance tests on the Pokedex API

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:5000"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create results directory
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}🚀 Pokedex API Performance Testing Suite${NC}"
echo "=============================================="
echo "Timestamp: $(date)"
echo "Results Directory: $RESULTS_DIR"
echo ""

# Function to check if server is running
check_server() {
    echo -e "${YELLOW}🔍 Checking if server is running...${NC}"
    if curl -s "$BASE_URL/" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running at $BASE_URL${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
        echo "Please start the server first:"
        echo "  export DATABASE_URL='sqlite:///\$(pwd)/instance/pokedex_dev.db' && python3 -m backend.app"
        return 1
    fi
}

# Function to run baseline tests
run_baseline_tests() {
    echo -e "\n${BLUE}📊 Running Baseline Performance Tests${NC}"
    echo "====================================="
    
    python3 "$SCRIPT_DIR/baseline_test.py" > "$RESULTS_DIR/baseline_${TIMESTAMP}.log" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Baseline tests completed successfully${NC}"
        echo "Results saved to: $RESULTS_DIR/baseline_${TIMESTAMP}.log"
    else
        echo -e "${RED}❌ Baseline tests failed${NC}"
        echo "Check the log file for details: $RESULTS_DIR/baseline_${TIMESTAMP}.log"
    fi
}

# Function to run load tests
run_load_tests() {
    echo -e "\n${BLUE}⚡ Running Load Tests${NC}"
    echo "====================="
    
    # Light load test
    echo -e "\n${YELLOW}🟢 Light Load Test (10 users, 100 requests)${NC}"
    python3 "$SCRIPT_DIR/load_test.py" --test-type light > "$RESULTS_DIR/load_light_${TIMESTAMP}.log" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Light load test completed${NC}"
    else
        echo -e "${RED}❌ Light load test failed${NC}"
    fi
    
    # Medium load test
    echo -e "\n${YELLOW}🟡 Medium Load Test (50 users, 500 requests)${NC}"
    python3 "$SCRIPT_DIR/load_test.py" --test-type medium > "$RESULTS_DIR/load_medium_${TIMESTAMP}.log" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Medium load test completed${NC}"
    else
        echo -e "${RED}❌ Medium load test failed${NC}"
    fi
    
    # Heavy load test
    echo -e "\n${YELLOW}🔴 Heavy Load Test (100 users, 1000 requests)${NC}"
    python3 "$SCRIPT_DIR/load_test.py" --test-type heavy > "$RESULTS_DIR/load_heavy_${TIMESTAMP}.log" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Heavy load test completed${NC}"
    else
        echo -e "${RED}❌ Heavy load test failed${NC}"
    fi
}

# Function to run sustained load test
run_sustained_test() {
    echo -e "\n${BLUE}⏱️  Running Sustained Load Test${NC}"
    echo "==============================="
    
    # 5-minute sustained test
    echo -e "\n${YELLOW}🔄 Sustained Load Test (25 users, 5 minutes)${NC}"
    python3 "$SCRIPT_DIR/load_test.py" --test-type sustained --duration 5 > "$RESULTS_DIR/sustained_${TIMESTAMP}.log" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Sustained load test completed${NC}"
    else
        echo -e "${RED}❌ Sustained load test failed${NC}"
    fi
}

# Function to run endpoint-specific tests
run_endpoint_tests() {
    echo -e "\n${BLUE}🎯 Running Endpoint-Specific Tests${NC}"
    echo "==================================="
    
    # Test different endpoints
    endpoints=(
        "/api/v1/pokemon"
        "/api/v1/pokemon?type=fire"
        "/api/v1/pokemon?search=char"
        "/api/v1/pokemon?per_page=10&page=1"
        "/api/v1/pokemon/1"
    )
    
    for endpoint in "${endpoints[@]}"; do
        echo -e "\n${YELLOW}Testing endpoint: $endpoint${NC}"
        python3 "$SCRIPT_DIR/load_test.py" --endpoint "$endpoint" --users 10 --requests 50 > "$RESULTS_DIR/endpoint_$(echo $endpoint | tr '/' '_' | tr '?' '_')_${TIMESTAMP}.log" 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Endpoint test completed${NC}"
        else
            echo -e "${RED}❌ Endpoint test failed${NC}"
        fi
    done
}

# Function to generate summary report
generate_summary() {
    echo -e "\n${BLUE}📋 Generating Performance Test Summary${NC}"
    echo "======================================="
    
    SUMMARY_FILE="$RESULTS_DIR/performance_summary_${TIMESTAMP}.md"
    
    cat > "$SUMMARY_FILE" << EOF
# Performance Test Summary

**Date**: $(date)  
**Test Suite**: Pokedex API Performance Testing  
**Results Directory**: $RESULTS_DIR  

## Test Results Overview

### Baseline Tests
- **Status**: $(if [ -f "$RESULTS_DIR/baseline_${TIMESTAMP}.log" ]; then echo "✅ Completed"; else echo "❌ Failed"; fi)
- **Log File**: baseline_${TIMESTAMP}.log

### Load Tests
- **Light Load (10 users, 100 requests)**: $(if [ -f "$RESULTS_DIR/load_light_${TIMESTAMP}.log" ]; then echo "✅ Completed"; else echo "❌ Failed"; fi)
- **Medium Load (50 users, 500 requests)**: $(if [ -f "$RESULTS_DIR/load_medium_${TIMESTAMP}.log" ]; then echo "✅ Completed"; else echo "❌ Failed"; fi)
- **Heavy Load (100 users, 1000 requests)**: $(if [ -f "$RESULTS_DIR/load_heavy_${TIMESTAMP}.log" ]; then echo "✅ Completed"; else echo "❌ Failed"; fi)

### Sustained Tests
- **5-Minute Sustained Load**: $(if [ -f "$RESULTS_DIR/sustained_${TIMESTAMP}.log" ]; then echo "✅ Completed"; else echo "❌ Failed"; fi)

### Endpoint Tests
- **Multiple Endpoint Testing**: $(if ls "$RESULTS_DIR"/endpoint_*_${TIMESTAMP}.log 1> /dev/null 2>&1; then echo "✅ Completed"; else echo "❌ Failed"; fi)

## Next Steps

1. Review individual test logs for detailed results
2. Analyze performance metrics and identify bottlenecks
3. Implement optimizations based on findings
4. Re-run tests to validate improvements

## Files Generated

$(ls -la "$RESULTS_DIR"/*_${TIMESTAMP}.* 2>/dev/null || echo "No files generated")

---
*Generated by Pokedex API Performance Testing Suite*
EOF

    echo -e "${GREEN}✅ Summary report generated: $SUMMARY_FILE${NC}"
}

# Function to display help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --baseline-only    Run only baseline tests"
    echo "  --load-only        Run only load tests"
    echo "  --sustained-only   Run only sustained load test"
    echo "  --endpoints-only   Run only endpoint-specific tests"
    echo "  --all              Run all tests (default)"
    echo "  --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 --baseline-only    # Run only baseline tests"
    echo "  $0 --load-only        # Run only load tests"
}

# Main execution
main() {
    # Parse command line arguments
    case "${1:-all}" in
        --baseline-only)
            TEST_TYPE="baseline"
            ;;
        --load-only)
            TEST_TYPE="load"
            ;;
        --sustained-only)
            TEST_TYPE="sustained"
            ;;
        --endpoints-only)
            TEST_TYPE="endpoints"
            ;;
        --all|all)
            TEST_TYPE="all"
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
    
    # Check if server is running
    if ! check_server; then
        exit 1
    fi
    
    # Run tests based on type
    case "$TEST_TYPE" in
        baseline)
            run_baseline_tests
            ;;
        load)
            run_load_tests
            ;;
        sustained)
            run_sustained_test
            ;;
        endpoints)
            run_endpoint_tests
            ;;
        all)
            run_baseline_tests
            run_load_tests
            run_sustained_test
            run_endpoint_tests
            ;;
    esac
    
    # Generate summary
    generate_summary
    
    echo -e "\n${GREEN}🎉 Performance testing completed!${NC}"
    echo "Check the results directory for detailed logs: $RESULTS_DIR"
}

# Run main function with all arguments
main "$@"