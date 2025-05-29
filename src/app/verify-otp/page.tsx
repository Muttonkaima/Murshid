'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import OtpInput from '@/components/OtpInput';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState('');

  // Handle OTP verification
  const handleVerifyOtp = useCallback(async (otp: string) => {
    if (otp.length !== 6) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const type = searchParams?.get('type') || 'reset';
      console.log('Verifying OTP:', { email, type });
      
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          type
        }),
      });
      
      const data = await response.json();
      console.log('OTP Verification Response:', data);
      
      if (!response.ok) {
        const errorMessage = data.message || 'Failed to verify OTP';
        console.error('OTP Verification Error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Store verification token in session storage
      if (data.token) {
        console.log('Storing verification token');
        sessionStorage.setItem('verificationToken', data.token);
      }
      
      // Redirect to set-password page with the email and type
      router.push(`/set-password?email=${encodeURIComponent(email)}&type=${type}`);
      
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to verify OTP. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid or expired OTP') || 
            error.message.includes('OTP has expired') ||
            error.message.includes('OTP not found')) {
          errorMessage = 'Invalid or expired OTP. Please request a new one.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email. Please sign up.';
        } else if (error.message.includes('Please request a new OTP')) {
          errorMessage = 'This OTP has expired. Please request a new one.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, router, searchParams]);

  // Handle resend OTP
  const handleResendOtp = useCallback(async () => {
    if (resendDisabled) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const type = searchParams?.get('type') || 'reset';
      console.log('Resending OTP to:', { email, type });
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          type,
          // Include user data if available in session storage for signup flow
          ...(type === 'signup' && {
            ...JSON.parse(sessionStorage.getItem('signupData') || '{}')
          })
        }),
      });
      
      const data = await response.json();
      console.log('Resend OTP Response:', data);
      
      if (!response.ok) {
        let errorMessage = data.message || 'Failed to resend OTP';
        console.error('Resend OTP Error:', errorMessage);
        
        // Handle specific error cases for resend
        if (errorMessage.includes('Please wait before requesting a new OTP')) {
          errorMessage = 'Please wait before requesting a new OTP. Try again in a few minutes.';
        } else if (errorMessage.includes('User not found')) {
          errorMessage = 'No account found with this email. Please sign up.';
        } else if (errorMessage.includes('maximum attempts')) {
          errorMessage = 'Too many attempts. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }
      
      // Start countdown
      setResendDisabled(true);
      setCountdown(30);
      
      toast.success('OTP resent successfully!');
      console.log('OTP resent successfully');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
    
    try {
      // Simulate API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically call your backend to resend the OTP
      // await fetch('/api/resend-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Reset countdown
      setCountdown(30);
      setResendDisabled(true);
      
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, resendDisabled]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (!resendDisabled) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOtp(otp);
    }
  }, [otp, handleVerifyOtp]);

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
                Verify Your Email
              </h2>
              <p className="text-gray-600">
                Enter the 6-digit code sent to <span className="font-medium">{email || 'your email'}</span>
              </p>
            </div>

            <div className="mb-8">
              <OtpInput
                length={6}
                onOtpChange={setOtp}
                disabled={isLoading}
                className="mb-8"
              />
              
              <div className="text-center">
                <button
                  onClick={() => handleVerifyOtp(otp)}
                  disabled={otp.length !== 6 || isLoading}
                  className={`w-full py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-colors duration-200 ${
                    otp.length === 6 && !isLoading
                      ? 'bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]'
                      : 'bg-[var(--primary-color)] cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendOtp}
                  disabled={resendDisabled || isLoading}
                  className={`font-medium ${
                    !resendDisabled && !isLoading
                      ? 'text-[var(--primary-color)] hover:text-[var(--primary-hover)] cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {resendDisabled ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-4">
                The code will expire in 10 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
