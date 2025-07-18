import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Ticket, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/utils/cn';

const iconMap: Record<string, React.ComponentType<any>> = {
  home: Home,
  ticket: Ticket,
  users: Users,
  settings: Settings,
  dashboard: BarChart3,
  audit: FileText,
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { tenant, sidebarOpen, setSidebarOpen, theme } = useAppStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Home;
    return <IconComponent className="w-5 h-5" />;
  };

  const getThemeColors = () => {
    const themes = {
      blue: {
        bg: 'bg-blue-600',
        hover: 'hover:bg-blue-700',
        active: 'bg-blue-800',
        text: 'text-white',
        border: 'border-blue-700',
      },
      green: {
        bg: 'bg-green-600',
        hover: 'hover:bg-green-700',
        active: 'bg-green-800',
        text: 'text-white',
        border: 'border-green-700',
      },
      purple: {
        bg: 'bg-purple-600',
        hover: 'hover:bg-purple-700',
        active: 'bg-purple-800',
        text: 'text-white',
        border: 'border-purple-700',
      },
    };
    return themes[theme as keyof typeof themes] || themes.blue;
  };

  const colors = getThemeColors();

  if (!tenant || !user) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          colors.bg,
          colors.border,
          'border-r'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">Flowbit</h1>
                <p className="text-white/70 text-xs">{tenant.name}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {tenant.screens.map((screen) => {
              const isActive = location.pathname === screen.url;
              const IconComponent = getIconComponent(screen.icon);

              return (
                <Link
                  key={screen.id}
                  to={screen.url}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200',
                    colors.text,
                    isActive
                      ? colors.active
                      : `${colors.hover} ${colors.text}/80`
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {IconComponent}
                  <span className="font-medium">{screen.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {user.profile.avatar ? (
                  <img
                    src={user.profile.avatar}
                    alt={user.profile.firstName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {user.profile.firstName.charAt(0)}
                    {user.profile.lastName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user.profile.firstName} {user.profile.lastName}
                </p>
                <p className="text-white/70 text-sm truncate">{user.email}</p>
                <p className="text-white/50 text-xs capitalize">{user.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 