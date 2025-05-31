import { Metadata } from 'next';
import AuthCheck from '@/components/AuthCheck';

export const metadata: Metadata = {
  title: 'Settings | Murshid',
  description: 'Your personalized settings',
};

export default function SettingsLayout({
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
