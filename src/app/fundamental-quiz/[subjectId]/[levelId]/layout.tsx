import { Metadata } from 'next';
import AuthCheck from '@/components/AuthCheck';

export const metadata: Metadata = {
  title: 'Fundamental Quiz | Murshid',
  description: 'Your personalized fundamental quiz',
};

export default function FundamentalQuizLayout({
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
