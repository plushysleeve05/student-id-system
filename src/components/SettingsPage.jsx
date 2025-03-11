import React from "react";
import {
  Sun,
  Bell,
  Shield,
  Database,
  UserCog,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { fetchToken } from "../Auth";
import { API_BASE_URL } from "../config";

function SettingsPage({ darkMode, toggleDarkMode }) {
  const [settings, setSettings] = React.useState({
    two_factor_auth: false,
    session_timeout: 30,
    system_notifications: true,
    email_alerts: true
  });
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch initial settings and cache stats
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = fetchToken();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch settings
        const settingsResponse = await fetch(`${API_BASE_URL}/api/settings`, { headers });
        if (!settingsResponse.ok) {
          throw new Error('Failed to fetch settings');
        }
        const settingsData = await settingsResponse.json();

        // Fetch cache stats
        const cacheStatsResponse = await fetch(`${API_BASE_URL}/api/maintenance/cache-stats`, { headers });
        if (!cacheStatsResponse.ok) {
          throw new Error('Failed to fetch cache stats');
        }
        const cacheStats = await cacheStatsResponse.json();

        // Combine settings and cache stats
        setSettings({
          ...settingsData,
          cache_size_mb: cacheStats.total_size_mb,
          cache_file_count: cacheStats.file_count
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle security settings changes
  const handleTwoFactorChange = async (e) => {
    const newValue = e.target.checked;
    setIsLoading(true);
    try {
      const token = fetchToken();
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          two_factor_auth: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update 2FA setting');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to update 2FA setting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionTimeoutChange = async (e) => {
    const newValue = parseInt(e.target.value);
    if (isNaN(newValue) || newValue < 5 || newValue > 120) return;

    setIsLoading(true);
    try {
      const token = fetchToken();
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_timeout: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session timeout');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to update session timeout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async (setting, value) => {
    setIsLoading(true);
    try {
      const token = fetchToken();
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [setting]: value,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${setting}`);
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error(`Failed to update ${setting}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your system preferences and settings
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Sun className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable dark mode for the interface
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add an extra layer of security
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.two_factor_auth}
                    onChange={handleTwoFactorChange}
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Session Timeout
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.session_timeout}
                    onChange={handleSessionTimeoutChange}
                    disabled={isLoading}
                    className="block w-24 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">System Notifications</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get notified about system events
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.system_notifications}
                    onChange={(e) => handleNotificationChange('system_notifications', e.target.checked)}
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Alerts</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive important alerts via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.email_alerts}
                    onChange={(e) => handleNotificationChange('email_alerts', e.target.checked)}
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* System Maintenance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">System Maintenance</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cache Size: {settings.cache_size_mb || 0} MB
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cached Files: {settings.cache_file_count || 0}
                </p>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const token = fetchToken();
                      const response = await fetch(`${API_BASE_URL}/api/maintenance/clear-cache`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });

                      if (!response.ok) {
                        throw new Error('Failed to clear cache');
                      }

                      const result = await response.json();
                      
                      // Update cache stats in settings
                      setSettings(prev => ({
                        ...prev,
                        cache_size_mb: 0,
                        cache_file_count: 0
                      }));

                      // Show success message with details
                      alert(`Cache cleared successfully!\nFreed up: ${result.before_clearing.size_mb} MB\nCleared files: ${result.before_clearing.file_count}`);
                    } catch (error) {
                      console.error('Failed to clear cache:', error);
                      alert('Failed to clear cache: ' + error.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear Cache</span>
                </button>
                <button 
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const token = fetchToken();
                      const response = await fetch(`${API_BASE_URL}/api/maintenance/refresh`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });

                      if (!response.ok) {
                        throw new Error('Failed to refresh system');
                      }

                      const result = await response.json();
                      
                      // Show success message with operations performed
                      alert(`System refreshed successfully!\nOperations performed:\n${result.operations_performed.join('\n')}`);
                    } catch (error) {
                      console.error('Failed to refresh system:', error);
                      alert('Failed to refresh system: ' + error.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh System</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
