'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiArrowLeft, FiUser, FiLock, FiBell, FiMoon, FiSun, FiGlobe, FiCreditCard, FiShield, FiHelpCircle, FiEye, FiEyeOff } from 'react-icons/fi';

const SettingsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#10B981'); // Default theme color
  const [language, setLanguage] = useState('en');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newsletter: false,
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    emailVisibility: 'private',
    activityStatus: true
  });
  
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password validation states
  const [passwordErrors, setPasswordErrors] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });
  
  // Check if new password meets all requirements
  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password);
    const passwordsMatch = confirmPassword ? password === confirmPassword : false;
    
    setPasswordErrors({
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      passwordsMatch
    });
    
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };
  
  // Check if confirm password matches new password
  const validateConfirmPassword = (confirmPass: string) => {
    const passwordsMatch = newPassword === confirmPass;
    setPasswordErrors(prev => ({
      ...prev,
      passwordsMatch
    }));
    return passwordsMatch;
  };
  
  // Check if all password requirements are met
  const isPasswordValid = () => {
    return (
      passwordErrors.hasMinLength &&
      passwordErrors.hasUpperCase &&
      passwordErrors.hasLowerCase &&
      passwordErrors.hasNumber &&
      passwordErrors.hasSpecialChar &&
      passwordErrors.passwordsMatch
    );
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ml', name: 'മലയാളം' },
  ];

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="tandoori.chakna@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  defaultValue="+91 7899238398"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none text-gray-900"
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-[var(--primary-color)]' : 'bg-gray-200'} cursor-pointer`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`}
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${darkMode ? 'bg-[var(--primary-color)]' : 'bg-gray-200'} cursor-pointer`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium mb-2 text-gray-900">Theme Color</h3>
                <div className="flex space-x-3">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'].map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[var(--primary-color)] ${selectedColor === color ? 'ring-2 ring-offset-1 ring-gray-400' : ''} cursor-pointer`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        // Update the primary color in your theme
                        document.documentElement.style.setProperty('--primary-color', color);
                        document.documentElement.style.setProperty('--primary-hover', `${color}CC`);
                        setSelectedColor(color);
                      }}
                    >
                      {selectedColor === color && (
                        <span className="text-white font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none text-gray-900"
                        placeholder="Enter current password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewPassword(value);
                          validatePassword(value);
                          // Re-validate confirm password when new password changes
                          if (confirmPassword) {
                            validateConfirmPassword(confirmPassword);
                          }
                        }}
                        className={`w-full px-4 py-2 pr-10 border ${newPassword ? (passwordErrors.hasMinLength && passwordErrors.hasUpperCase && passwordErrors.hasLowerCase && passwordErrors.hasNumber && passwordErrors.hasSpecialChar ? 'border-green-500' : 'border-red-500') : 'border-gray-300'} rounded-lg focus:outline-none text-gray-900`}
                        placeholder="Enter new password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-2 text-sm space-y-1">
                        <p className={`flex items-center ${passwordErrors.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-1">{passwordErrors.hasMinLength ? '✓' : '•'}</span>
                          At least 8 characters
                        </p>
                        <p className={`flex items-center ${passwordErrors.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-1">{passwordErrors.hasUpperCase ? '✓' : '•'}</span>
                          At least one uppercase letter
                        </p>
                        <p className={`flex items-center ${passwordErrors.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-1">{passwordErrors.hasLowerCase ? '✓' : '•'}</span>
                          At least one lowercase letter
                        </p>
                        <p className={`flex items-center ${passwordErrors.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-1">{passwordErrors.hasNumber ? '✓' : '•'}</span>
                          At least one number
                        </p>
                        <p className={`flex items-center ${passwordErrors.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-1">{passwordErrors.hasSpecialChar ? '✓' : '•'}</span>
                          At least one special character (!@#$%^&*)
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          const value = e.target.value;
                          setConfirmPassword(value);
                          validateConfirmPassword(value);
                        }}
                        className={`w-full px-4 py-2 pr-10 border ${confirmPassword ? (passwordErrors.passwordsMatch ? 'border-green-500' : 'border-red-500') : 'border-gray-300'} rounded-lg focus:outline-none text-gray-900`}
                        placeholder="Confirm new password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {confirmPassword && !passwordErrors.passwordsMatch && (
                      <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                    )}
                    {confirmPassword && passwordErrors.passwordsMatch && (
                      <p className="mt-1 text-sm text-green-600">Passwords match!</p>
                    )}
                  </div>
                  <button 
                    className={`mt-4 px-6 py-2 rounded-lg transition-colors ${isPasswordValid() ? 'bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    disabled={!isPasswordValid()}
                    onClick={() => {
                      if (isPasswordValid()) {
                        // Handle password update logic here
                        alert('Password updated successfully!');
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordErrors({
                          hasMinLength: false,
                          hasUpperCase: false,
                          hasLowerCase: false,
                          hasNumber: false,
                          hasSpecialChar: false,
                          passwordsMatch: false
                        });
                      }
                    }}
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Authentication</h4>
                    <p className="text-sm text-gray-600">Use your phone to verify your identity</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-[var(--primary-color)] cursor-pointer">
                    Enable
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Authenticator App</h4>
                    <p className="text-sm text-gray-600">Use an authenticator app for verification</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-[var(--primary-color)] cursor-pointer">
                    Setup
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
            <div className="space-y-4">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Profile Visibility</h3>
                <div className="space-y-3">
                  {['public', 'friends', 'private'].map((option) => (
                    <label key={option} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        checked={privacySettings.profileVisibility === option}
                        onChange={() => setPrivacySettings(prev => ({
                          ...prev,
                          profileVisibility: option as 'public' | 'friends' | 'private'
                        }))}
                        className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300"
                      />
                      <span className="capitalize text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Data & Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Activity Status</h4>
                      <p className="text-sm text-gray-600">Show when you're active on the app</p>
                    </div>
                    <button
                      onClick={() => setPrivacySettings(prev => ({
                        ...prev,
                        activityStatus: !prev.activityStatus
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacySettings.activityStatus ? 'bg-[var(--primary-color)]' : 'bg-gray-200'} cursor-pointer`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${privacySettings.activityStatus ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <button className="text-sm font-medium text-[var(--primary-color)] hover:underline cursor-pointer">
                      Request a copy of your data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Language Preferences</h2>
            <div className="space-y-4">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-900">App Language</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-4 border rounded-lg text-left transition-colors ${language === lang.code ? 'border-[var(--primary-color)] bg-[var(--primary-color)]' : 'border-gray-200 hover:border-gray-300'} cursor-pointer`}
                    >
                      <div className={`font-medium ${language === lang.code ? 'text-white' : 'text-gray-900'}`}>{lang.name}</div>
                      <div className={`text-sm ${language === lang.code ? 'text-white text-opacity-80' : 'text-gray-500'}`}>{lang.code.toUpperCase()}</div>
                      {language === lang.code && (
                        <div className="mt-2 text-sm text-white flex items-center">
                          <span className="mr-1">✓</span> Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Translation Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto-translate content</h4>
                      <p className="text-sm text-gray-600">Automatically translate posts in other languages</p>
                    </div>
                    <button 
                      onClick={() => setAutoTranslate(!autoTranslate)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoTranslate ? 'bg-[var(--primary-color)]' : 'bg-gray-200'} cursor-pointer`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${autoTranslate ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Help & Support</h2>
            <div className="space-y-4">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Help Center</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <FiHelpCircle className="text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Getting Started Guide</h4>
                      <p className="text-sm text-gray-600">Learn how to use our platform</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <FiHelpCircle className="text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">FAQs</h4>
                      <p className="text-sm text-gray-600">Find answers to common questions</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Contact Support</h3>
                <p className="text-gray-600 mb-4">Can't find what you're looking for? Our support team is here to help.</p>
                <button className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white px-6 py-2 rounded-lg transition-colors cursor-pointer">
                  Contact Support
                </button>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-4 text-gray-900">App Version</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">You're using the latest version of our app</p>
                    <p className="text-sm text-gray-500 mt-1">Version 2.4.1 (Build 421)</p>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white cursor-pointer">
                    Check for Updates
                  </button>
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
      {/* Back Button */}
      <button 
        onClick={() => router.push('/dashboard')}
        className="fixed top-4 left-4 flex items-center text-gray-600 hover:text-gray-900 bg-white p-2 rounded-full shadow-sm border border-gray-200 z-10 cursor-pointer"
        aria-label="Back to Dashboard"
      >
        <FiArrowLeft className="w-5 h-5" />
      </button>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
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
              <div className="max-w-2xl md:h-[50vh] overflow-y-auto pr-2">
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
