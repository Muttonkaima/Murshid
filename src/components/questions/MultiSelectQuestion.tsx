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

interface MultiSelectQuestionProps {
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
    correctAnswers: string[];
    explanation?: string;
  };
  onAnswer?: (selectedOptions: string[], isComplete: boolean, scoreObtained: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  userAnswer?: { answer: string[], isCorrect: boolean }; // Add userAnswer prop
}

const MultiSelectQuestion: React.FC<MultiSelectQuestionProps> = (props) => {
  const {
    question,
    onAnswer,
    showFeedback = true,
    disabled = false,
    userAnswer
  } = props;
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Initialize state from userAnswer or reset when question changes
  useEffect(() => {
    if (props.userAnswer) {
      setSelectedOptions(props.userAnswer.answer);
      setIsSubmitted(true);
      setShowExplanation(true);
    } else {
      setSelectedOptions([]);
      setIsSubmitted(false);
      setShowExplanation(false);
    }
  }, [question.id, props.userAnswer]);

  const toggleOption = (optionText: string) => {
    if (disabled || isSubmitted) return;
    
    setSelectedOptions(prev => {
      if (prev.includes(optionText)) {
        return prev.filter(text => text !== optionText);
      } else {
        return [...prev, optionText];
      }
    });
  };

  const handleSubmit = () => {
    if (disabled || selectedOptions.length === 0) return;
    
    // First calculate everything we need before state updates
    const isComplete = selectedOptions.length > 0;
    const isCorrect = isComplete && selectedOptions.every(opt => 
      question.correctAnswers.includes(opt)
    ) && selectedOptions.length === question.correctAnswers.length;
    
    // Temporarily set isSubmitted to true for score calculation
    const wasSubmitted = isSubmitted;
    setIsSubmitted(true);
    
    // Calculate score with isSubmitted = true
    const score = calculateScore();
    console.log("Score from multi component:", score, "isCorrect:", isCorrect);
    
    // Now update the state
    setShowExplanation(true);
    
    if (onAnswer) {
      // Pass parameters in the expected order: (answer, isCorrect, scoreObtained)
      onAnswer(selectedOptions, isCorrect, score);
    }
  };

  const isOptionCorrect = (optionText: string) => {
    return question.correctAnswers.includes(optionText);
  };

  const isOptionSelected = (optionText: string) => {
    return selectedOptions.includes(optionText);
  };

  const getOptionClasses = (optionText: string) => {
    let classes = 'p-4 rounded-lg border-2 transition-all cursor-pointer flex items-start ';
    
    if (disabled) {
      classes += 'opacity-70 cursor-not-allowed ';
    } else if (!isSubmitted) {
      classes += 'hover:border-blue-400 ';
    }

    if (isSubmitted) {
      if (isOptionCorrect(optionText) && isOptionSelected(optionText)) {
        classes += 'bg-green-50 border-green-400 ';
      } else if (!isOptionCorrect(optionText) && isOptionSelected(optionText)) {
        classes += 'bg-red-50 border-red-400 ';
      } else if (isOptionCorrect(optionText) && !isOptionSelected(optionText)) {
        classes += 'bg-yellow-50 border-yellow-400 ';
      } else {
        classes += 'border-gray-200 ';
      }
    } else {
      classes += isOptionSelected(optionText) 
        ? 'border-blue-500 bg-blue-50 ' 
        : 'border-gray-200 ';
    }

    return classes;
  };

  // Calculate score based on selected options
  const calculateScore = () => {
    // if (!isSubmitted) return 0;
    
    const correctSelections = selectedOptions.filter(opt => 
      question.correctAnswers.includes(opt)
    ).length;
    
    // Calculate the percentage of correct answers
    const percentage = correctSelections / question.correctAnswers.length;
    
    // Calculate score based on the percentage and question marks
    const score = percentage * question.marks;
    
    // Round to 1 decimal place
    return Math.round(score * 10) / 10;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full transition-all duration-200 hover:shadow-md overflow-hidden">
      <div className="px-4 sm:px-6 pt-4 sm:pt-6">
      {/* Question */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <div className="text-lg sm:text-xl font-semibold text-gray-900">
              <QuestionContent content={question.question} />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 font-medium">
              Select all that apply
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 whitespace-nowrap">
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
        {question.options.map((option, index) => {
          const optionText = option.text;
          const optionKey = `${question.id}-option-${index}`;
          const isSelected = isOptionSelected(optionText);
          const isCorrect = isOptionCorrect(optionText);
          
          return (
            <div 
              key={optionKey}
              className={`${getOptionClasses(optionText).replace('p-4', 'p-3 sm:p-4')} group`}
              onClick={() => toggleOption(optionText)}
            >
              <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center mr-3 sm:mr-4 transition-all duration-200 ${
                isSubmitted
                  ? isCorrect
                    ? isSelected
                      ? 'bg-green-50 border-green-500 text-green-600 shadow-sm'
                      : 'bg-yellow-50 border-yellow-400 text-yellow-600 shadow-sm'
                    : isSelected
                      ? 'bg-red-50 border-red-400 text-red-600 shadow-sm'
                      : 'border-gray-200 group-hover:border-gray-300'
                  : isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm'
                    : 'border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50/50'
              }`}>
                {isSubmitted ? (
                  isCorrect ? (
                    isSelected ? (
                      <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )
                  ) : isSelected ? (
                    <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none">
                      <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null
                ) : isSelected ? (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-sm transition-all duration-200"></div>
                ) : (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-transparent group-hover:bg-gray-200 transition-colors duration-200"></div>
                )}
              </div>
              <div className="flex-1 -mt-0.5 text-sm sm:text-base">
                <QuestionContent content={option} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={disabled || selectedOptions.length === 0}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-blue-500 text-white font-medium text-sm sm:text-base rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Answer
            {selectedOptions.length > 0 && (
              <span className="ml-2 bg-blue-600 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                {selectedOptions.length} selected
              </span>
            )}
          </button>
        </div>
      )}

      {/* Feedback */}
      {isSubmitted && (
        <div className="space-y-4">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`p-4 rounded-lg flex items-start ${calculateScore() > 0
                ? 'bg-green-50 border-l-4 border-green-500'
                : 'bg-red-50 border-l-4 border-red-500'
              }`}>
              <svg
                className={`h-5 w-5 mt-0.5 mr-2 flex-shrink-0 ${calculateScore() > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {calculateScore() > 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <div>
                <p className={`font-medium ${calculateScore() > 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {calculateScore() > 0 ? (
                    `Good job! You scored ${calculateScore().toFixed(1)}/${question.marks} (${(calculateScore() / question.marks * 100).toFixed(0)}%)`
                  ) : (
                    `Incorrect. You scored: ${calculateScore().toFixed(1)}/${question.marks}`
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white rounded-xl border border-green-100 shadow-sm">
                <div className="flex items-center text-green-700 mb-2">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h4 className="font-medium">Correct Answers</h4>
                </div>
                <ul className="space-y-2">
                  {question.correctAnswers.map((answer, idx) => (
                    <li key={`correct-${idx}`} className="flex items-start">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-50 text-green-600 text-xs font-medium mr-2 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-gray-800">{answer}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center text-gray-700 mb-2">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h4 className="font-medium">Your Answers</h4>
                </div>
                <ul className="space-y-2">
                  {selectedOptions.length > 0 ? (
                    selectedOptions.map((answer, idx) => {
                      const isCorrect = question.correctAnswers.includes(answer);
                      return (
                        <li key={`selected-${idx}`} className="flex items-start">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium mr-2 flex-shrink-0 ${
                            isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {isCorrect ? '✓' : '✗'}
                          </span>
                          <span className={isCorrect ? 'text-gray-800' : 'text-gray-600 line-through'}>
                            {answer}
                          </span>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-gray-500">No answers selected</li>
                  )}
                </ul>
              </div>
            </div>

          </motion.div>
        </div>
      )}

      {/* Explanation */}
      {isSubmitted && question.explanation && (
        <motion.div
        className="overflow-hidden"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mt-4">
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
      
      {/* Card Footer */}
      <div className="w-full mt-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 gap-2 sm:gap-0">
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>Multi-Select Question</span>
        </div>
        <div className="text-xs sm:text-sm font-medium text-gray-600 bg-white px-2.5 sm:px-3 py-1 rounded-full border border-gray-200">
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </div>
      </div>
    </div>
  );
};

export default MultiSelectQuestion;
