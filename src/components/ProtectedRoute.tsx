'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = authService.isAuthenticated();
    
    if (!isAuthenticated) {
      toast.error('Please log in to access this page');
      router.push('/login');
    }
  }, [router]);

  // Optionally show a loading state while checking auth
  if (typeof window === 'undefined') {
    return null;
  }

  return <>{children}</>;
}
