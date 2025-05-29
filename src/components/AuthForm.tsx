'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaArrowLeft, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const sendOTP = async (email: string, type: 'signup' | 'reset') => {
    try {
      setIsLoading(true);
      console.log('Sending OTP to:', email);
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type,
          ...(type === 'signup' && {
            firstName: formData.firstName,
            lastName: formData.lastName
          })
        }),
      });

      const data = await response.json();
      console.log('OTP Response:', data);

      if (!response.ok) {
        // If we get a 400 error with a message about email in use, handle it specially
        if (response.status === 400 && data.message?.includes('already in use')) {
          throw new Error('This email is already registered. Please login instead.');
        }
        throw new Error(data.message || 'Failed to send OTP. Please try again.');
      }

      toast.success('OTP sent successfully! Check your email.');
      return data;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error instanceof TypeError) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Handle login
      if (!formData.email || !formData.password) {
        toast.error('Please enter both email and password');
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          // If user needs to verify email, redirect to verify-otp
          if (data.code === 'EMAIL_NOT_VERIFIED') {
            // Send OTP before redirecting
            await sendOTP(formData.email, 'signup');
            // Store email for verification
            sessionStorage.setItem('signupData', JSON.stringify({ email: formData.email }));
            router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=signup`);
            return;
          }
          throw new Error(data.message || 'Login failed');
        }
        
        // Store the token and user data using authService
        if (data.token) {
          // Use authService to handle the login
          await authService.login({
            email: formData.email,
            password: formData.password
          });
          // Redirect to dashboard or home page
          router.push('/dashboard');
        }
        
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Default error message
        let errorMessage = 'Login failed. Please try again.';
        let errorCode = '';
        
        // Try to extract error details from response if available
        if (error.response) {
          const { data } = error.response;
          console.log('Error response data:', data);
          
          if (data && data.message) {
            errorMessage = data.message;
            errorCode = data.code || '';
          }
        } else if (error.message) {
          // Handle error message from the error object
          errorMessage = error.message;
        }
        
        // Map specific error messages
        if (errorMessage.toLowerCase().includes('incorrect') || 
            errorMessage.toLowerCase().includes('invalid credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage.toLowerCase().includes('verify your email')) {
          // If email not verified, send OTP and redirect to verification
          try {
            await sendOTP(formData.email, 'signup');
            sessionStorage.setItem('signupData', JSON.stringify({ 
              email: formData.email,
              password: formData.password 
            }));
            router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=signup`);
            return;
          } catch (otpError) {
            console.error('Error sending verification OTP:', otpError);
            errorMessage = 'Please verify your email. ' + 
              (otpError instanceof Error ? otpError.message : 'Failed to send verification email.');
          }
        } else if (errorMessage.toLowerCase().includes('not found')) {
          errorMessage = 'No account found with this email. Please sign up.';
        }
        
        console.log('Displaying error to user:', errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle registration
      if (!formData.email || !formData.firstName || !formData.lastName) {
        toast.error('Please fill in all fields');
        return;
      }
      
      try {
        setIsLoading(true);
        
        // First check if user already exists and if their email is verified
        const checkUserResponse = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            checkVerified: true
          }),
        });

        if (!checkUserResponse.ok) {
          const errorData = await checkUserResponse.json();
          throw new Error(errorData.message || 'Failed to check email. Please try again.');
        }

        const checkUserData = await checkUserResponse.json();

        if (checkUserData.exists) {
          if (checkUserData.isVerified) {
            throw new Error('This email is already registered and verified. Please login instead.');
          } else {
            // User exists but email is not verified
            // Pre-fill the form with existing user data if available
            if (checkUserData.user) {
              setFormData(prev => ({
                ...prev,
                firstName: checkUserData.user.firstName || prev.firstName,
                lastName: checkUserData.user.lastName || prev.lastName
              }));
            }
            // Continue with OTP sending
          }
        }

        // If user doesn't exist or exists but not verified, proceed with OTP sending
        await sendOTP(formData.email, 'signup');
        
        // Store user data in session storage for after OTP verification
        const userData = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password // Include password for final signup after OTP verification
        };
        sessionStorage.setItem('signupData', JSON.stringify(userData));
        
        // Redirect to verify-otp page with email as query param
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=signup`);
        
      } catch (error: any) {
        console.error('Error during signup:', error);
        toast.error(error.message || 'Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleBackToSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotPassword(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // First check if user exists and is verified
      const checkUserResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          checkVerified: true
        }),
      });

      if (!checkUserResponse.ok) {
        const errorData = await checkUserResponse.json();
        throw new Error(errorData.message || 'Failed to verify email. Please try again.');
      }

      const checkUserData = await checkUserResponse.json();

      if (!checkUserData.exists) {
        throw new Error('No account found with this email. Please sign up.');
      }

      if (!checkUserData.isVerified) {
        throw new Error('This email is not verified. Please verify your email first.');
      }

      // If user exists and is verified, send OTP for password reset
      await sendOTP(formData.email, 'reset');
      
      // Store email in session storage for after OTP verification
      sessionStorage.setItem('resetEmail', formData.email);
      
      // Redirect to verify-otp page with email and reset flag
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=reset`);
      
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to proceed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Forgot Password?
                </h2>
                <p className="text-gray-600">
                  Enter your email to receive a password reset OTP
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                    placeholder="Enter Your Email Address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    onClick={handleBackToSignIn}
                    className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Remember password? <span className="font-medium">Sign in</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Login/Register View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isLogin ? 'Welcome Back!' : 'Create an Account'}
              </h2>
              <p className="text-gray-600">
                {isLogin ? 'Sign in to your account' : 'Fill in your details to get started'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                        placeholder="First Name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="Enter Your Email Address"
                  required
                />
              </div>

              {isLogin && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                      placeholder="Enter Your Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <a 
                    href="#" 
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[var(--primary-color)] hover:text-[var(--primary-hover)] cursor-pointer"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {isLogin ? 'Signing in...' : 'Sending OTP...'}
                  </>
                ) : (
                  isLogin ? 'Sign in' : 'Create Account'
                )}
              </button>
              


              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-colors duration-200 cursor-pointer"
                >
                  <FcGoogle className="w-5 h-5 mr-2" />
                  {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={toggleForm}
                  className="font-medium text-[var(--primary-color)] hover:text-[var(--primary-hover)] focus:outline-none cursor-pointer"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-gray-600 mt-6">
          By proceeding, you agree to our{' '}
          <a href="#" className="text-[var(--primary-color)] hover:underline font-medium cursor-pointer">Terms of Service</a> and{' '}
          <a href="#" className="text-[var(--primary-color)] hover:underline font-medium cursor-pointer">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
