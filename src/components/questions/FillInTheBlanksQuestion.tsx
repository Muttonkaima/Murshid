import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuestionContent from './QuestionContent';

interface FillInTheBlanksQuestionProps {
  question: {
    id: string | number;
    marks: number;
    question: {
      hide_text: boolean;
      text: string;
      read_text: boolean;
      read_text_url?: string;
      image: string;
      read_text_value?: string;
    };
    correctAnswer: string;
    alternatives?: string[];
    explanation?: string;
  };
  onAnswer?: (answer: string, isCorrect: boolean, scoreObtained: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  userAnswer?: { answer: string; isCorrect: boolean };
}

const FillInTheBlanksQuestion: React.FC<FillInTheBlanksQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  disabled = false,
  userAnswer,
}) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Initialize with user's previous answer if exists
  useEffect(() => {
    if (userAnswer) {
      setAnswer(userAnswer.answer || '');
      setIsSubmitted(true);
      setShowExplanation(true);
    } else {
      setAnswer('');
      setIsSubmitted(false);
      setShowExplanation(false);
    }
  }, [question.id, userAnswer]);

  // Check if the answer is correct, including alternatives
  const checkAnswer = (userAnswer: string) => {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = question.correctAnswer.toLowerCase();
    
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      return true;
    }
    
    // Check against alternatives if they exist
    if (question.alternatives && question.alternatives.length > 0) {
      return question.alternatives.some(
        alt => alt.toLowerCase() === normalizedUserAnswer
      );
    }
    
    return false;
  };

  const handleSubmit = () => {
    if (disabled || !answer.trim() || isSubmitted) return;
    
    const correct = checkAnswer(answer);
    const scoreObtained = correct ? question.marks : 0;
    setIsSubmitted(true);
    
    if (onAnswer) {
      onAnswer(answer, correct, scoreObtained);
    }
    
    setShowExplanation(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const isCorrect = isSubmitted ? checkAnswer(answer) : false;
  const questionText = question.question.text;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto transition-all duration-300 hover:shadow-md">
      {/* Card Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 leading-tight">
          <QuestionContent content={question.question} />
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-6 md:p-8">
        <div className="space-y-6">
          {/* Input Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
            <div className="relative flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled || isSubmitted}
                  className={`w-full px-5 py-3.5 text-base text-gray-900 md:text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'bg-green-50 border-green-400 text-green-800 focus:ring-green-200 pr-12'
                        : 'bg-red-50 border-red-400 text-red-800 focus:ring-red-200 pr-12'
                      : 'border-gray-200 hover:border-blue-300 focus:border-blue-400 focus:ring-blue-100'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                  placeholder="Type your answer here..."
                />
                
                {isSubmitted && (
                  <span className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                    isCorrect ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isCorrect ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                )}
              </div>
              
              {!isSubmitted && (
                <p className="mt-2 text-sm text-gray-500 px-1">
                  Press Enter or click Submit to check your answer
                </p>
              )}
            </div>
            
            <div className="flex-shrink-0">
              {!isSubmitted ? (
                <motion.button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || disabled}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-base md:text-lg shadow-sm hover:shadow-md"
                >
                  Submit
                </motion.button>
              ) : (
                <div className="w-full sm:w-36">
                  <span className={`inline-flex items-center justify-center w-full px-4 py-3 rounded-xl text-base font-medium ${
                    isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Feedback Sections */}
          <div className="space-y-4">
            {isSubmitted && !isCorrect && question.correctAnswer && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg"
              >
                <div className="flex">
                  <svg className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-amber-800">
                      Correct answer: <span className="font-bold">{question.correctAnswer}</span>
                    </p>
                    {question.alternatives && question.alternatives.length > 0 && (
                      <p className="text-sm text-amber-700 mt-1">
                        Also accepted: <span className="font-medium">{question.alternatives.join(', ')}</span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {showExplanation && question.explanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <div className="flex">
                    <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-blue-800 mb-1">Explanation</p>
                      <p className="text-blue-700">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Fill in the blank
        </div>
        <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </div>
      </div>
    </div>
  );
};

export default FillInTheBlanksQuestion;
