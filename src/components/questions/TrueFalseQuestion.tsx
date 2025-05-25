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
  onAnswer?: (selectedAnswer: boolean, isCorrect: boolean) => void;
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
    setIsSubmitted(true);
    
    if (onAnswer) {
      onAnswer(answer, correct);
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
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Question */}
      <div className="mb-8">
        <QuestionContent content={question.question} />
      </div>

      {/* True/False Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <motion.button
          className={getButtonClasses(true)}
          onClick={() => handleAnswerSelect(true)}
          disabled={disabled || isSubmitted}
          whileTap={!disabled && !isSubmitted ? { scale: 0.98 } : undefined}
        >
          <span className="flex items-center justify-center">
            {isSubmitted && (
              <span className="mr-2">
                {selectedAnswer === true ? (
                  isCorrect ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )
                ) : question.correctAnswer === true ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </span>
            )}
            True
          </span>
        </motion.button>
        
        <motion.button
          className={getButtonClasses(false)}
          onClick={() => handleAnswerSelect(false)}
          disabled={disabled || isSubmitted}
          whileTap={!disabled && !isSubmitted ? { scale: 0.98 } : undefined}
        >
          <span className="flex items-center justify-center">
            {isSubmitted && (
              <span className="mr-2">
                {selectedAnswer === false ? (
                  isCorrect ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )
                ) : question.correctAnswer === false ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </span>
            )}
            False
          </span>
        </motion.button>
      </div>

      {/* Feedback */}
      {isSubmitted && (
        <motion.div 
          className="mb-6 space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className={`p-4 rounded-lg ${
            isCorrect 
              ? 'bg-green-50 border-l-4 border-green-500' 
              : 'bg-red-50 border-l-4 border-red-500'
          }`}>
            <p className="font-medium">
              {isCorrect ? (
                <span className="text-green-700">Correct! Well done.</span>
              ) : (
                <span className="text-red-700">Incorrect. The correct answer is: 
                  <span className="font-bold ml-1">
                    {question.correctAnswer ? 'True' : 'False'}
                  </span>
                </span>
              )}
            </p>
          </div>

          {question.explanation && (
            <motion.div 
              className="overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                <p className="font-medium text-blue-800 mb-2">Explanation:</p>
                <p className="text-blue-700">{question.explanation}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Marks */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
      </div>
    </motion.div>
  );
};

export default TrueFalseQuestion;
