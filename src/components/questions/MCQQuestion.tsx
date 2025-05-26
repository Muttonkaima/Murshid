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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto transition-all duration-300 hover:shadow-md">
      {/* Card Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 leading-tight">
          <QuestionContent content={question.question} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 md:p-8">
        <div className="space-y-4">
          {/* Options */}
          <div className="grid gap-3">
            {question.options.map((option, index) => {
              const optionText = option.text;
              const optionKey = `${question.id}-option-${index}`;
              const isSelected = selectedOption === optionText;
              const isCorrectOption = optionText === question.correctAnswer;
              const optionLetter = String.fromCharCode(65 + index);

              return (
                <motion.div
                  key={optionKey}
                  className={getOptionClasses(optionText)}
                  onClick={() => handleOptionSelect(optionText)}
                  whileHover={!disabled && !hasAnswered ? { scale: 1.01 } : {}}
                  whileTap={!disabled && !hasAnswered ? { scale: 0.995 } : {}}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mr-4 mt-0.5 font-medium text-sm transition-colors ${isSelected
                        ? showFeedback
                          ? isCorrect
                            ? 'bg-green-100 text-green-700 border-2 border-green-400'
                            : 'bg-red-100 text-red-700 border-2 border-red-400'
                          : 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                        : 'bg-gray-50 text-gray-600 border-2 border-gray-200'
                      }`}>
                      {optionLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800">
                        <QuestionContent content={option} />
                      </div>

                    </div>
                    {showFeedback && (
                      <div className="ml-3 flex-shrink-0">
                        {isSelected ? (
                          isCorrect ? (
                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )
                        ) : null}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && hasAnswered && question.explanation && (
            <>
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`p-4 rounded-lg flex items-start ${isCorrect
                    ? 'bg-green-50 border-l-4 border-green-500'
                    : 'bg-red-50 border-l-4 border-red-500'
                  }`}>
                  <svg
                    className={`h-5 w-5 mt-0.5 mr-2 flex-shrink-0 ${isCorrect ? 'text-green-500' : 'text-red-500'
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
                    <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'
                      }`}>
                      {isCorrect ? (
                        'Correct! Well done.'
                      ) : (
                        <>
                          Incorrect. The correct answer is: <span className="font-bold">
                            {question.correctAnswer}
                          </span>
                        </>
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
            </>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <svg className="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Multiple Choice Question
        </div>
        <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </div>
      </div>
    </div>
  );
};

export default MCQQuestion;
