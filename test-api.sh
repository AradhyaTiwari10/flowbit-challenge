#!/bin/bash

# Simple API Testing Script
# This script tests the basic API endpoints

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_BASE="http://localhost:3000/api"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="admin123"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if API is running
check_api() {
    print_status "Checking if API is running..."
    
    if curl -s "$API_BASE/health" > /dev/null; then
        print_success "API is running"
        return 0
    else
        print_error "API is not running. Please start the backend server first."
        return 1
    fi
}

# Test health endpoint
test_health() {
    print_status "Testing health endpoint..."
    
    response=$(curl -s "$API_BASE/health")
    if echo "$response" | grep -q "status.*ok"; then
        print_success "Health check passed"
        echo "Response: $response"
    else
        print_error "Health check failed"
        echo "Response: $response"
    fi
}

# Test user registration
test_registration() {
    print_status "Testing user registration..."
    
    response=$(curl -s -X POST "$API_BASE/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$ADMIN_EMAIL\",
            \"password\": \"$ADMIN_PASSWORD\",
            \"firstName\": \"Admin\",
            \"lastName\": \"User\",
            \"role\": \"super_admin\"
        }")
    
    if echo "$response" | grep -q "accessToken"; then
        print_success "User registration successful"
        TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        echo "Token: ${TOKEN:0:20}..."
    else
        print_warning "User might already exist or registration failed"
        echo "Response: $response"
    fi
}

# Test login
test_login() {
    print_status "Testing login..."
    
    response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$ADMIN_EMAIL\",
            \"password\": \"$ADMIN_PASSWORD\"
        }")
    
    if echo "$response" | grep -q "accessToken"; then
        print_success "Login successful"
        TOKEN=$(echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        echo "Token: ${TOKEN:0:20}..."
    else
        print_error "Login failed"
        echo "Response: $response"
        return 1
    fi
}

# Test protected endpoints
test_protected_endpoints() {
    if [ -z "$TOKEN" ]; then
        print_error "No token available. Please login first."
        return 1
    fi
    
    print_status "Testing protected endpoints..."
    
    # Test get current user
    print_status "Testing get current user..."
    response=$(curl -s -X GET "$API_BASE/users/me" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q "email"; then
        print_success "Get current user successful"
    else
        print_error "Get current user failed"
        echo "Response: $response"
    fi
    
    # Test get all users (admin only)
    print_status "Testing get all users (admin only)..."
    response=$(curl -s -X GET "$API_BASE/admin/users" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q "users"; then
        print_success "Get all users successful"
    else
        print_error "Get all users failed"
        echo "Response: $response"
    fi
}

# Test ticket creation
test_ticket_creation() {
    if [ -z "$TOKEN" ]; then
        print_error "No token available. Please login first."
        return 1
    fi
    
    print_status "Testing ticket creation..."
    
    response=$(curl -s -X POST "$API_BASE/tickets" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "API Test Ticket",
            "description": "This ticket was created via API testing",
            "priority": "medium",
            "category": "technical"
        }')
    
    if echo "$response" | grep -q "_id"; then
        print_success "Ticket creation successful"
        TICKET_ID=$(echo "$response" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
        echo "Ticket ID: $TICKET_ID"
    else
        print_error "Ticket creation failed"
        echo "Response: $response"
    fi
}

# Test ticket retrieval
test_ticket_retrieval() {
    if [ -z "$TOKEN" ]; then
        print_error "No token available. Please login first."
        return 1
    fi
    
    print_status "Testing ticket retrieval..."
    
    response=$(curl -s -X GET "$API_BASE/tickets" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q "tickets"; then
        print_success "Ticket retrieval successful"
        TICKET_COUNT=$(echo "$response" | grep -o '"total":[0-9]*' | cut -d':' -f2)
        echo "Total tickets: $TICKET_COUNT"
    else
        print_error "Ticket retrieval failed"
        echo "Response: $response"
    fi
}

# Test admin dashboard
test_admin_dashboard() {
    if [ -z "$TOKEN" ]; then
        print_error "No token available. Please login first."
        return 1
    fi
    
    print_status "Testing admin dashboard..."
    
    response=$(curl -s -X GET "$API_BASE/admin/dashboard" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$response" | grep -q "totalUsers"; then
        print_success "Admin dashboard successful"
        echo "Dashboard data retrieved"
    else
        print_error "Admin dashboard failed"
        echo "Response: $response"
    fi
}

# Main testing function
main() {
    echo "=========================================="
    echo "API Testing Script"
    echo "=========================================="
    echo ""
    
    # Check if API is running
    if ! check_api; then
        exit 1
    fi
    
    # Run tests
    test_health
    echo ""
    
    test_registration
    echo ""
    
    test_login
    echo ""
    
    test_protected_endpoints
    echo ""
    
    test_ticket_creation
    echo ""
    
    test_ticket_retrieval
    echo ""
    
    test_admin_dashboard
    echo ""
    
    echo "=========================================="
    print_success "API testing completed!"
    echo "=========================================="
    echo ""
    echo "If all tests passed, your backend API is working correctly!"
    echo "You can now proceed with frontend testing."
}

# Run main function
main "$@" 