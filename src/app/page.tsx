'use client';

import dynamic from 'next/dynamic';

// Dynamically import the AuthForm component with SSR disabled to avoid hydration issues
const AuthForm = dynamic(
  () => import('@/components/AuthForm'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen">
      <AuthForm />
    </div>
  );
}
