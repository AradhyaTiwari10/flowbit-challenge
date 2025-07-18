#!/bin/bash

# Test Setup Script for Multi-Tenant SaaS Workflow System
# This script helps you quickly set up and test the system

set -e

echo "🚀 Setting up Multi-Tenant SaaS Workflow System for testing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose"
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Start backend services
start_backend_services() {
    print_status "Starting backend services with Docker Compose..."
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found. Please run this script from the project root"
        exit 1
    fi
    
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Backend services are running"
    else
        print_error "Failed to start backend services"
        docker-compose logs
        exit 1
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        cp env.example .env
        print_warning "Please review and update .env file with your configuration"
    fi
    
    cd ..
}

# Setup frontend applications
setup_frontend() {
    print_status "Setting up frontend applications..."
    
    # Shell application
    print_status "Setting up shell application..."
    cd frontend/shell
    npm install
    cd ../..
    
    # Support tickets app
    print_status "Setting up support tickets app..."
    cd frontend/support-tickets-app
    npm install
    cd ../..
    
    # Admin dashboard
    print_status "Setting up admin dashboard..."
    cd frontend/admin-dashboard
    npm install
    cd ../..
    
    print_success "Frontend applications are set up"
}

# Create test data script
create_test_data_script() {
    print_status "Creating test data script..."
    
    cat > setup-test-data.js << 'EOF'
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function setupTestData() {
  try {
    console.log('Setting up test data...');
    
    // Create admin user
    console.log('Creating admin user...');
    const adminResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'admin@test.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin'
    });

    const adminToken = adminResponse.data.accessToken;
    console.log('Admin user created successfully');

    // Create regular users
    console.log('Creating regular users...');
    const users = [
      { email: 'user1@test.com', firstName: 'John', lastName: 'Doe' },
      { email: 'user2@test.com', firstName: 'Jane', lastName: 'Smith' },
      { email: 'support@test.com', firstName: 'Support', lastName: 'Agent' }
    ];

    for (const user of users) {
      await axios.post(`${API_BASE}/auth/register`, {
        ...user,
        password: 'password123',
        role: 'user'
      });
      console.log(`User ${user.email} created`);
    }

    // Create sample tickets
    console.log('Creating sample tickets...');
    const tickets = [
      {
        title: 'Bug Report: Login not working',
        description: 'Users cannot log in with correct credentials. The login form shows an error message.',
        priority: 'high',
        category: 'bug'
      },
      {
        title: 'Feature Request: Dark Mode',
        description: 'Add dark mode theme option to improve user experience in low-light environments.',
        priority: 'medium',
        category: 'feature'
      },
      {
        title: 'General Inquiry: Pricing Plans',
        description: 'What are the different pricing plans available? Need information about features included.',
        priority: 'low',
        category: 'general'
      },
      {
        title: 'Technical Issue: API Response Slow',
        description: 'API responses are taking longer than expected, affecting application performance.',
        priority: 'high',
        category: 'technical'
      },
      {
        title: 'Billing Question: Invoice Discrepancy',
        description: 'There seems to be a discrepancy in the latest invoice. Need clarification.',
        priority: 'medium',
        category: 'billing'
      }
    ];

    for (const ticket of tickets) {
      await axios.post(`${API_BASE}/tickets`, ticket, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`Ticket "${ticket.title}" created`);
    }

    console.log('\n✅ Test data setup completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@test.com / admin123');
    console.log('User 1: user1@test.com / password123');
    console.log('User 2: user2@test.com / password123');
    console.log('Support: support@test.com / password123');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

setupTestData();
EOF

    print_success "Test data script created"
}

# Start applications
start_applications() {
    print_status "Starting applications..."
    
    print_warning "You'll need to start the applications manually in separate terminals:"
    echo ""
    echo "Terminal 1 - Backend API:"
    echo "  cd backend && npm run dev"
    echo ""
    echo "Terminal 2 - Shell Application:"
    echo "  cd frontend/shell && npm run dev"
    echo ""
    echo "Terminal 3 - Support Tickets App:"
    echo "  cd frontend/support-tickets-app && npm run dev"
    echo ""
    echo "Terminal 4 - Admin Dashboard:"
    echo "  cd frontend/admin-dashboard && npm run dev"
    echo ""
}

# Main execution
main() {
    echo "=========================================="
    echo "Multi-Tenant SaaS Workflow System"
    echo "Test Setup Script"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    start_backend_services
    setup_backend
    setup_frontend
    create_test_data_script
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    
    start_applications
    
    echo ""
    echo "📖 Next Steps:"
    echo "1. Start the backend API: cd backend && npm run dev"
    echo "2. Start the frontend applications (see above)"
    echo "3. Run test data setup: node setup-test-data.js"
    echo "4. Open http://localhost:3000 in your browser"
    echo "5. Login with admin@test.com / admin123"
    echo ""
    echo "📚 For detailed testing instructions, see TESTING.md"
    echo ""
}

# Run main function
main "$@" 