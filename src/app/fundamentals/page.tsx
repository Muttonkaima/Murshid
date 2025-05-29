'use client';

import { useState, useEffect } from 'react';
import {
  FiZap,
  FiGlobe,
  FiType,
  FiDivideCircle,
  FiAward,
  FiLock,
  FiX,
  FiMap,
  FiActivity,
  FiEdit,
  FiFileText,
  FiBookOpen
} from 'react-icons/fi';
import Sidebar from '@/components/layout/Sidebar';

// Import subject data from JSON
import subjectsData from '@/data/fundamentals/subjects/fundamentalSubjects.json';

// Map icon names to actual components
const iconComponents: { [key: string]: React.ReactNode } = {
  'FiGlobe': <FiGlobe className="text-2xl text-white" />,
  'FiZap': <FiZap className="text-2xl text-white" />,
  'FiDivideCircle': <FiDivideCircle className="text-2xl text-white" />,
  'FiMap': <FiMap className="text-2xl text-white" />,
  'FiActivity': <FiActivity className="text-2xl text-white" />,
  'FiEdit': <FiEdit className="text-2xl text-white" />,
  'FiFileText': <FiFileText className="text-2xl text-white" />,
  'FiBookOpen': <FiBookOpen className="text-2xl text-white" />,
  'kannada': <p className="text-2xl text-white font-bold">ಕ</p>,
  'hindi': <p className="text-2xl text-white font-bold">ह</p>,
  'tamil': <p className="text-2xl text-white font-bold">த</p>
};

// Process subjects data
const subjects = subjectsData.subjects
  .filter(subject => subject.isVisible !== false) // Only show visible subjects
  .map(subject => ({
    ...subject,
    icon: iconComponents[subject.icon] || iconComponents[subject.id] || <FiBookOpen className="text-2xl text-white" />
  }));

// Level component for the modal
const LevelCard = ({ level, isActive, subjectColor, onClick, isLocked, lockedMessage }: {
  level: number;
  isActive: boolean;
  subjectColor: string;
  onClick: () => void;
  isLocked?: boolean;
  lockedMessage?: string;
}) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={isLocked || !isActive}
        className={`relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 w-full h-full ${
          isLocked 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : isActive 
              ? `bg-gradient-to-br ${subjectColor} text-white shadow-lg hover:scale-105 hover:shadow-xl cursor-pointer`
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {(isLocked || !isActive) && (
          <div className="absolute top-2 right-2">
            <FiLock className="w-4 h-4" />
          </div>
        )}
        <span className="text-2xl font-bold">{level}</span>
        <span className="text-xs mt-1">Level</span>

        {isActive && !isLocked && (
          <div className="absolute -bottom-2 w-4 h-4 bg-white transform rotate-45 rounded-sm"></div>
        )}
      </button>
      
      {isLocked && lockedMessage && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded whitespace-nowrap shadow-lg z-50">
          {lockedMessage}
        </div>
      )}
    </div>
  );
};

// Modal component for level selection
const LevelModal = ({
  isOpen,
  onClose,
  subject
}: {
  isOpen: boolean;
  onClose: () => void;
  subject: any
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !subject) return null;

  // Calculate progress (for demo purposes)
  const totalLevels = subject.levels?.length || 0;
  const completedLevels = 0; // This would come from user progress data
  const progress = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[90vh] overflow-hidden border-t-4 ${subject.borderColor}`}>
        {/* Scrollable Area */}
        <div className="flex flex-col h-full">
          {/* Modal Header */}
          <div className={`p-4 sm:p-6 ${subject.bgColor} text-white`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{subject.name} Fundamentals</h2>
                <p className="opacity-90 text-sm">{subject.description || 'Select a level to begin your journey'}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors cursor-pointer"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="p-4 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {subject.levels?.length > 0 ? (
                subject.levels.map((level: any, index: number) => {
                  const isLocked = index > 0; // Only first level is unlocked by default
                  return (
                    <LevelCard
                      key={level.id || index}
                      level={index + 1}
                      isActive={index === 0}
                      subjectColor={subject.color}
                      isLocked={isLocked}
                      lockedMessage={isLocked ? '' : undefined}
                      onClick={() => {
                        if (!isLocked) {
                          console.log(`Starting ${subject.name} - ${level.name || `Level ${index + 1}`}`);
                          // Here you would typically navigate to the level or open it
                        }
                      }}
                    />
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No levels available yet. Check back soon!
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {subject.levels?.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between mb-2 text-sm font-medium text-gray-500">
                  <span>Your Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{
                      width: `${progress}%`,
                      backgroundImage: `linear-gradient(to right, ${subject.color.replace('to', ',')})`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {completedLevels} of {subject.levels.length} levels completed
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {subject.levels?.length || 0} levels available
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function FundamentalsPage() {
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubjectClick = (subject: any) => {
    if (subject.isLocked) return;
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Small delay to allow the modal close animation to complete
    setTimeout(() => {
      setSelectedSubject(null);
    }, 300);
  };

  if (!isClient) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Fundamentals</h1>
            <p className="mt-2 text-gray-600">Master the basics with our comprehensive fundamental courses</p>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiBookOpen className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No subjects available</h3>
              <p className="mt-1 text-gray-500">Check back later for new content.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => handleSubjectClick(subject)}
                  className={`relative group rounded-2xl overflow-hidden transition-all duration-300 transform border-t-5 ${subject.borderColor} ${
                    subject.isLocked 
                      ? 'cursor-not-allowed' 
                      : 'cursor-pointer hover:scale-105 hover:shadow-lg'
                  } ${subject.color} p-0.5 h-full flex flex-col`}
                >
                  <div className="bg-white p-6 rounded-xl h-full flex flex-col">
                    <div className="flex items-start mb-4">
                      <div className={`p-3 rounded-xl mr-4 ${subject.bgColor} flex-shrink-0`}>
                        {subject.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{subject.description}</p>
                      </div>
                    </div>
                    
                    {/* Bottom section that stays at the bottom */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      {subject.isLocked ? (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center">
                          <div className="bg-black text-white text-sm font-medium px-4 py-1.5 rounded-full flex items-center">
                            <FiLock className="mr-1.5" />
                            {subject.lockedMessage || 'Coming Soon'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-gray-500 text-sm">
                          <span className="font-medium">{subject.levels?.length || 0} levels</span>
                          <span className="flex items-center text-yellow-300 font-medium">
                            <FiAward className="w-4 h-4 mr-1.5 text-yellow-300" />
                            Start
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <LevelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        subject={selectedSubject}
      />
    </div>
  );
}
