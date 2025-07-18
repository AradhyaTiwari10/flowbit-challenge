# Testing Guide - Multi-Tenant SaaS Workflow System

This guide covers how to test the complete system, including backend API, frontend applications, and micro-frontend integration.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git (for cloning the repository)
- A modern web browser (Chrome, Firefox, Safari, Edge)

## Quick Start Testing

### 1. Start the Backend Services

```bash
# Start all backend services (MongoDB, Redis, n8n)
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Start the Backend API

```bash
# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start the backend server
npm run dev
```

The backend API will be available at: http://localhost:3000

### 3. Start Frontend Applications

Open three terminal windows and run:

```bash
# Terminal 1 - Shell Application
cd frontend/shell
npm install
npm run dev

# Terminal 2 - Support Tickets App
cd frontend/support-tickets-app
npm install
npm run dev

# Terminal 3 - Admin Dashboard
cd frontend/admin-dashboard
npm install
npm run dev
```

Applications will be available at:
- Shell: http://localhost:3000
- Support Tickets App: http://localhost:3001
- Admin Dashboard: http://localhost:3002

## Backend API Testing

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Authentication Testing

#### Create a Super Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "super_admin"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the `accessToken` from the response for subsequent requests.

#### Test Protected Endpoints

```bash
# Get current user
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get all users (admin only)
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Ticket Management Testing

#### Create a Ticket

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket",
    "description": "This is a test ticket",
    "priority": "medium",
    "category": "technical"
  }'
```

#### Get All Tickets

```bash
curl -X GET http://localhost:3000/api/tickets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update a Ticket

```bash
curl -X PUT http://localhost:3000/api/tickets/TICKET_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

### 4. Admin Dashboard Testing

#### Get Dashboard Stats

```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get Audit Logs

```bash
curl -X GET http://localhost:3000/api/admin/audit-logs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend Testing

### 1. Shell Application Testing

1. **Open** http://localhost:3000 in your browser
2. **Login** with the admin credentials created above
3. **Verify** the sidebar navigation loads correctly
4. **Test** theme switching (if implemented)
5. **Check** responsive design on different screen sizes

### 2. Support Tickets App Testing

1. **Navigate** to http://localhost:3000/tickets
2. **Create** a new ticket:
   - Click "New Ticket" button
   - Fill in title, description, priority, and category
   - Submit the form
3. **View** the ticket list:
   - Verify the new ticket appears
   - Test filtering by status, priority, category
   - Test search functionality
4. **Edit** a ticket:
   - Click the edit icon on any ticket
   - Modify fields and save
5. **View** ticket details:
   - Click on a ticket to view details
   - Add comments
   - Test status changes
6. **Delete** a ticket:
   - Click the delete icon
   - Confirm deletion

### 3. Admin Dashboard Testing

1. **Navigate** to http://localhost:3000/admin
2. **Verify** dashboard statistics:
   - Check total users count
   - Check total tickets count
   - Verify charts load correctly
3. **Test** user management:
   - View user list
   - Create new users
   - Edit user details
   - Deactivate users
4. **Test** ticket management:
   - View all tickets
   - Update ticket status
   - Assign tickets to users
5. **Check** audit logs:
   - Verify recent activity is logged
   - Test filtering and pagination

## Integration Testing

### 1. Micro-Frontend Integration

1. **Test** navigation between apps:
   - Click "Support Tickets" in sidebar → should load tickets app
   - Click "Admin Dashboard" in sidebar → should load admin app
2. **Verify** shared state:
   - Login state persists across apps
   - User info is available in all apps
3. **Test** error handling:
   - Disconnect one micro-frontend
   - Verify shell handles the error gracefully

### 2. Multi-Tenant Testing

1. **Create** multiple tenants:
   ```bash
   # Create tenant 1 user
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user1@tenant1.com",
       "password": "password123",
       "firstName": "User",
       "lastName": "One",
       "role": "user"
     }'

   # Create tenant 2 user
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user2@tenant2.com",
       "password": "password123",
       "firstName": "User",
       "lastName": "Two",
       "role": "user"
     }'
   ```

2. **Test** tenant isolation:
   - Login as user1 and create tickets
   - Login as user2 and verify you can't see user1's tickets
   - Verify admin can see all tickets

### 3. Real-time Features Testing

1. **Test** WebSocket connections (if implemented):
   - Open multiple browser tabs
   - Create/update tickets in one tab
   - Verify changes appear in other tabs

## Performance Testing

### 1. Load Testing

```bash
# Install Apache Bench (if not available)
# macOS: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# Test API performance
ab -n 1000 -c 10 http://localhost:3000/api/health

# Test with authentication
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/tickets
```

### 2. Frontend Performance

1. **Open** Chrome DevTools
2. **Go to** Performance tab
3. **Record** while navigating through the app
4. **Check** for:
   - Memory leaks
   - Slow rendering
   - Large bundle sizes

## Security Testing

### 1. Authentication Testing

1. **Test** invalid credentials:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "wrong@email.com",
       "password": "wrongpassword"
     }'
   ```

2. **Test** expired tokens:
   - Wait for token to expire
   - Try to access protected endpoint
   - Verify refresh token works

3. **Test** role-based access:
   - Login as regular user
   - Try to access admin endpoints
   - Verify proper 403 responses

### 2. Input Validation Testing

```bash
# Test SQL injection attempts
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "'; DROP TABLE users; --",
    "description": "Test",
    "priority": "medium",
    "category": "technical"
  }'

# Test XSS attempts
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert(\"xss\")</script>",
    "description": "Test",
    "priority": "medium",
    "category": "technical"
  }'
```

## Automated Testing

### 1. Backend Tests

```bash
cd backend

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### 2. Frontend Tests

```bash
# Shell application
cd frontend/shell
npm test

# Support tickets app
cd ../support-tickets-app
npm test

# Admin dashboard
cd ../admin-dashboard
npm test
```

### 3. E2E Tests

```bash
# Install Playwright
npm install -g playwright

# Run E2E tests
npx playwright test
```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :3001
   lsof -i :3002
   ```

2. **Module Federation issues**:
   - Clear browser cache
   - Restart all applications
   - Check webpack configurations

3. **Database connection issues**:
   ```bash
   # Check MongoDB status
   docker-compose logs mongodb
   
   # Restart services
   docker-compose restart
   ```

4. **CORS issues**:
   - Verify backend CORS configuration
   - Check frontend API URLs
   - Ensure proper headers

### Debug Mode

```bash
# Backend debug
DEBUG=* npm run dev

# Frontend debug
# Add console.logs or use browser dev tools
```

## Test Data Setup

### Sample Data Script

```bash
# Create a script to populate test data
cat > setup-test-data.js << 'EOF'
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function setupTestData() {
  try {
    // Create admin user
    const adminResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'admin@test.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin'
    });

    const adminToken = adminResponse.data.accessToken;

    // Create regular users
    const users = [
      { email: 'user1@test.com', firstName: 'John', lastName: 'Doe' },
      { email: 'user2@test.com', firstName: 'Jane', lastName: 'Smith' }
    ];

    for (const user of users) {
      await axios.post(`${API_BASE}/auth/register`, {
        ...user,
        password: 'password123',
        role: 'user'
      });
    }

    // Create sample tickets
    const tickets = [
      {
        title: 'Bug Report: Login not working',
        description: 'Users cannot log in with correct credentials',
        priority: 'high',
        category: 'bug'
      },
      {
        title: 'Feature Request: Dark Mode',
        description: 'Add dark mode theme option',
        priority: 'medium',
        category: 'feature'
      },
      {
        title: 'General Inquiry: Pricing',
        description: 'What are the pricing plans?',
        priority: 'low',
        category: 'general'
      }
    ];

    for (const ticket of tickets) {
      await axios.post(`${API_BASE}/tickets`, ticket, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }

    console.log('Test data setup completed!');
  } catch (error) {
    console.error('Error setting up test data:', error.message);
  }
}

setupTestData();
EOF

# Run the script
node setup-test-data.js
```

## Continuous Testing

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend/shell && npm install
          cd ../frontend/support-tickets-app && npm install
          cd ../frontend/admin-dashboard && npm install
          
      - name: Run backend tests
        run: cd backend && npm test
        
      - name: Run frontend tests
        run: |
          cd frontend/shell && npm test
          cd ../support-tickets-app && npm test
          cd ../admin-dashboard && npm test
          
      - name: Build applications
        run: |
          cd frontend/shell && npm run build
          cd ../support-tickets-app && npm run build
          cd ../admin-dashboard && npm run build
```

This comprehensive testing guide covers all aspects of the system. Start with the quick start testing and gradually work through each section to ensure everything is working correctly. 