'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizSettingsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onStartQuizAction: (questionCount: number) => void;
  chapterTitle: string;
}

export default function QuizSettingsModal({ 
  isOpen, 
  onCloseAction, 
  onStartQuizAction,
  chapterTitle 
}: QuizSettingsModalProps) {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleStartQuiz = () => {
    onStartQuizAction(questionCount);
    onCloseAction();
  };

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
              
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-3 mb-4">
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
