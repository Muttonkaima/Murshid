'use client';

import { useState, useEffect } from 'react';
import { 
  FiLock, 
  FiUnlock, 
  FiBook, 
  FiAward, 
  FiZap, 
  FiClock, 
  FiBarChart2,  
  FiBookOpen,
  FiActivity,
  FiEdit3,
  FiGlobe,
  FiUsers,
  FiArchive 
} from 'react-icons/fi';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';

// Mock data for subjects
const subjects = [
  {
    id: 1,
    title: 'Mathematics',
    description: 'Learn numbers, logic, patterns, and problem solving',
    icon: <FiBookOpen className="text-2xl" />,
    progress: 75,
    isActive: true,
    lessons: 24,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Science',
    description: 'Discover the wonders of physics, chemistry, and biology',
    icon: <FiActivity className="text-2xl" />,
    progress: 45,
    isActive: true,
    lessons: 18,
    color: 'bg-green-500'
  },
  {
    id: 3,
    title: 'Kannada',
    description: 'Build fluency in reading, writing, and speaking Kannada',
    icon: <p className="text-2xl text-white font-bold">ಕ</p>,
    progress: 0,
    isActive: false,
    lessons: 15,
    color: 'bg-amber-500'
  },
  {
    id: 4,
    title: 'Hindi',
    description: 'Learn Hindi grammar, vocabulary, and conversations',
    icon: <p className="text-2xl text-white font-bold">ह</p>,
    progress: 0,
    isActive: false,
    lessons: 12,
    color: 'bg-purple-500'
  },
  {
    id: 5,
    title: 'Social Studies',
    description: 'Understand history, geography, civics, and culture',
    icon: <FiUsers className="text-2xl" />,
    progress: 30,
    isActive: true,
    lessons: 20,
    color: 'bg-red-500'
  },
];

const SubjectsPage = () => {
  const [activeSubjects, setActiveSubjects] = useState(subjects);
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
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
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar - Hidden on mobile, shown on md and up */}
      <div className="md:w-64 w-full md:fixed md:inset-y-0 md:h-screen z-30">
        <Sidebar />
      </div>
      
      {/* Main Content - Add left margin on md and up to account for sidebar */}
      <div className="flex-1 md:ml-64 mt-10">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Subjects</h1>
              <p className="text-gray-600">Select a subject to continue learning</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSubjects.map((subject) => (
            <Link 
              key={subject.id}
              href={subject.isActive ? `/subjects/${subject.id}` : '#'}
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
                      <span className="text-white/90 text-sm font-medium">Complete previous subjects to unlock</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className={`w-12 h-12 ${subject.isActive ? subject.color : 'bg-gray-400'} rounded-lg flex items-center justify-center ${subject.isActive ? 'text-white' : 'text-gray-200'} mb-4`}>
                  {subject.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${subject.isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                  {subject.title}
                </h3>
                <p className={`${subject.isActive ? 'text-gray-600' : 'text-gray-400'} mb-4`}>
                  {subject.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${subject.isActive ? subject.color : 'bg-gray-400'}`} 
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{subject.lessons} lessons</span>
                  
                </div>
              </div>
            </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;
