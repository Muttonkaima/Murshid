import { Metadata } from 'next';
import AuthCheck from '@/components/AuthCheck';

export const metadata: Metadata = {
  title: 'My Profile | Murshid',
  description: 'Your personalized profile',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </AuthCheck>
  );
}
