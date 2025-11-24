import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  User, 
  Lock, 
  ArrowLeft, 
  Bell, 
  Palette,
  LogOut,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2 // Add Loader2 import
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChangeMasterKey from './ChangeMasterKey';
import ChangePassword from './ChangePassword';
import UserPreferences from './UserPreferences';

const SettingsPage: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth(); // Add isLoggingOut
  const [activeTab, setActiveTab] = useState<'master-key' | 'password' | 'preferences'>('master-key');

  const tabs = [
    {
      id: 'master-key',
      name: 'Master Key',
      description: 'Change your encryption master key',
      icon: Key,
      color: 'purple'
    },
    {
      id: 'password',
      name: 'Password',
      description: 'Update your login password',
      icon: Lock,
      color: 'blue'
    },
    {
      id: 'preferences',
      name: 'Preferences',
      description: 'Customize your experience',
      icon: Palette,
      color: 'green'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      purple: {
        bg: isActive ? 'bg-purple-50 border-purple-200' : 'hover:bg-purple-50 border-transparent',
        text: isActive ? 'text-purple-700' : 'text-gray-600 hover:text-purple-600',
        icon: isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-500'
      },
      blue: {
        bg: isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-blue-50 border-transparent',
        text: isActive ? 'text-blue-700' : 'text-gray-600 hover:text-blue-600',
        icon: isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
      },
      green: {
        bg: isActive ? 'bg-green-50 border-green-200' : 'hover:bg-green-50 border-transparent',
        text: isActive ? 'text-green-700' : 'text-gray-600 hover:text-green-600',
        icon: isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => window.history.back()}
                className="group inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Vault
              </button>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                  <SettingsIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Settings
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">Manage your security and preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
          {/* Sidebar Navigation */}
          <div className="xl:col-span-2 space-y-6">
            {/* Navigation Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Security Center</h3>
                <p className="text-gray-600 text-sm mt-1">Protect your vault and data</p>
              </div>
              
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const colors = getColorClasses(tab.color, isActive);
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`group w-full flex items-center space-x-4 p-4 mb-2 rounded-xl border-2 transition-all duration-200 ${colors.bg} ${colors.text} ${
                        isActive ? 'shadow-sm scale-[1.02]' : 'hover:shadow-sm'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${colors.icon}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-sm opacity-75">{tab.description}</div>
                      </div>
                      {isActive && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Security Status */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Security Status</h4>
                  <p className="text-green-700 text-sm">All systems secure</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Encryption</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">2FA</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    Recommended
                  </span>
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full group flex items-center justify-center space-x-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-200/60 hover:border-red-200 hover:bg-red-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-5 w-5 text-red-600 animate-spin" />
                  <span className="font-medium text-red-700">Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-red-700">Sign Out</span>
                </>
              )}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              {/* Content Body */}
              <div className="p-6">
                <div className="max-w-2xl">
                  {activeTab === 'master-key' && <ChangeMasterKey />}
                  {activeTab === 'password' && <ChangePassword />}
                  {activeTab === 'preferences' && <UserPreferences />}
                </div>
              </div>
            </div>

            {/* Additional Tips */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Eye className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Security Tip</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      Always use a strong, unique master key that you don't use elsewhere.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-900">Important</h4>
                    <p className="text-amber-700 text-sm mt-1">
                      Changing your master key will require re-encryption of all vault items.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;