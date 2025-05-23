import { Metadata } from 'next';

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
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
