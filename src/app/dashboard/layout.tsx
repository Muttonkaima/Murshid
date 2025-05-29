import { Metadata } from 'next';
import AuthCheck from '@/components/AuthCheck';

export const metadata: Metadata = {
  title: 'Dashboard | Murshid',
  description: 'Your personalized learning dashboard',
};

export default function DashboardLayout({
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
