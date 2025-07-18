# Quick Start Guide - Multi-Tenant SaaS Workflow System

This guide will help you get the system up and running for testing in under 10 minutes.

## 🚀 Quick Setup (Automated)

### 1. Run the Setup Script

```bash
# Make sure you're in the project root directory
./test-setup.sh
```

This script will:
- ✅ Check all prerequisites
- ✅ Start Docker services (MongoDB, Redis, n8n)
- ✅ Install all dependencies
- ✅ Create test data script
- ✅ Provide next steps

### 2. Start the Applications

Open **4 terminal windows** and run:

```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Shell Application (Main App)
cd frontend/shell
npm run dev

# Terminal 3 - Support Tickets App
cd frontend/support-tickets-app
npm run dev

# Terminal 4 - Admin Dashboard
cd frontend/admin-dashboard
npm run dev
```

### 3. Set Up Test Data

```bash
# In a new terminal (Terminal 5)
node setup-test-data.js
```

### 4. Access the Application

1. **Open your browser** and go to: http://localhost:3000
2. **Login** with: `admin@test.com` / `admin123`
3. **Explore** the application!

## 📱 Application URLs

- **Main Application**: http://localhost:3000
- **Support Tickets App**: http://localhost:3001 (standalone)
- **Admin Dashboard**: http://localhost:3002 (standalone)
- **Backend API**: http://localhost:3000/api
- **n8n Workflow Engine**: http://localhost:5678

## 👥 Test Users

After running the setup script, you'll have these test users:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `admin@test.com` | `admin123` | Super Admin | Full access to everything |
| `user1@test.com` | `password123` | User | Regular user access |
| `user2@test.com` | `password123` | User | Regular user access |
| `support@test.com` | `password123` | User | Support agent |

## 🧪 What to Test

### 1. Authentication
- ✅ Login with different users
- ✅ Test role-based access
- ✅ Verify tenant isolation

### 2. Support Tickets App
- ✅ Create new tickets
- ✅ View ticket list with filters
- ✅ Edit ticket details
- ✅ Add comments to tickets
- ✅ Change ticket status

### 3. Admin Dashboard
- ✅ View dashboard statistics
- ✅ Check user management
- ✅ Review audit logs
- ✅ Monitor system health

### 4. Micro-Frontend Integration
- ✅ Navigate between apps seamlessly
- ✅ Verify shared authentication state
- ✅ Test responsive design

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Kill the process if needed
kill -9 <PID>
```

**Docker services not starting:**
```bash
# Check Docker status
docker-compose ps

# View logs
docker-compose logs

# Restart services
docker-compose restart
```

**Module Federation issues:**
```bash
# Clear browser cache
# Restart all applications
# Check webpack configurations
```

**Database connection issues:**
```bash
# Check MongoDB status
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Manual Setup (if script fails)

If the automated script doesn't work, follow these steps:

1. **Start Docker services:**
   ```bash
   docker-compose up -d
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cp env.example .env
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend/shell && npm install
   cd ../support-tickets-app && npm install
   cd ../admin-dashboard && npm install
   ```

4. **Start applications manually** (see step 2 above)

## 📊 Testing Checklist

- [ ] Backend API responds to health check
- [ ] Can register and login users
- [ ] Can create and manage tickets
- [ ] Admin dashboard shows statistics
- [ ] Micro-frontends load correctly
- [ ] Navigation works between apps
- [ ] Responsive design works on mobile
- [ ] Error handling works properly

## 🎯 Next Steps

After successful testing:

1. **Read the full documentation** in `README.md`
2. **Explore the codebase** to understand the architecture
3. **Check the testing guide** in `TESTING.md` for detailed testing procedures
4. **Customize the system** for your specific needs
5. **Deploy to production** following the deployment guide

## 🆘 Need Help?

- Check the `TESTING.md` file for detailed testing procedures
- Review the `README.md` for comprehensive documentation
- Check the troubleshooting section above
- Verify all prerequisites are installed correctly

---

**Happy Testing! 🎉** 