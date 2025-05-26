import React, { useState, useEffect } from 'react';
import QuestionContent from './QuestionContent';
import { motion } from 'framer-motion';

interface Option {
  hide_text: boolean;
  text: string;
  read_text: boolean;
  read_text_url?: string;
  image: string;
  read_text_value?: string;
}

interface MCQQuestionProps {
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
    options: Option[];
    correctAnswer: string;
    explanation?: string;
  };
  onAnswer?: (selectedOption: string, isCorrect: boolean, scoreObtained: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  userAnswer?: { answer: any, isCorrect: boolean };
}

const MCQQuestion: React.FC<MCQQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  disabled = false,
  userAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  
  const isCorrect = selectedOption === question.correctAnswer;
  const isOptionSelected = (optionText: string) => 
    selectedOption === optionText || 
    (hasAnswered && optionText === question.correctAnswer);

  useEffect(() => {
    if (userAnswer) {
      setSelectedOption(userAnswer.answer);
      setHasAnswered(true);
    } else {
      setSelectedOption(null);
      setHasAnswered(false);
      setShowExplanation(false);
    }
  }, [question.id, userAnswer]);

  const handleOptionSelect = (optionText: string) => {
    if (disabled || hasAnswered) return;
    
    setSelectedOption(optionText);
    const correct = optionText === question.correctAnswer;
    const score = correct ? question.marks : 0;
    
    if (onAnswer) {
      onAnswer(optionText, correct, score);
    }
    
    setHasAnswered(true);
    setShowExplanation(true);
  };

  const getOptionClasses = (optionText: string) => {
    let classes = 'p-4 rounded-lg border-2 transition-all cursor-pointer ';
    
    if (disabled) {
      classes += 'opacity-70 cursor-not-allowed ';
    } else {
      classes += 'hover:border-blue-400 ';
    }

    if (selectedOption === optionText) {
      if (showFeedback) {
        classes += isCorrect 
          ? 'border-green-500 bg-green-50 ' 
          : 'border-red-500 bg-red-50 ';
      } else {
        classes += 'border-blue-500 bg-blue-50 ';
      }
    } else {
      classes += 'border-gray-200 ';
    }

    return classes;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      {/* Question */}
      <div className="mb-6">
        <QuestionContent content={question.question} />
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const optionText = option.text;
          const optionKey = `${question.id}-option-${index}`;
          const isSelected = selectedOption === optionText;
          const isCorrectOption = optionText === question.correctAnswer;
          
          return (
            <div 
              key={optionKey}
              className={getOptionClasses(optionText)}
              onClick={() => handleOptionSelect(optionText)}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${
                  isSelected 
                    ? showFeedback 
                      ? isCorrect 
                        ? 'border-green-500 bg-green-100 text-green-700' 
                        : 'border-red-500 bg-red-100 text-red-700'
                      : 'border-blue-500 bg-blue-100 text-blue-700'
                    : 'border-gray-300'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1">
                  <QuestionContent content={option} />
                  {showFeedback && isSelected && !isCorrect && (
                    <div className="mt-2 text-sm text-red-600">
                      Correct answer: {question.correctAnswer}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && hasAnswered && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-blue-600 font-medium flex items-center"
          >
            {showExplanation ? 'Hide' : 'Show'} Explanation
            <svg 
              className={`ml-2 w-4 h-4 transition-transform ${showExplanation ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showExplanation && (
            <div className="mt-2 text-gray-700">
              {question.explanation}
            </div>
          )}
        </div>
      )}

      {/* Marks */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
      </div>
    </div>
  );
};

export default MCQQuestion;
