import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuestionContent from './QuestionContent';

interface TrueFalseQuestionProps {
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
    correctAnswer: boolean;
    explanation?: string;
  };
  onAnswer?: (selectedAnswer: boolean, isCorrect: boolean, scoreObtained: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  userAnswer?: { answer: boolean; isCorrect: boolean };
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  disabled = false,
  userAnswer,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Initialize with user's previous answer if exists
  useEffect(() => {
    if (userAnswer) {
      setSelectedAnswer(userAnswer.answer);
      setIsSubmitted(true);
      setShowExplanation(true);
    } else {
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setShowExplanation(false);
    }
  }, [question.id, userAnswer]);

  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleAnswerSelect = (answer: boolean) => {
    if (disabled || isSubmitted) return;
    
    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    const score = correct ? question.marks : 0;
    setIsSubmitted(true);
    
    if (onAnswer) {
      onAnswer(answer, correct, score);
    }
    
    setShowExplanation(true);
  };

  const getButtonClasses = (value: boolean) => {
    let classes = 'px-6 py-4 rounded-xl font-medium text-lg transition-all flex-1 ';
    
    if (disabled || isSubmitted) {
      classes += 'cursor-not-allowed ';
    } else {
      classes += 'hover:opacity-90 cursor-pointer ';
    }

    if (selectedAnswer === value) {
      if (isSubmitted) {
        if (isCorrect) {
          classes += 'bg-green-50 text-green-700 border-2 border-green-500 shadow-sm ';
        } else {
          classes += 'bg-red-50 text-red-700 border-2 border-red-500 ';
          if (value === question.correctAnswer) {
            classes += 'ring-2 ring-green-500 ring-offset-2 ';
          }
        }
      } else {
        classes += 'bg-blue-50 text-blue-700 border-2 border-blue-500 ';
      }
    } else if (isSubmitted && value === question.correctAnswer) {
      classes += 'bg-green-50 text-green-700 border-2 border-green-500 ';
    } else {
      classes += 'bg-gray-50 text-gray-700 border-2 border-gray-200 ';
    }

    return classes;
  };

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
          {/* True/False Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              className={`${getButtonClasses(true)} flex items-center justify-center gap-2 py-5 px-6 rounded-xl text-lg font-medium transition-all duration-200`}
              onClick={() => handleAnswerSelect(true)}
              disabled={disabled || isSubmitted}
              whileHover={!disabled && !isSubmitted ? { scale: 1.02 } : {}}
              whileTap={!disabled && !isSubmitted ? { scale: 0.98 } : {}}
            >
              {isSubmitted && (
                <span className="flex-shrink-0">
                  {selectedAnswer === true ? (
                    isCorrect ? (
                      <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )
                  ) : question.correctAnswer === true ? (
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </span>
              )}
              <span>True</span>
            </motion.button>
            
            <motion.button
              className={`${getButtonClasses(false)} flex items-center justify-center gap-2 py-5 px-6 rounded-xl text-lg font-medium transition-all duration-200`}
              onClick={() => handleAnswerSelect(false)}
              disabled={disabled || isSubmitted}
              whileHover={!disabled && !isSubmitted ? { scale: 1.02 } : {}}
              whileTap={!disabled && !isSubmitted ? { scale: 0.98 } : {}}
            >
              {isSubmitted && (
                <span className="flex-shrink-0">
                  {selectedAnswer === false ? (
                    isCorrect ? (
                      <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )
                  ) : question.correctAnswer === false ? (
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </span>
              )}
              <span>False</span>
            </motion.button>
          </div>

          {/* Feedback */}
          {isSubmitted && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`p-4 rounded-lg flex items-start ${
                isCorrect 
                  ? 'bg-green-50 border-l-4 border-green-500' 
                  : 'bg-red-50 border-l-4 border-red-500'
              }`}>
                <svg 
                  className={`h-5 w-5 mt-0.5 mr-2 flex-shrink-0 ${
                    isCorrect ? 'text-green-500' : 'text-red-500'
                  }`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {isCorrect ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <div>
                  <p className={`font-medium ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? (
                      'Correct! Well done.'
                    ) : (
                      <>
                        Incorrect. The correct answer is: <span className="font-bold">
                          {question.correctAnswer ? 'True' : 'False'}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {question.explanation && (
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
            </motion.div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          True/False Question
        </div>
        <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </div>
      </div>
    </div>
  );
};

export default TrueFalseQuestion;
