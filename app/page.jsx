'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogIn,
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut
} from 'lucide-react';

// Import all page components
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import ChatPage from './components/ChatPage';
import AdminPage from './components/AdminPage';

// Navigation items configuration
const navigationItems = [
  { id: 'auth', label: 'Authentication', icon: LogIn, component: AuthPage },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, component: DashboardPage },
  { id: 'chat', label: 'Messages', icon: MessageSquare, component: ChatPage },
  { id: 'admin', label: 'Admin Panel', icon: Settings, component: AdminPage },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState('auth');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle authentication
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('auth');
  };

  // Get current page component
  const currentNav = navigationItems.find(item => item.id === currentPage);
  const CurrentPageComponent = currentNav?.component;

  return (
    <div className="h-screen flex overflow-hidden bg-dark-50">
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-dark-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-dark-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-dark-900">InstaHub</h1>
              <p className="text-xs text-dark-500">API Dashboard</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
            >
              <X className="w-5 h-5 text-dark-600" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isLocked = item.id !== 'auth' && !isAuthenticated;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isLocked) {
                    setCurrentPage(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }
                }}
                disabled={isLocked}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 shadow-sm' 
                    : isLocked
                    ? 'text-dark-400 cursor-not-allowed opacity-50'
                    : 'text-dark-600 hover:bg-dark-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isLocked && (
                  <span className="ml-auto text-xs bg-dark-200 px-2 py-0.5 rounded-full">
                    Login Required
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section (if authenticated) */}
        {isAuthenticated && user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-200 bg-dark-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 truncate">{user.name}</p>
                  <p className="text-xs text-dark-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-dark-200 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-dark-600" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-dark-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-dark-100 transition-colors md:hidden"
            >
              <Menu className="w-5 h-5 text-dark-600" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-dark-900">{currentNav?.label}</h2>
              <p className="text-xs text-dark-500">
                {isAuthenticated ? `Welcome back, ${user?.name}` : 'Please login to continue'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar (visible on larger screens) */}
            {isAuthenticated && (
              <>
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-dark-50 rounded-lg border border-dark-200">
                  <Search className="w-4 h-4 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-dark-900 placeholder:text-dark-400 w-64"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-dark-100 transition-colors">
                  <Bell className="w-5 h-5 text-dark-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 animate-fade-in">
          {CurrentPageComponent && (
            <CurrentPageComponent 
              onLogin={handleLogin}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
              user={user}
            />
          )}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
