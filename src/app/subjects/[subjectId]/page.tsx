'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FiArrowLeft,
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
  FiLock,
  FiChevronRight
} from 'react-icons/fi';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';

// Import the subjects data
import subjectsData from '@/data/subjects.json';

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
  FiSettings
};

const SubjectBranchesPage = () => {
  const router = useRouter();
  const { subjectId } = useParams();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Find the subject by slug from the URL
      const foundSubject = subjectsData.subjects.find(
        (s: Subject) => s.slug === subjectId
      );

      if (!foundSubject) {
        setError('Subject not found');
        setLoading(false);
        return;
      }

      // Filter branches to only include visible ones and sort by order
      const visibleBranches = foundSubject.branches
        .filter(branch => branch.isVisible)
        .sort((a, b) => a.order - b.order);
      
      setSubject(foundSubject);
      setBranches(visibleBranches);
      setLoading(false);
    } catch (err) {
      console.error('Error loading subject:', err);
      setError('Failed to load subject. Please try again later.');
      setLoading(false);
    }
  }, [subjectId]);

  // Function to render icon component dynamically
  const renderIcon = (iconName: string) => {
    const IconComponent = iconComponents[iconName];
    return IconComponent ? <IconComponent className="text-2xl" /> : <FiBookOpen className="text-2xl" />;
  };

  // Function to get a color based on branch ID for consistent theming
  const getBranchColor = (id: string) => {
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

  // Function to calculate progress (mock implementation)
  const calculateProgress = (branchId: string) => {
    // This is a mock implementation
    const progressMap: Record<string, number> = {
      'branch_001': 75,
      'branch_002': 45,
      'branch_003': 30,
      'branch_004': 10,
      'branch_005': 5,
      'branch_006': 20,
    };
    return progressMap[branchId] || 0;
  };

  // Function to count total chapters in a branch
  const countChapters = (branch: Branch) => {
    return branch.chapters.length;
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

  if (error || !subject) {
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
                    <p className="text-sm text-red-700">{error || 'Subject not found'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] focus:outline-none"
                >
                  <FiArrowLeft className="mr-2 h-4 w-4" />
                  Back to Subjects
                </button>
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
              <div className="flex items-center mb-4">
                {/* <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Go back"
                >
                  <FiArrowLeft className="h-5 w-5 text-gray-600" />
                </button> */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    {subject.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Branches</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Select a branch to explore chapters and topics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {branches.map((branch) => {
                const progress = calculateProgress(branch.id);
                const chapterCount = countChapters(branch);
                const color = getBranchColor(branch.id);
                const IconComponent = iconComponents[branch.icon] || FiBookOpen;
                
                return (
                  <div 
                    key={branch.id}
                    className={`relative bg-white rounded-xl shadow-sm transition-all duration-300 ${
                      branch.isActive 
                        ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer' 
                        : 'opacity-90 cursor-not-allowed'
                    }`}
                  >
                    <Link 
                      href={branch.isActive ? `/subjects/${subject.slug}/${branch.slug}` : '#'}
                      className="block"
                    >
                      {!branch.isActive && (
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
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 ${branch.isActive ? color : 'bg-gray-400'} rounded-lg flex items-center justify-center text-white mr-4`}>
                            <IconComponent className="text-2xl" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className={`text-lg font-semibold mb-1 ${branch.isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {branch.name}
                              </h3>
                              <FiChevronRight className={`h-5 w-5 ${branch.isActive ? 'text-gray-400' : 'text-gray-300'}`} />
                            </div>
                            <p className={`text-sm ${branch.isActive ? 'text-gray-600' : 'text-gray-400'} mb-4`}>
                              {branch.description}
                            </p>
                            
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-full rounded-full ${branch.isActive ? color : 'bg-gray-400'}`} 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{chapterCount} chapters</span>
                              {branch.isActive && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Continue
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectBranchesPage;
