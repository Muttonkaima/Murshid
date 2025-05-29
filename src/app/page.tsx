import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <main className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Welcome to Murshid
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Your personal guide to better learning and development. Sign in to access your dashboard and continue your journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
          >
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200 text-center"
          >
            Create Account
          </Link>
        </div>
      </main>
    </div>
  );
}
