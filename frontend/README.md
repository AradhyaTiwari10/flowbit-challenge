# Frontend - Multi-Tenant SaaS Workflow System

This directory contains the frontend applications for the multi-tenant SaaS workflow system, built with React 18, TypeScript, and Webpack Module Federation for micro-frontend architecture.

## Architecture

The frontend consists of three main applications:

1. **Shell Application** (`shell/`) - Main container application with routing and shared components
2. **Support Tickets App** (`support-tickets-app/`) - Micro-frontend for ticket management
3. **Admin Dashboard** (`admin-dashboard/`) - Micro-frontend for administrative functions

## Technology Stack

- **React 18** with TypeScript
- **Webpack Module Federation** for micro-frontend architecture
- **React Router v6** for routing
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Recharts** for data visualization (Admin Dashboard)

## Project Structure

```
frontend/
├── shell/                    # Main shell application
│   ├── src/
│   │   ├── components/       # Shared components
│   │   ├── stores/          # Zustand stores
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── webpack.config.js    # Module Federation config
│   └── package.json
├── support-tickets-app/      # Support tickets micro-frontend
│   ├── src/
│   │   ├── components/      # Ticket-specific components
│   │   ├── stores/          # Ticket store
│   │   ├── services/        # Ticket API service
│   │   └── types/           # Ticket types
│   ├── webpack.config.js    # Module Federation config
│   └── package.json
├── admin-dashboard/          # Admin dashboard micro-frontend
│   ├── src/
│   │   ├── components/      # Admin-specific components
│   │   ├── stores/          # Admin store
│   │   ├── services/        # Admin API service
│   │   └── types/           # Admin types
│   ├── webpack.config.js    # Module Federation config
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies for all applications:

```bash
# Shell application
cd frontend/shell
npm install

# Support tickets app
cd ../support-tickets-app
npm install

# Admin dashboard
cd ../admin-dashboard
npm install
```

### Development

Start all applications in development mode:

```bash
# Terminal 1 - Shell application (port 3000)
cd frontend/shell
npm run dev

# Terminal 2 - Support tickets app (port 3001)
cd frontend/support-tickets-app
npm run dev

# Terminal 3 - Admin dashboard (port 3002)
cd frontend/admin-dashboard
npm run dev
```

The applications will be available at:
- Shell: http://localhost:3000
- Support Tickets App: http://localhost:3001
- Admin Dashboard: http://localhost:3002

### Building for Production

```bash
# Build all applications
cd frontend/shell && npm run build
cd ../support-tickets-app && npm run build
cd ../admin-dashboard && npm run build
```

## Module Federation Configuration

### Shell Application

The shell application acts as the container and loads micro-frontends dynamically:

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    supportTicketsApp: 'supportTicketsApp@http://localhost:3001/remoteEntry.js',
    adminDashboard: 'adminDashboard@http://localhost:3002/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
    // ... other shared dependencies
  },
})
```

### Micro-Frontends

Each micro-frontend exposes its main component:

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'supportTicketsApp',
  exposes: {
    './SupportTicketsApp': './src/App.tsx',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
    // ... other shared dependencies
  },
})
```

## State Management

### Shell Application

- **Auth Store**: Manages authentication state, user info, and tokens
- **App Store**: Manages global app state (tenant, theme, sidebar, notifications)

### Support Tickets App

- **Ticket Store**: Manages ticket data, filters, and operations

### Admin Dashboard

- **Admin Store**: Manages dashboard stats, users, tickets, and audit logs

## API Communication

All applications use a centralized API service with:
- Automatic token management
- Request/response interceptors
- Error handling
- Token refresh logic

## Routing

The shell application handles routing and loads appropriate micro-frontends:

- `/tickets/*` → Support Tickets App
- `/admin/*` → Admin Dashboard
- `/` → Redirects to `/tickets`

## Features

### Shell Application
- Authentication and authorization
- Multi-tenant support
- Responsive sidebar navigation
- User profile management
- Theme switching
- Notification system

### Support Tickets App
- Ticket listing with filters and search
- Ticket creation and editing
- Ticket details with comments
- File attachments
- Status and priority management
- Real-time updates

### Admin Dashboard
- Dashboard statistics and charts
- User management
- Ticket management
- Audit logs
- System health monitoring

## Development Guidelines

### Adding New Micro-Frontends

1. Create a new directory in `frontend/`
2. Set up webpack with Module Federation
3. Expose the main component
4. Add to shell's remote configuration
5. Update routing in Layout component

### Shared Dependencies

Keep shared dependencies in sync across all applications:
- React and React DOM
- React Router
- Zustand
- Axios
- UI libraries

### Styling

Use Tailwind CSS for consistent styling across all applications. The design system includes:
- Primary color palette
- Consistent spacing
- Responsive breakpoints
- Component variants

### TypeScript

Maintain strict TypeScript configuration across all applications:
- Strict mode enabled
- Proper type definitions
- Shared type interfaces

## Testing

```bash
# Run type checking
npm run type-check

# Run tests (when implemented)
npm test
```

## Deployment

Each application can be deployed independently:

1. Build each application
2. Deploy to CDN or static hosting
3. Update remote URLs in shell configuration
4. Deploy shell application

## Troubleshooting

### Module Federation Issues

- Ensure all applications are running on correct ports
- Check shared dependency versions match
- Verify remote entry points are accessible
- Clear browser cache and node_modules

### CORS Issues

- Ensure proper CORS headers in development
- Check API endpoint configuration
- Verify authentication token handling

### Build Issues

- Check TypeScript configuration
- Verify webpack configuration
- Ensure all dependencies are installed
- Check for version conflicts

## Contributing

1. Follow the established project structure
2. Maintain consistent coding standards
3. Update documentation for new features
4. Test changes across all applications
5. Ensure proper error handling
6. Follow TypeScript best practices 