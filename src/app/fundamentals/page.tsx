'use client';

import { useState, useEffect } from 'react';
import {
  FiZap,
  FiGlobe,
  FiType,
  FiDivideCircle,
  FiAward,
  FiLock,
  FiX
} from 'react-icons/fi';
import Sidebar from '@/components/layout/Sidebar';

// Subject data with unique colors and icons
const subjects = [
  {
    id: 'social',
    name: 'Social',
    description: 'Explore history, geography, and civics',
    icon: <FiGlobe className="text-2xl text-white" />,
    color: 'from-amber-500 to-yellow-400',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-400',
    isLocked: false
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Discover physics, chemistry, and biology',
    icon: <FiZap className="text-2xl text-white" />,
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-400',
    isLocked: false
  },
  {
    id: 'kannada',
    name: 'Kannada',
    description: 'Learn Kannada language and literature',
    icon: <p className="text-2xl text-white font-bold">ಕ</p>,
    color: 'from-green-500 to-emerald-400',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-400',
    isLocked: false
  },
  {
    id: 'hindi',
    name: 'Hindi',
    description: 'Master Hindi language skills',
    icon: <p className="text-2xl text-white font-bold">ह</p>,
    color: 'from-purple-500 to-fuchsia-400',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-400',
    isLocked: false
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Master numbers and problem solving',
    icon: <FiDivideCircle className="text-2xl text-white" />,
    color: 'from-red-500 to-pink-400',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-400',
    isLocked: true,
    lockedMessage: 'Coming soon!'
  },
  {
    id: 'tamil',
    name: 'Tamil',
    description: 'Learn Tamil language and literature',
    icon: <p className="text-2xl text-white font-bold">த</p>,
    color: 'from-indigo-500 to-violet-400',
    bgColor: 'bg-indigo-500',
    borderColor: 'border-indigo-400',
    isLocked: true,
    lockedMessage: 'Coming soon!'
  }
];

// Level component for the modal
const LevelCard = ({ level, isActive, subjectColor, onClick }: {
  level: number;
  isActive: boolean;
  subjectColor: string;
  onClick: () => void
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!isActive}
      className={`relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${isActive
          ? `bg-gradient-to-br ${subjectColor} text-white shadow-lg hover:scale-105 hover:shadow-xl cursor-pointer`
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
    >
      {!isActive && (
        <div className="absolute top-2 right-2">
          <FiLock className="w-4 h-4" />
        </div>
      )}
      <span className="text-2xl font-bold">{level}</span>
      <span className="text-xs mt-1">Level</span>

      {isActive && (
        <div className="absolute -bottom-2 w-4 h-4 bg-white transform rotate-45 rounded-sm"></div>
      )}

      {/* {isActive && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded whitespace-nowrap shadow-lg z-50">
          Start Learning
        </div>
      )} */}
    </button>
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
                <p className="opacity-90 text-sm">Select a level to begin your journey</p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full hover:text-gray-900 hover:bg-white hover:bg-opacity-20 transition-colors cursor-pointer`}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="p-4 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[...Array(10)].map((_, index) => (
                <LevelCard
                  key={index + 1}
                  level={index + 1}
                  isActive={index === 0}
                  subjectColor={subject.color}
                  onClick={() => {
                    console.log(`Starting ${subject.name} Level ${index + 1}`);
                  }}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex justify-between mb-2 text-sm font-medium text-gray-500">
                <span>Your Progress</span>
                <span>10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${subject.bgColor}`}
                  style={{ width: '10%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          {/* <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div> */}

        </div>
      </div>
    </div>
  );
};


export default function FundamentalsPage() {
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubjectClick = (subject: any) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:w-64 w-full md:fixed md:inset-y-0 md:h-screen z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 mt-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Fundamentals</h1>
              <p className="text-gray-600">Select a subject to start learning the basics</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => !subject.isLocked && handleSubjectClick(subject)}
                  className={`group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${subject.isLocked
                      ? 'opacity-70 cursor-not-allowed'
                      : 'cursor-pointer hover:shadow-md hover:-translate-y-1'
                    }`}
                >
                  <div className={`h-2 ${subject.bgColor} ${subject.isLocked ? 'opacity-70' : ''}`}></div>
                  <div className="p-6 relative">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`w-12 h-12 rounded-lg ${subject.bgColor} ${subject.isLocked ? 'opacity-70' : 'bg-opacity-10'} flex items-center justify-center ${subject.bgColor.replace('bg-', 'text-')}`}>
                        {subject.icon}
                      </div>
                      {subject.isLocked && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${subject.isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                      {subject.name}
                    </h3>
                    <p className={`mb-4 ${subject.isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {subject.description}
                    </p>
                    <div className={`flex items-center text-sm ${subject.isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>10 levels</span>
                      <span className="mx-2">•</span>
                      <span className="flex items-center">
                        <FiAward className={`w-4 h-4 mr-1 ${subject.isLocked ? 'text-gray-400' : 'text-yellow-500'}`} />
                        {subject.isLocked ? 'Coming soon' : 'Start from beginning'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level Selection Modal */}
      <LevelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject={selectedSubject}
      />
    </div>
  );
}
