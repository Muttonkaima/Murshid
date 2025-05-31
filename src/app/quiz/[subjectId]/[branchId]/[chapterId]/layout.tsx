import { Metadata } from 'next';
import AuthCheck from '@/components/AuthCheck';

export const metadata: Metadata = {
  title: 'Quiz | Murshid',
  description: 'Your personalized quiz',
};

export default function QuizLayout({
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
