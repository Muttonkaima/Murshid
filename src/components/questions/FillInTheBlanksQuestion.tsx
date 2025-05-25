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
  onAnswer?: (answer: string, isCorrect: boolean) => void;
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
    setIsSubmitted(true);
    
    if (onAnswer) {
      onAnswer(answer, correct);
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
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      {/* Question */}
      <div className="mb-6">
        <div className="text-lg font-medium text-gray-800 mb-6">
          {questionText}
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="whitespace-nowrap font-medium">Your answer:</span>
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled || isSubmitted}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isSubmitted
                    ? isCorrect
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-red-50 border-red-500 text-red-700'
                    : 'border-gray-300 hover:border-blue-300'
                } transition-colors`}
                placeholder="Type your answer here..."
              />
              
              {isSubmitted && (
                <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isCorrect ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isCorrect ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </span>
              )}
            </div>
            
            {!isSubmitted ? (
              <motion.button
                onClick={handleSubmit}
                disabled={!answer.trim() || disabled}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </motion.button>
            ) : (
              <div className="w-32 text-center">
                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                  isCorrect 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
            )}
          </div>
          
          {isSubmitted && !isCorrect && question.correctAnswer && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r"
            >
              <p className="font-medium text-yellow-800">
                Correct answer: <span className="font-bold">{question.correctAnswer}</span>
              </p>
              {question.alternatives && question.alternatives.length > 0 && (
                <p className="text-sm text-yellow-700 mt-1">
                  Also accepted: {question.alternatives.join(', ')}
                </p>
              )}
            </motion.div>
          )}
          
          {showExplanation && question.explanation && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                <p className="font-medium text-blue-800 mb-1">Explanation:</p>
                <p className="text-blue-700">{question.explanation}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Marks */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
      </div>
    </div>
  );
};

export default FillInTheBlanksQuestion;
