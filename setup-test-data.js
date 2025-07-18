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
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm run dev');
    }
    process.exit(1);
  }
}

setupTestData(); 