'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const isAuthenticated = authService.isAuthenticated();
      const isOnboarded = authService.isOnboarded();
      
      if (!isAuthenticated) {
        // Store the current URL for redirecting after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.push('/login');
      }
      if (isAuthenticated && !isOnboarded) {
        router.push('/onboarding');
      }
    }
  }, [router]);

  // Show a loading state while checking authentication
  if (typeof window === 'undefined' || !authService.isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
