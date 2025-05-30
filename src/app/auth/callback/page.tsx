'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const userParam = searchParams.get('user');
  const error = searchParams.get('error');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (error) {
          throw new Error(decodeURIComponent(error));
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

        // Use authService to handle the authentication
        authService.handleAuthentication(token, userData);
        
      } catch (err) {
        console.error('Authentication error:', err);
        // Redirect to login with error message
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        window.location.href = `/login?error=${encodeURIComponent(errorMessage)}`;
      }
    };

    handleAuthCallback();
  }, [token, userParam, error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Completing authentication...</h2>
        <p className="mt-2 text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
