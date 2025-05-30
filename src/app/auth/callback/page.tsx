'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const userParam = searchParams.get('user');
  const error = searchParams.get('error');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // If there's an error, show it and redirect to login
        if (error) {
          const errorMessage = decodeURIComponent(error);
          
          // Show error message
          toast.error(errorMessage);
          
          // Redirect to login after a short delay to show the toast
          setTimeout(() => {
            router.push('/login');
          }, 100);
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
          
          // Show success message
          toast.success('Successfully signed in!');
          
          // Redirect to the desired page
          window.location.href = redirectPath;
          
        } catch (storageError) {
          console.error('Error storing authentication data:', storageError);
          throw new Error('Failed to complete authentication. Please try again.');
        }
        
      } catch (err) {
        console.error('Authentication error:', err);
        // Show error toast and redirect to login
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        toast.error(errorMessage);
        
        // Redirect to login after a short delay to show the toast
        setTimeout(() => {
          router.push('/login');
        }, 100);
      }
    };

    handleAuthCallback();
  }, [token, userParam, error, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Completing authentication...</h2>
        <p className="mt-2 text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
