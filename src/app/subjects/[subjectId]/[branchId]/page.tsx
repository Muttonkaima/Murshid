'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FiArrowLeft,
  FiBook,
  FiCheckCircle,
  FiLock,
  FiChevronRight,
  FiPlayCircle,
  FiClock
} from 'react-icons/fi';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import QuizSettingsModal from '@/components/quiz/QuizSettingsModal';

// Import the subjects data
import subjectsData from '@/data/10/STATE/subjects/subjects.json';

// Define types
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

const BranchChaptersPage = () => {
  const router = useRouter();
  const { subjectId, branchId } = useParams();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  
  // Quiz settings modal state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<{id: string; title: string; slug: string} | null>(null);

  useEffect(() => {
    try {
      // Find the subject by slug
      const foundSubject = subjectsData.subjects.find(
        (s: Subject) => s.slug === subjectId
      );

      if (!foundSubject) {
        setError('Subject not found');
        setLoading(false);
        return;
      }

      // Find the branch by slug
      const foundBranch = foundSubject.branches.find(
        (b: Branch) => b.slug === branchId
      );

      if (!foundBranch) {
        setError('Branch not found');
        setLoading(false);
        return;
      }

      // Filter and sort chapters
      const visibleChapters = foundBranch.chapters
        .filter(chapter => chapter.isVisible)
        .sort((a, b) => a.order - b.order);
      
      // Load completed chapters from localStorage
      const savedCompleted = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('completedChapters') || '[]')
        : [];
      setCompletedChapters(new Set(savedCompleted));
      
      setSubject(foundSubject);
      setBranch(foundBranch);
      setChapters(visibleChapters);
      setLoading(false);
    } catch (err) {
      console.error('Error loading branch:', err);
      setError('Failed to load branch. Please try again later.');
      setLoading(false);
    }
  }, [subjectId, branchId]);

  // Toggle chapter completion
  const toggleChapterCompletion = (chapterId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newCompleted = new Set(completedChapters);
    if (newCompleted.has(chapterId)) {
      newCompleted.delete(chapterId);
    } else {
      newCompleted.add(chapterId);
    }
    
    setCompletedChapters(newCompleted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedChapters', JSON.stringify(Array.from(newCompleted)));
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter({ id: chapter.id, title: chapter.name, slug: chapter.slug });
    setIsQuizModalOpen(true);
  };

  const handleStartQuiz = (questionCount: number, questionType: string) => {
    if (!selectedChapter) return;
    
    // In a real app, you would start the quiz with the selected number of questions and type
    console.log(`Starting ${questionType} quiz for ${selectedChapter.title} with ${questionCount} questions`);
    
    // Mark as completed when quiz is started (in a real app, you might want to do this after completion)
    const newCompleted = new Set(completedChapters);
    newCompleted.add(selectedChapter.id);
    setCompletedChapters(newCompleted);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('completedChapters', JSON.stringify(Array.from(newCompleted)));
    }
    
    // In a real app, you would navigate to the quiz page with the selected parameters
    // router.push(`/quiz/${selectedChapter.id}?count=${questionCount}&type=${questionType}`);
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (chapters.length === 0) return 0;
    const completed = chapters.filter(chapter => completedChapters.has(chapter.id)).length;
    return Math.round((completed / chapters.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <div className="md:w-64 w-full md:fixed md:inset-y-0 md:h-screen z-30">
          <Sidebar />
        </div>
        <div className="flex-1 md:ml-64 mt-10">
          <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-3 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-24"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !subject || !branch) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <div className="md:w-64 w-full md:fixed md:inset-y-0 md:h-screen z-30">
          <Sidebar />
        </div>
        <div className="flex-1 md:ml-64 mt-10">
          <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error || 'Resource not found'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] focus:outline-none"
                >
                  <FiArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = calculateCompletion();
  const completedCount = chapters.filter(chapter => completedChapters.has(chapter.id)).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:w-64 w-full md:fixed md:inset-y-0 md:h-screen z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 mt-10">
        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex mb-6">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li>
                  <div className="flex items-center">
                    <button 
                      onClick={() => router.push('/subjects')}
                      className="text-sm font-medium text-gray-700 hover:text-[var(--primary-color)] cursor-pointer"
                    >
                      Subjects
                    </button>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <button 
                      onClick={() => router.push(`/subjects/${subject.slug}`)}
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-[var(--primary-color)] cursor-pointer"
                    >
                      {subject.name}
                    </button>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-500">
                      {branch.name}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>

            {/* Branch Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{branch.name}</h1>
                  <p className="mt-1 text-gray-600">{branch.description}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center">
                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--primary-color)] transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {completedCount} of {chapters.length} chapters
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters List */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chapters</h2>
              <div className="space-y-3">
                {chapters.length > 0 ? (
                  chapters.map((chapter) => {
                    const isCompleted = completedChapters.has(chapter.id);
                    
                    return (
                    <>
                        <div onClick={() => handleChapterClick(chapter)} className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${chapter.isActive ? 'group-hover:shadow-md group-hover:-translate-y-0.5' : 'opacity-75'} cursor-pointer`}>
                          <div className="p-4 md:p-6">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                  {isCompleted ? (
                                    <FiCheckCircle className="h-5 w-5 text-[var(--primary-color)]" />
                                  ) : (
                                    <FiBook className="h-5 w-5 text-[var(--primary-color)]" /> 
                                  )}
                                </div>
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className={`text-base font-medium ${chapter.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {chapter.name}
                                  </h3>
                                  {chapter.isActive && (
                                    <FiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  {chapter.description}
                                </p>
                                <div className="mt-2 flex items-center text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <FiClock className="h-3 w-3 mr-1" />
                                    <span>{Math.floor(Math.random() * 30) + 10} min</span>
                                  </div>
                                  <span className="mx-2">•</span>
                                  <span>{chapter.topics.length} topics</span>
                                </div>
                              </div>
                              {chapter.isActive && (
                                <button
                                  onClick={(e) => toggleChapterCompletion(chapter.id, e)}
                                  className="ml-4 p-2 -mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                  aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                                >
                                  <span className="sr-only">
                                    {isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                                  </span>
                                  <FiCheckCircle 
                                    className={`h-5 w-5 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`} 
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        </>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <FiBook className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No chapters available</h3>
                    <p className="mt-1 text-sm text-gray-500">Check back later for new content.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Continue Learning Button */}
            {chapters.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-200 p-3 shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Your progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-[var(--primary-color)] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {completionPercentage}% Complete • {completedCount} of {chapters.length} chapters
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Find first incomplete chapter or default to first chapter
                      const nextChapter = chapters.find(ch => !completedChapters.has(ch.id)) || chapters[0];
                      if (nextChapter) {
                        router.push(`/subjects/${subject.slug}/${branch.slug}/${nextChapter.slug}`);
                      }
                    }}
                    className="inline-flex items-center md:px-4 md:py-2 px-2 py-1 md:mx-0 mx-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] focus:outline-none cursor-pointer"
                  >
                    {completedCount === chapters.length ? 'Review Course' : 'Continue Learning'}
                    <FiPlayCircle className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Quiz Settings Modal */}
          <QuizSettingsModal
            isOpen={isQuizModalOpen}
            onCloseAction={() => setIsQuizModalOpen(false)}
            onStartQuizAction={handleStartQuiz}
            chapterTitle={selectedChapter?.title || 'this chapter'}
            chapterId={selectedChapter?.slug || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default BranchChaptersPage;
