# Flowbit Technical Challenge - Multi-Tenant Workflow System

A production-ready multi-tenant SaaS platform that integrates with n8n workflow engine, demonstrating enterprise-grade tenant isolation, dynamic micro-frontend architecture, real-time workflow automation, and comprehensive testing suite.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Shell   │    │  Micro-frontend │    │   n8n Workflow  │
│   (Main App)    │◄──►│   (Support)     │◄──►│     Engine      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js/Express API                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Auth &    │ │   Tenant    │ │  Workflow   │ │   Audit     │ │
│  │   RBAC      │ │  Isolation  │ │ Integration │ │   Logging   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    MongoDB      │    │     Redis       │    │   WebSockets    │
│  (Multi-tenant) │    │   (Sessions)    │    │  (Real-time)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Features

### Core Requirements ✅
- **Authentication & RBAC**: JWT with refresh tokens, role-based access control
- **Tenant Data Isolation**: Bulletproof MongoDB schema with customer isolation
- **Dynamic Use-Case Registry**: Tenant-specific screens and permissions
- **React Shell with Micro-frontends**: Webpack Module Federation architecture
- **Workflow Integration**: n8n integration with webhook callbacks
- **Production Containerization**: Docker Compose with multi-stage builds

### Bonus Features ✅
- **Advanced Audit Logging**: Comprehensive audit trail system
- **Comprehensive Testing**: Jest unit tests + Cypress E2E tests
- **CI/CD Pipeline**: GitHub Actions with automated testing
- **Premium Features**: API docs, monitoring, caching, validation

## 🛠️ Tech Stack

- **Backend**: Node.js/Express with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React 18 with TypeScript, Tailwind CSS
- **Micro-frontends**: Webpack Module Federation
- **Workflow Engine**: n8n (Docker container)
- **Real-time**: WebSockets (Socket.io)
- **Containerization**: Docker Compose
- **Testing**: Jest + Cypress
- **CI/CD**: GitHub Actions
- **Security**: Helmet, rate limiting, JWT

## 📦 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd flowbit-challenge
cp .env.example .env
```

### 2. Start the System
```bash
docker-compose up -d
```

### 3. Access Applications
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **n8n**: http://localhost:5678
- **MongoDB**: localhost:27017

### 4. Seed Data
```bash
npm run seed
```

## 🔐 Authentication

### Default Users
- **LogisticsCo Admin**: admin@logistics.com / admin123
- **LogisticsCo User**: user@logistics.com / user123
- **RetailGmbH Admin**: admin@retail.com / admin123
- **RetailGmbH User**: user@retail.com / user123

## 🏢 Multi-Tenant Architecture

### Tenant Isolation
- Database-level isolation with `customerId` field
- Middleware auto-injection of tenant context
- Cross-tenant access prevention
- Soft delete functionality

### Dynamic Screens
- Tenant-specific navigation
- Role-based screen visibility
- Custom themes per tenant
- Real-time updates

## 🔄 Workflow Integration

### n8n Workflows
- Ticket creation triggers
- Status update callbacks
- Email notifications
- Assignment workflows

### Webhook Security
- Signature verification
- Retry mechanisms
- Audit logging
- Error handling

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### User Management
- `GET /api/me/profile` - Get user profile
- `PUT /api/me/profile` - Update profile
- `GET /api/me/screens` - Get available screens

### Tickets
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket

### Admin Routes
- `GET /api/admin/users` - List users
- `GET /api/admin/audit-logs` - View audit logs

## 🔒 Security Features

- JWT with refresh tokens
- Password hashing (bcrypt 12 rounds)
- Rate limiting on auth endpoints
- CORS configuration
- Input validation
- SQL injection protection
- XSS protection

## 📈 Performance

- Database indexing on `customerId`
- Redis caching layer
- Connection pooling
- Bundle optimization
- Lazy loading micro-frontends

## 🐳 Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Frontend      │   Backend       │   Infrastructure        │
│   (React)       │   (Node.js)     │   (MongoDB, Redis)      │
├─────────────────┼─────────────────┼─────────────────────────┤
│   n8n Engine    │   Nginx Proxy   │   Monitoring            │
│   (Workflows)   │   (SSL/TLS)     │   (Health Checks)       │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 🚀 Deployment

### Production Setup
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with environment variables
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/flowbit
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

# n8n
N8N_WEBHOOK_SECRET=your-webhook-secret
N8N_BASE_URL=http://localhost:5678
```

## 📝 Development

### Code Quality
- TypeScript strict mode
- ESLint + Prettier
- Husky pre-commit hooks
- Conventional commits

### Project Structure
```
flowbit-challenge/
├── backend/           # Node.js API
├── frontend/          # React applications
├── n8n/              # Workflow definitions
├── cypress/          # E2E tests
├── .github/          # CI/CD workflows
└── docs/             # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation

---

**Built with ❤️ for Flowbit Technical Challenge**