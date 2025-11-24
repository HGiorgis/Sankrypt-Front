import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Shield, Save } from 'lucide-react';

interface NotificationPreferences {
  email: boolean;
  securityAlerts: boolean;
  newDevices: boolean;
}

interface SecurityPreferences {
  autoLock: number;
  twoFactorAuth: boolean;
}

interface UserPreferencesData {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  security: SecurityPreferences;
}

const UserPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferencesData>({
    theme: 'system',
    notifications: {
      email: true,
      securityAlerts: true,
      newDevices: true,
    },
    security: {
      autoLock: 5,
      twoFactorAuth: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (preferences.theme === 'dark' || 
        (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences.theme]);

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('idle');

    try {
      // Save to localStorage (in a real app, you'd save to your backend)
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setPreferences(prev => ({
      ...prev,
      theme
    }));
  };

  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handleSecurityChange = (key: keyof SecurityPreferences, value: number | boolean) => {
    setPreferences(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-full">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
          <p className="text-gray-600">Customize your experience and security settings</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Theme Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'light' as const, label: 'Light', icon: Sun },
              { value: 'dark' as const, label: 'Dark', icon: Moon },
              { value: 'system' as const, label: 'System', icon: Shield },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  preferences.theme === value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  preferences.theme === value ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  preferences.theme === value ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-3">
            {[
              { key: 'email' as const, label: 'Email notifications', description: 'Receive updates about your account' },
              { key: 'securityAlerts' as const, label: 'Security alerts', description: 'Get notified about security events' },
              { key: 'newDevices' as const, label: 'New device alerts', description: 'Alert when new devices sign in' },
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <button
                  onClick={() => handleNotificationChange(key, !preferences.notifications[key])}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences.notifications[key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.notifications[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
          <div className="space-y-4">
            {/* Auto Lock */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Auto Lock</p>
                <p className="text-sm text-gray-500">Automatically lock after {preferences.security.autoLock} minutes of inactivity</p>
              </div>
              <select
                value={preferences.security.autoLock}
                onChange={(e) => handleSecurityChange('autoLock', parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1 min</option>
                <option value={5}>5 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <button
                onClick={() => handleSecurityChange('twoFactorAuth', !preferences.security.twoFactorAuth)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  preferences.security.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.security.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </button>
        </div>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">Preferences saved successfully!</div>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">Failed to save preferences. Please try again.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPreferences;