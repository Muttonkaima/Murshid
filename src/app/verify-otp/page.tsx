'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, any 6-digit OTP is considered valid
      // In a real app, you would validate against your backend
      console.log('OTP verified successfully');
      
      // Redirect to set-password page with the email and type
      const type = searchParams?.get('type') || 'reset';
      router.push(`/set-password?email=${encodeURIComponent(email)}&type=${type}`);
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Invalid or expired OTP. Please try again.');
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
      
      // Show success message (in a real app, you might want to show a toast)
      alert('A new OTP has been sent to your email.');
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

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

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
