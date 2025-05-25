'use client';

import { useParams } from 'next/navigation';

const QuizPage = () => {
  const { subjectId, branchId, chapterId } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:w-64 w-full md:fixed md:inset-y-0 md:h-screen z-30">
        {/* Sidebar content will go here */}
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Page</h1>
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-lg text-gray-600">This is a quiz page for:</p>
              <p className="text-xl font-medium text-[var(--primary-color)] mt-2">
                Subject: {subjectId}<br />
                Branch: {branchId}<br />
                Chapter: {chapterId}
              </p>
              <p className="mt-6 text-gray-500">
                Quiz functionality will be implemented here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;