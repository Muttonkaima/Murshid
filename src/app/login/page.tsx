'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check for success message in URL
    const message = searchParams?.get('message');
    const redirect = searchParams?.get('redirect');
    
    // If there's a redirect parameter, store it in session storage
    if (redirect) {
      sessionStorage.setItem('redirectAfterLogin', redirect);
      
      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('redirect');
      window.history.replaceState({}, '', url.toString());
    }
    
    // Show success message if present
    if (message) {
      toast.success(message);
      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
    
    // If user is already logged in, redirect to dashboard or the intended page
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      const redirectPath = redirect || '/dashboard';
      router.push(redirectPath);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen">
      <AuthForm />
    </div>
  );
}