'use client';

import { useState } from 'react';
import { FiUser, FiLock, FiBell, FiMoon, FiSun, FiGlobe, FiCreditCard, FiShield, FiHelpCircle } from 'react-icons/fi';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newsletter: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const settingsSections = [
    {
      id: 'account',
      icon: <FiUser className="mr-3" />,
      title: 'Account',
      description: 'Update your account information',
    },
    {
      id: 'security',
      icon: <FiLock className="mr-3" />,
      title: 'Security',
      description: 'Change password and security settings',
    },
    {
      id: 'notifications',
      icon: <FiBell className="mr-3" />,
      title: 'Notifications',
      description: 'Manage your notification preferences',
    },
    {
      id: 'appearance',
      icon: darkMode ? <FiMoon className="mr-3" /> : <FiSun className="mr-3" />,
      title: 'Appearance',
      description: 'Customize the look and feel',
    },
    {
      id: 'language',
      icon: <FiGlobe className="mr-3" />,
      title: 'Language',
      description: 'Set your preferred language',
    },
    {
      id: 'billing',
      icon: <FiCreditCard className="mr-3" />,
      title: 'Billing',
      description: 'Manage your subscription',
    },
    {
      id: 'privacy',
      icon: <FiShield className="mr-3" />,
      title: 'Privacy',
      description: 'Control your privacy settings',
    },
    {
      id: 'help',
      icon: <FiHelpCircle className="mr-3" />,
      title: 'Help & Support',
      description: 'Get help and contact support',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue="Mithun Gowda H"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="tandoori.chakna@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+91 7899238398"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900"
                />
              </div>
              <button className="mt-4 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white px-6 py-2 rounded-lg transition-colors cursor-pointer">
                Save Changes
              </button>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div>
                    <h3 className="font-medium capitalize text-gray-900">{key} Notifications</h3>
                    <p className="text-sm text-gray-900">
                      {key === 'email' && 'Receive email notifications'}
                      {key === 'push' && 'Receive push notifications'}
                      {key === 'newsletter' && 'Subscribe to our newsletter'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 ${value ? 'bg-[var(--primary-color)]' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div>
                  <h3 className="font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-900">Switch between light and dark theme</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 ${darkMode ? 'bg-[var(--primary-color)]' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium mb-2 text-gray-900">Theme Color</h3>
                <div className="flex space-x-3">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'].map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        // This would update the primary color in your theme
                        document.documentElement.style.setProperty('--primary-color', color);
                        document.documentElement.style.setProperty('--primary-hover', `${color}CC`);
                      }}
                    >
                      {color === '#10B981' && (
                        <span className="text-white">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">{settingsSections.find(s => s.id === activeTab)?.title}</h2>
            <p className="text-gray-900 text-center max-w-md">
              {settingsSections.find(s => s.id === activeTab)?.description}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-900">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Sidebar Navigation */}
            <div className="md:w-64 border-r border-gray-200 bg-gray-50">
              <nav className="p-4 space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      activeTab === section.id
                        ? 'bg-[var(--primary-color)] bg-opacity-10 text-white'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {section.icon}
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              <div className="max-w-2xl">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
