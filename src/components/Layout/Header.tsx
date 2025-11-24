import React, { useState, useRef, useEffect } from 'react';
import { Shield, Settings, LogOut, User, ChevronDown, Moon, Sun, Bell, Search, Plus, Key, Menu, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // You can add logic to persist dark mode preference
  };

  const quickActions = [
    { icon: Plus, label: 'Add Credential', action: () => navigate('/vault?add=new') },
    { icon: Key, label: 'Generate Password', action: () => navigate('/vault?generate=true') },
    { icon: Search, label: 'Search Vault', action: () => navigate('/vault?search=true') },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/75 shadow-sm sticky top-0 z-50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Logo */}
              <Link to="/vault" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400/20 rounded-full blur-lg opacity-60 animate-pulse"></div>
                  <img 
                    src="/logo.png" 
                    alt="Sankrypt" 
                    className="relative w-16 h-16 rounded-full border-2 border-white shadow-lg"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    Sankrypt
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Personal Password Manager</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to="/vault"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/vault')
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-inner border border-blue-200/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>My Vault</span>
                {isActive('/vault') && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                )}
              </Link>

              <Link
                to="/settings"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/settings')
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-inner border border-blue-200/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
                {isActive('/settings') && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                )}
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              
              {/* Quick Actions */}
              {/* <div className="hidden md:flex items-center space-x-1">
                {quickActions.map((action, index) => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-105"
                    title={action.label}
                  >
                    <action.icon className="h-4 w-4" />
                  </button>
                ))}
              </div> */}

              {/* Theme Toggle */}
              {/* <button
                onClick={toggleDarkMode}
                className="p-2.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-300 hidden sm:block"
                title="Toggle theme"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button> */}

              {/* Notifications */}
              {/* <button
                className="p-2.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {hasNotifications && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </button> */}

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/75 py-2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200/50">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Account Settings</span>
                      </button>

                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                      >
                        {darkMode ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200/50 pt-2">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                        <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/75 animate-in slide-in-from-top duration-300">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/vault"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/vault')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>My Vault</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/settings')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
            {/* Quick Actions for Mobile */}
            {/* <div className="px-4 py-3 border-t border-gray-200/50">
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.action();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center space-y-1 p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div> */}
          </div>
        )}
      </header>
    </>
  );
};

export default Header;