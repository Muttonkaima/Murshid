import React, { useState, useEffect } from 'react';
import QuestionContent from './QuestionContent';

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
  onAnswer?: (selectedOptions: string[], isComplete: boolean) => void;
  showFeedback?: boolean;
  disabled?: boolean;
}

const MultiSelectQuestion: React.FC<MultiSelectQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  disabled = false,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Reset when question changes
  useEffect(() => {
    setSelectedOptions([]);
    setIsSubmitted(false);
    setShowExplanation(false);
  }, [question.id]);

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
    setIsSubmitted(true);
    
    if (onAnswer) {
      const isComplete = selectedOptions.length > 0;
      onAnswer(selectedOptions, isComplete);
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
    if (!isSubmitted) return 0;
    
    const correctSelections = selectedOptions.filter(opt => 
      question.correctAnswers.includes(opt)
    ).length;
    
    const incorrectSelections = selectedOptions.length - correctSelections;
    const missedSelections = question.correctAnswers.length - correctSelections;
    
    // Simple scoring: (correct - incorrect) / total
    const score = Math.max(0, correctSelections - incorrectSelections) / question.correctAnswers.length;
    return Math.round(score * question.marks * 10) / 10; // Round to 1 decimal
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      {/* Question */}
      <div className="mb-6">
        <QuestionContent content={question.question} />
        <p className="text-sm text-gray-500 mt-1">
          Select all that apply. {question.correctAnswers.length > 1 ? 
            `(There are ${question.correctAnswers.length} correct answers)` : 
            '(There is 1 correct answer)'}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const optionText = option.text;
          const optionKey = `${question.id}-option-${index}`;
          const isSelected = isOptionSelected(optionText);
          const isCorrect = isOptionCorrect(optionText);
          
          return (
            <div 
              key={optionKey}
              className={getOptionClasses(optionText)}
              onClick={() => toggleOption(optionText)}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mr-3 mt-0.5 ${
                isSubmitted
                  ? isCorrect
                    ? isSelected
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-yellow-100 border-yellow-400 text-yellow-700'
                    : isSelected
                      ? 'bg-red-100 border-red-500 text-red-700'
                      : 'border-gray-300'
                  : isSelected
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-gray-300'
              }`}>
                {isSubmitted ? (
                  isCorrect ? (
                    isSelected ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )
                  ) : isSelected ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : null
                ) : isSelected ? (
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                ) : null}
              </div>
              <div className="flex-1">
                <QuestionContent content={option} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={disabled || selectedOptions.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Answer
        </button>
      )}

      {/* Feedback */}
      {isSubmitted && (
        <div className="mb-6">
          <div className={`p-4 rounded-lg mb-4 ${
            calculateScore() > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {calculateScore() > 0 ? (
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <h3 className="font-medium">
                  {calculateScore() > 0 ? 'Good job!' : 'Incorrect'}
                </h3>
                <p className="text-sm">
                  Score: {calculateScore().toFixed(1)}/{question.marks}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-700 mb-1">Correct Answers:</h4>
              <ul className="list-disc list-inside text-sm text-green-700">
                {question.correctAnswers.map((answer, idx) => (
                  <li key={`correct-${idx}`} className="mb-1">{answer}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-700 mb-1">Your Answers:</h4>
              <ul className="list-disc list-inside text-sm text-red-700">
                {selectedOptions.length > 0 ? (
                  selectedOptions.map((answer, idx) => (
                    <li 
                      key={`selected-${idx}`} 
                      className={`mb-1 ${question.correctAnswers.includes(answer) ? 'text-green-700' : 'text-red-700'}`}
                    >
                      {answer}
                      {question.correctAnswers.includes(answer) ? (
                        <span className="ml-1 text-green-500">✓</span>
                      ) : (
                        <span className="ml-1 text-red-500">✗</span>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No answers selected</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      {isSubmitted && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
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
        {isSubmitted && ` (Your score: ${calculateScore().toFixed(1)})`}
      </div>
    </div>
  );
};

export default MultiSelectQuestion;
