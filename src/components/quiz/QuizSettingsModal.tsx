'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

type QuestionType = 
  | 'all'
  | 'fill-in-blanks'
  | 'mcq'
  | 'multi-select'
  | 'match-the-following'
  | 'sorting'
  | 'reordering'
  | 'true-false';

interface QuizSettingsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onStartQuizAction: (questionCount: number, questionType: QuestionType) => void;
  chapterTitle: string;
}

export default function QuizSettingsModal({ 
  isOpen, 
  onCloseAction, 
  onStartQuizAction,
  chapterTitle 
}: QuizSettingsModalProps) {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState<QuestionType>('all');
  const [isMounted, setIsMounted] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  
  const questionTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'fill-in-blanks', label: 'Fill in the Blanks' },
    { value: 'mcq', label: 'Choose Correct Answer' },
    { value: 'multi-select', label: 'Multi-Select' },
    { value: 'match-the-following', label: 'Match the Following' },
    { value: 'sorting', label: 'Sorting' },
    { value: 'reordering', label: 'Reordering' },
    { value: 'true-false', label: 'True/False' },
  ];
  
  const selectedTypeLabel = questionTypes.find(type => type.value === questionType)?.label || 'Select Type';

  const handleStartQuiz = () => {
    onStartQuizAction(questionCount, questionType);
    onCloseAction();
  };

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Start Quiz
              </h2>
              <p className="text-gray-600 mb-6">
                Select number of questions for <span className="font-medium text-[var(--primary-color)]">{chapterTitle}</span>
              </p>
              
              <div className="mb-8 space-y-6">
                {/* Question Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] sm:text-sm cursor-pointer flex items-center justify-between"
                    >
                      <span>{selectedTypeLabel}</span>
                      <svg 
                        className={`h-5 w-5 text-gray-400 transform transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {isTypeDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base border border-gray-300 overflow-auto focus:outline-none sm:text-sm">
                        {questionTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => {
                              setQuestionType(type.value as QuestionType);
                              setIsTypeDropdownOpen(false);
                            }}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                              questionType === type.value ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'text-gray-900'
                            }`}
                          >
                            {type.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Question Count Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Questions
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`py-3 px-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        questionCount === count
                          ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/20 text-[var(--primary-color)]'
                          : 'border-gray-200 hover:border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[var(--primary-color)] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(questionCount / 20) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>Quick</span>
                  <span>Comprehensive</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onCloseAction}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartQuiz}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] rounded-lg transition-colors flex items-center cursor-pointer"
                >
                  <span>Start Quiz</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
