"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEye, FaEyeSlash, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { authService } from '@/services/authService';

interface PasswordRules {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
}

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'reset';
  const token = searchParams.get('token') || '';

  // Verify tokens exist and match
  useEffect(() => {
    const verificationToken = sessionStorage.getItem('verificationToken');
    if (!token || !verificationToken || token !== verificationToken) {
      toast.error('Invalid or expired verification link');
      router.push('/login');
    }
  }, [token, router]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rules, setRules] = useState<PasswordRules>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Check password against all rules
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/.test(password);
    const passwordsMatch = password === confirmPassword && password !== '';

    setRules({
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      passwordsMatch,
    });

    // Check if all rules are satisfied
    setIsFormValid(
      minLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar &&
      passwordsMatch
    );
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsLoading(true);
    
    try {
      console.log('Setting up password for:', { email, type });
      
      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          passwordConfirm: confirmPassword
        }),
      });
      
      const data = await response.json();
      console.log('Setup password response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to set password');
      }
      
      // Store the token and user data using authService
      if (data.token) {
        // Store the token
        localStorage.setItem('token', data.token);
        
        // Use authService to store user data if provided
        if (data.data?.user) {
          authService.storeUserData(data.data.user);
        }
      }
      
      // Clear stored data
      sessionStorage.removeItem('verificationToken');
      sessionStorage.removeItem('signupData');
      sessionStorage.removeItem('resetEmail');
      
      // Show success message
      toast.success('Password set successfully!');
      
      // Redirect to dashboard or login based on auth state
      if (data.token) {
        // If we have a token, redirect to dashboard
        router.push('/dashboard');
      } else {
        // Otherwise, go to login
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Error setting password:', error);
      alert(error.message || 'Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const RuleItem = ({ valid, text }: { valid: boolean; text: string }) => {
    if (valid) return null;
    
    return (
      <li className="flex items-center text-sm text-gray-600">
        <span className="w-5 h-5 flex items-center justify-center mr-2">
          <FaCheck className="text-red-500" />
        </span>
        {text}
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6 focus:outline-none cursor-pointer"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {type === 'signup' ? 'Create Your Password' : 'Reset Your Password'}
              </h2>
              <p className="text-gray-600">
                {type === 'signup' 
                  ? 'Create a strong password to secure your account'
                  : 'Enter your new password below'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 pr-10"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                <ul className="space-y-1">
                  <RuleItem valid={rules.minLength} text="At least 8 characters" />
                  <RuleItem valid={rules.hasUppercase} text="At least one uppercase letter" />
                  <RuleItem valid={rules.hasLowercase} text="At least one lowercase letter" />
                  <RuleItem valid={rules.hasNumber} text="At least one number" />
                  <RuleItem valid={rules.hasSpecialChar} text="At least one special character" />
                  <RuleItem 
                    valid={rules.passwordsMatch} 
                    text={password ? "Passwords match" : "Passwords must match"} 
                  />
                </ul>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isFormValid ? 'bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] cursor-pointer' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-colors duration-200`}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">↻</span>
                    {type === 'signup' ? 'Creating Account...' : 'Resetting Password...'}
                  </>
                ) : (
                  type === 'signup' ? 'Create Account' : 'Reset Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
