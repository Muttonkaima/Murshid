'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Utility function to format date to 'Month Day, Year' format
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};
import { FiArrowLeft, FiUser, FiLock, FiMail, FiBell, FiCreditCard, FiShield, FiGlobe, FiMoon, FiSun, FiHelpCircle, FiLogOut, FiEye, FiEyeOff, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Sidebar from '@/components/layout/Sidebar';
import authService from '@/services/authService';
import { color } from 'framer-motion';

const SettingsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState(''); // Default theme color
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const user = authService.getCurrentUser();
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
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={user?.firstName + ' ' + user?.lastName}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Signed up with</label>
                <input
                  type="text"
                  value={user?.authProvider}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email Verified</label>
                <input
                  type="text"
                  value={user?.isEmailVerified ? 'Yes' : 'No'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
                <input
                  type="text"
                  value={user?.role}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
                <input
                  type="text"
                  value={user?.onboarded ? 'Active' : 'Inactive'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                <input
                  type="text"
                  value={formatDate(user?.createdAt)}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Password Change</label>
                <input
                  type="text"
                  value={formatDate(user?.passwordChangedAt) || 'Never'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
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
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-[var(--primary-color)]' : 'bg-gray-200'} cursor-pointer`}
                      aria-label={`${value ? 'Disable' : 'Enable'} ${key} notifications`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
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
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${darkMode ? 'bg-[var(--primary-color)]' : 'bg-gray-200'} cursor-pointer`}
                    aria-label={darkMode ? 'Disable dark mode' : 'Enable dark mode'}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium mb-2 text-gray-900">Theme Color</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[var(--primary-color)] ${selectedColor === color ? 'ring-2 ring-offset-1 ring-gray-400' : ''} cursor-pointer`}
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
              {user?.authProvider === 'local' ? (
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
                    
                    {/* Success and error messages */}
                    {updateSuccess && (
                      <div className="p-3 mt-4 text-sm text-green-800 bg-green-100 rounded-lg">
                        Password updated successfully!
                      </div>
                    )}
                    
                    {updateError && (
                      <div className="p-3 mt-4 text-sm text-red-800 bg-red-100 rounded-lg">
                        {updateError}
                      </div>
                    )}
                  <div className="w-full mt-4">
                    <button 
                      className={`w-full py-2 px-4 text-base rounded-lg transition-colors flex items-center justify-center ${
                        isPasswordValid() && !isUpdating 
                          ? 'bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white cursor-pointer' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!isPasswordValid() || isUpdating}
                      onClick={async () => {
                        if (!isPasswordValid() || isUpdating) return;
                        
                        setUpdateError('');
                        setUpdateSuccess(false);
                        setIsUpdating(true);
                        
                        try {
                          await authService.updatePassword(currentPassword, newPassword);
                          
                          // Show success message
                          setUpdateSuccess(true);
                          
                          // Reset form
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
                          
                          // Hide success message after 5 seconds
                          setTimeout(() => setUpdateSuccess(false), 5000);
                        } catch (error: any) {
                          console.error('Error updating password:', error);
                          // Show error message from the server or a generic message
                          let errorMessage = 'Failed to update password. Please try again.';
                          
                          if (error.status === 401) {
                            errorMessage = 'The current password is incorrect. Please try again.';
                          } else if (error.message) {
                            errorMessage = error.message;
                          } else if (error.response?.data?.message) {
                            errorMessage = error.response.data.message;
                          }
                          
                          setUpdateError(errorMessage);
                        } finally {
                          setIsUpdating(false);
                        }
                      }}
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Account Security</h3>
                  <p className="text-gray-600">
                    You signed in with {user?.authProvider}. To manage your account security, please use the settings in your {user?.authProvider} account.
                  </p>
                </div>
              )}

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
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => setPrivacySettings(prev => ({
                          ...prev,
                          activityStatus: !prev.activityStatus
                        }))}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${privacySettings.activityStatus ? 'bg-[var(--primary-color)]' : 'bg-gray-200'} cursor-pointer`}
                        aria-label={privacySettings.activityStatus ? 'Disable activity status' : 'Enable activity status'}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${privacySettings.activityStatus ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
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
                  {languages.map((lang) => {
                    const isEnglish = lang.code === 'en';
                    const isSelected = language === lang.code;
                    const isDisabled = !isEnglish;
                    
                    return (
                      <div key={lang.code} className="relative">
                        <button
                          onClick={() => isEnglish && setLanguage(lang.code)}
                          disabled={isDisabled}
                          className={`w-full p-4 border rounded-lg text-left transition-colors ${
                            isSelected 
                              ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white' 
                              : isDisabled 
                                ? 'border-gray-200 bg-gray-50 text-gray-500' 
                                : 'border-gray-200 hover:border-gray-300 text-gray-900 cursor-pointer'
                          }`}
                        >
                          <div className="font-medium flex items-center">
                            {lang.name}
                            {isDisabled && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            {lang.code.toUpperCase()}
                          </div>
                          {isSelected && (
                            <div className="mt-2 text-sm text-white flex items-center">
                              <span className="mr-1">✓</span> Selected
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
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
                    <div className="flex-shrink-0">
                      <button 
                        onClick={() => setAutoTranslate(!autoTranslate)}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${autoTranslate ? 'bg-[var(--primary-color)]' : 'bg-gray-200'} focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[var(--primary-color)]`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${autoTranslate ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
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
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">You're using the latest version of our app</p>
                    <p className="text-sm text-gray-500 mt-1">Version 2.4.1 (Build 421)</p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <button className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-transparent hover:bg-gray-50 text-[var(--primary-color)] cursor-pointer">
                      Check for Updates
                    </button>
                  </div>
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

  // Get the current active section for mobile dropdown
  const activeSection = settingsSections.find(section => section.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-gray-900">Manage your account settings and preferences</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="md:flex">
              {/* Mobile Dropdown Navigation */}
              <div className="md:hidden p-4 border-b border-gray-200">
                <div className="relative">
                  <div className="flex items-center justify-between p-3 text-gray-900 border border-gray-300 rounded-lg bg-white cursor-pointer"
                    onClick={() => setOpenDropdown(openDropdown === 'mobile' ? null : 'mobile')}
                  >
                    <div className="flex items-center">
                      {activeSection?.icon}
                      <span className="ml-3 font-medium">{activeSection?.title}</span>
                    </div>
                    {openDropdown === 'mobile' ? 
                      <FiChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                  {openDropdown === 'mobile' && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {settingsSections.map((section) => (
                        <div
                          key={section.id}
                          onClick={() => {
                            setActiveTab(section.id);
                            setOpenDropdown(null);
                          }}
                          className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 ${
                            activeTab === section.id ? 'bg-[var(--primary-color)] bg-opacity-10 text-white' : 'text-gray-900'
                          }`}
                        >
                          <div className="flex items-center">
                            {section.icon}
                            <span className="ml-3">{section.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Sidebar Navigation */}
              <div className="hidden md:block md:w-64 border-r border-gray-200 bg-gray-50">
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
                      <span className="ml-3">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8">
                <div className="max-w-2xl md:h-[60vh] overflow-y-auto pr-2">
                  {renderTabContent()}
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
