'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success message in URL
    const message = searchParams?.get('message');
    if (message) {
      toast.success(message);
      // Clean up the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      <AuthForm />
    </div>
  );
}