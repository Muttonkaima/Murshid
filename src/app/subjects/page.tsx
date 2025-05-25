'use client';

import { useState, useEffect } from 'react';
import { 
  FiLock, 
  FiBookOpen,
  FiBook,
  FiActivity,
  FiUsers,
  FiGlobe,
  FiClock,
  FiShield,
  FiDivideCircle,
  FiXSquare,
  FiTriangle,
  FiDroplet,
  FiSettings,
  FiFileText,
  FiMap,
  FiEdit
} from 'react-icons/fi';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';

// Import the subjects data
import subjectsData from '@/data/10/STATE/subjects/subjects.json';

// Define types for our data
interface Chapter {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  isVisible: boolean;
  order: number;
  topics: string[];
  branchId: string;
}

interface Branch {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  isVisible: boolean;
  order: number;
  chapters: Chapter[];
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  isVisible: boolean;
  order: number;
  branches: Branch[];
}

// Icon mapping for dynamic icon rendering
const iconComponents: { [key: string]: any } = {
  FiBookOpen,
  FiBook,
  FiActivity,
  FiUsers,
  FiGlobe,
  FiClock,
  FiShield,
  FiDivideCircle,
  FiXSquare,
  FiTriangle,
  FiDroplet,
  FiSettings,
  FiFileText,
  FiMap,
  FiEdit
};

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Filter subjects to only include visible ones and sort by order
      const visibleSubjects = subjectsData.subjects
        .filter(subject => subject.isVisible)
        .sort((a, b) => a.order - b.order);
      
      setSubjects(visibleSubjects);
      setLoading(false);
    } catch (err) {
      console.error('Error loading subjects:', err);
      setError('Failed to load subjects. Please try again later.');
      setLoading(false);
    }
  }, []);

  // Function to render icon component dynamically
  const renderIcon = (iconName: string) => {
    const IconComponent = iconComponents[iconName];
    return IconComponent ? <IconComponent className="text-2xl" /> : <FiBookOpen className="text-2xl" />;
  };

  // Function to get a color based on subject ID for consistent theming
  const getSubjectColor = (id: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500',
    ];
    const index = parseInt(id.split('_')[1]) % colors.length;
    return colors[index - 1] || 'bg-gray-500';
  };

  // Function to calculate progress (mock implementation - can be replaced with real progress data)
  const calculateProgress = (subjectId: string) => {
    // This is a mock implementation - in a real app, you would fetch the user's progress
    const progressMap: Record<string, number> = {
      'subj_001': 75,
      'subj_002': 45,
      'subj_003': 30,
      'subj_004': 10,
      'subj_005': 5,
      'subj_006': 20,
    };
    return progressMap[subjectId] || 0;
  };

  // Function to count total chapters in a subject
  const countChapters = (subject: Subject) => {
    return subject.branches.reduce((total, branch) => total + branch.chapters.length, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <div className="md:w-64 w-full md:fixed md:inset-y-0 md:h-screen z-30">
          <Sidebar />
        </div>
        <div className="flex-1 md:ml-64 mt-10">
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-48"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <div className="md:w-64 w-full md:fixed md:inset-y-0 md:h-screen z-30">
          <Sidebar />
        </div>
        <div className="flex-1 md:ml-64 mt-10">
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:w-64 w-full md:fixed md:inset-y-0 md:h-screen z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 mt-10">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
              <p className="mt-2 text-sm text-gray-600">
                Select a subject to start learning or continue your progress
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => {
                const progress = calculateProgress(subject.id);
                const chapterCount = countChapters(subject);
                const color = getSubjectColor(subject.id);
                const IconComponent = iconComponents[subject.icon] || FiBookOpen;
                
                return (
                  <Link 
                    key={subject.id}
                    href={subject.isActive ? `/subjects/${subject.slug}` : '#'}
                    className={`relative block bg-white rounded-xl shadow-sm transition-all duration-300 ${
                      subject.isActive 
                        ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer' 
                        : 'opacity-90 cursor-not-allowed'
                    }`}
                  >
                    {!subject.isActive && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 flex items-end justify-center z-10 rounded-xl pointer-events-none">
                        <div className="text-center p-4 w-full bg-gradient-to-t from-black/70 to-transparent">
                          <div className="flex items-center justify-center space-x-2">
                            <FiLock className="w-5 h-5 text-white/90" />
                            <span className="text-white/90 text-sm font-medium">Coming Soon</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className={`w-12 h-12 ${subject.isActive ? color : 'bg-gray-400'} rounded-lg flex items-center justify-center text-white mb-4`}>
                        <IconComponent className="text-2xl" />
                      </div>
                      <h3 className={`text-xl font-semibold mb-2 ${subject.isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                        {subject.name}
                      </h3>
                      <p className={`${subject.isActive ? 'text-gray-600' : 'text-gray-400'} mb-4`}>
                        {subject.description}
                      </p>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-full rounded-full ${subject.isActive ? color : 'bg-gray-400'}`} 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{chapterCount} chapters</span>
                        {subject.branches.length > 0 && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {subject.branches.length} branches
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;
