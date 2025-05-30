'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { toast, ToastContainer } from 'react-toastify';
import Image from 'next/image';
import Head from 'next/head';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const userParam = searchParams.get('user');
  const error = searchParams.get('error');
  const [status, setStatus] = useState<StatusType>('processing');
  const [message, setMessage] = useState('Authenticating your account...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // If there's an error, show it and redirect to login
        if (error) {
          const errorMessage = decodeURIComponent(error);
          setStatus('error');
          setMessage(errorMessage);
          
          // Show error message
          toast.error(errorMessage);
          
          // Redirect to login after a delay
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        if (!token || !userParam) {
          throw new Error('Authentication failed. Missing token or user data.');
        }

        // Parse the user data
        let userData;
        try {
          userData = JSON.parse(decodeURIComponent(userParam));
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          throw new Error('Invalid user data received');
        }
        
        try {
          setMessage('Finalizing your session...');
          
          // Store the token in cookies
          const cookieOptions = {
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          };
          
          document.cookie = `token=${token}; ${Object.entries(cookieOptions)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ')}`;
          
          // Store the token in localStorage
          localStorage.setItem('token', token);
          
          // Store user data in localStorage
          authService.storeUserData(userData);
          
          // Get the redirect URL from localStorage or default to '/dashboard'
          const redirectPath = localStorage.getItem('redirectAfterAuth') || '/dashboard';
          localStorage.removeItem('redirectAfterAuth');
          
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Show success message
          toast.success('Successfully signed in!');
          
          // Redirect to the desired page after a short delay
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 1500);
          
        } catch (storageError) {
          console.error('Error storing authentication data:', storageError);
          throw new Error('Failed to complete authentication. Please try again.');
        }
        
      } catch (err) {
        console.error('Authentication error:', err);
        setStatus('error');
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setMessage(errorMessage);
        
        toast.error(errorMessage);
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [error, router, token, userParam]);

  type StatusType = 'processing' | 'success' | 'error';

  const statusColors: Record<StatusType, string> = {
    processing: 'text-blue-600',
    success: 'text-green-600',
    error: 'text-red-600'
  };

  const statusIcons: Record<StatusType, ReactNode> = {
    processing: (
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    ),
    success: (
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    error: (
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    )
  };

  return (
    <>
      <Head>
        <title>{status === 'error' ? 'Authentication Error' : 'Authenticating...'}</title>
        <meta name="description" content="Completing authentication process" />
      </Head>
      
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
          <div className="bg-[var(--primary-color)] p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-2 rounded-full">
                <Image 
                  src="/images/favicon.png" 
                  alt="Logo" 
                  width={48} 
                  height={48} 
                  className="w-16 h-16 object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {status === 'error' ? 'Authentication Error' : 'Authenticating...'}
            </h1>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              {statusIcons[status as StatusType]}
              <div className="text-center">
                <p className={`text-lg font-medium ${statusColors[status as StatusType]} mb-2`}>
                  {status === 'processing' && 'Please wait'}
                  {status === 'success' && 'Success!'}
                  {status === 'error' && 'Something went wrong'}
                </p>
                <p className="text-gray-600">{message}</p>
              </div>
              
              {status === 'processing' && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                  <div className="bg-[var(--primary-color)] h-2.5 rounded-full animate-pulse w-3/4"></div>
                </div>
              )}
              
              {status === 'error' && (
                <button
                  onClick={() => router.push('/login')}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Back to Login
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-sm text-gray-500">
              Having trouble?{' '}
              <a href="/contact" className="text-blue-600 hover:underline">Contact support</a>
            </p>
          </div>
        </div>
      </div>
      
      <ToastContainer position="top-center" autoClose={5000} />
    </>
  );
}
