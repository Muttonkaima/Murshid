import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QuestionContent from './QuestionContent';

interface Item {
  hide_text: boolean;
  text: string;
  read_text: boolean;
  read_text_url?: string;
  image: string;
  read_text_value?: string;
}

interface MatchPair {
  left: string;
  right: string;
}

interface MatchTheFollowingQuestionProps {
  question: {
    id: string | number;
    type: string;
    marks: number;
    question: Item;
    leftItems: Item[];
    rightItems: Item[];
    correctPairs: MatchPair[];
    explanation?: string;
  };
  onAnswer?: (pairs: MatchPair[], isCorrect: boolean, scoreObtained: number) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  userAnswer?: { answer: MatchPair[], isCorrect: boolean };
}

const MatchTheFollowingQuestion: React.FC<MatchTheFollowingQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  disabled = false,
  userAnswer,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isFullyCorrect, setIsFullyCorrect] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number; percentage: number } | null>(null);

  // Initialize state from userAnswer if provided
  useEffect(() => {
    if (userAnswer) {
      setPairs(userAnswer.answer);
      setHasSubmitted(true);
      setShowExplanation(true);
    } else {
      setPairs([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setHasSubmitted(false);
      setShowExplanation(false);
    }
  }, [question.id, userAnswer]);

  const resetOrder = () => {
    setPairs([]);
    setHasSubmitted(false);
    setScore(null);
    // Don't call onAnswer here as it would submit the empty answer
  };
  const isPaired = (leftText: string, rightText: string) => {
    return pairs.some(pair =>
      pair.left === leftText && pair.right === rightText
    );
  };

  const isCorrectPair = (leftText: string, rightText: string) => {
    if (!showFeedback) return false;
    return question.correctPairs.some(pair =>
      pair.left === leftText && pair.right === rightText
    );
  };

  const isIncorrectPair = (leftText: string, rightText: string) => {
    if (!showFeedback) return false;
    return pairs.some(pair =>
      pair.left === leftText && pair.right === rightText &&
      !question.correctPairs.some(cp => cp.left === leftText && cp.right === rightText)
    );
  };

  const handleLeftItemClick = (leftText: string) => {
    if (disabled || hasSubmitted) return;

    // If already selected, deselect it
    if (selectedLeft === leftText) {
      setSelectedLeft(null);
      return;
    }

    setSelectedLeft(leftText);

    // If we have a right item selected, create a pair
    if (selectedRight) {
      const newPair = { left: leftText, right: selectedRight };

      // Check if this exact pair already exists
      const pairExists = pairs.some(pair =>
        pair.left === newPair.left && pair.right === newPair.right
      );

      if (!pairExists) {
        // Remove any existing pairs with the same left or right item
        const updatedPairs = pairs.filter(
          pair => pair.left !== newPair.left && pair.right !== newPair.right
        );

        setPairs([...updatedPairs, newPair]);
      }

      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleRightItemClick = (rightText: string) => {
    if (disabled || hasSubmitted) return;

    // If already selected, deselect it
    if (selectedRight === rightText) {
      setSelectedRight(null);
      return;
    }

    setSelectedRight(rightText);

    // If we have a left item selected, create a pair
    if (selectedLeft) {
      const newPair = { left: selectedLeft, right: rightText };

      // Check if this exact pair already exists
      const pairExists = pairs.some(pair =>
        pair.left === newPair.left && pair.right === newPair.right
      );

      if (!pairExists) {
        // Remove any existing pairs with the same left or right item
        const updatedPairs = pairs.filter(
          pair => pair.left !== newPair.left && pair.right !== newPair.right
        );

        setPairs([...updatedPairs, newPair]);
      }

      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const calculateScore = (): { correct: number; total: number; percentage: number } => {
    const correctCount = pairs.filter(pair =>
      question.correctPairs.some(cp =>
        cp.left === pair.left && cp.right === pair.right
      )
    ).length;

    const total = question.correctPairs.length;
    const percentage = Math.round((correctCount / total) * 100);

    return { correct: correctCount, total, percentage };
  };

  const handleSubmit = () => {
    if (disabled || hasSubmitted) return;

    const score = calculateScore();
    setIsFullyCorrect(score.correct === score.total);
    const scoreObtained = (score.correct / score.total) * question.marks;

    if (onAnswer) {
      onAnswer(pairs, isFullyCorrect, scoreObtained);
    }

    setScore(score);
    setHasSubmitted(true);
    setShowExplanation(true);
  };

  const isLeftItemInCorrectPair = (leftText: string): boolean => {
    if (!hasSubmitted) return false;
    const pair = pairs.find(p => p.left === leftText);
    if (!pair) return false;
    return question.correctPairs.some(cp =>
      cp.left === pair.left && cp.right === pair.right
    );
  };

  const isLeftItemInIncorrectPair = (leftText: string): boolean => {
    if (!hasSubmitted) return false;
    const pair = pairs.find(p => p.left === leftText);
    if (!pair) return false;
    return !question.correctPairs.some(cp =>
      cp.left === pair.left && cp.right === pair.right
    );
  };

  const getLeftItemClasses = (leftText: string) => {
    let classes = 'p-4 border-2 rounded-lg mb-3 cursor-pointer transition-all relative overflow-hidden ';

    if (disabled) {
      classes += 'opacity-70 cursor-not-allowed ';
    } else if (!hasSubmitted) {
      classes += 'hover:bg-blue-50 hover:border-blue-200 ';
    }

    // Check if this item is in a correct or incorrect pair
    const inCorrectPair = isLeftItemInCorrectPair(leftText);
    const inIncorrectPair = isLeftItemInIncorrectPair(leftText);

    // Selected state (blue highlight)
    if (selectedLeft === leftText) {
      classes += 'border-blue-500 bg-blue-50 ';
    }
    // Incorrect pair state (red highlight)
    else if (inIncorrectPair) {
      classes += 'border-red-500 bg-red-50 ';
    }
    // Correct pair state (green highlight)
    else if (inCorrectPair) {
      classes += 'border-green-500 bg-green-50 ';
    }
    // Paired but not submitted yet
    else if (pairs.some(pair => pair.left === leftText) && !hasSubmitted) {
      classes += 'bg-blue-50 border-blue-200 ';
    }
    // Default state
    else {
      classes += 'border-gray-200 ';
    }

    return classes;
  };

  const isRightItemInCorrectPair = (rightText: string): boolean => {
    if (!hasSubmitted) return false;
    const pair = pairs.find(p => p.right === rightText);
    if (!pair) return false;
    return question.correctPairs.some(cp =>
      cp.left === pair.left && cp.right === pair.right
    );
  };

  const isRightItemInIncorrectPair = (rightText: string): boolean => {
    if (!hasSubmitted) return false;
    const pair = pairs.find(p => p.right === rightText);
    if (!pair) return false;
    return !question.correctPairs.some(cp =>
      cp.left === pair.left && cp.right === pair.right
    );
  };

  const getRightItemClasses = (rightText: string) => {
    let classes = 'p-4 border-2 rounded-lg mb-3 cursor-pointer transition-all relative overflow-hidden ';

    if (disabled) {
      classes += 'opacity-70 cursor-not-allowed ';
    } else if (!hasSubmitted) {
      classes += 'hover:bg-blue-50 hover:border-blue-200 ';
    }

    // Check if this item is in a correct or incorrect pair
    const inCorrectPair = isRightItemInCorrectPair(rightText);
    const inIncorrectPair = isRightItemInIncorrectPair(rightText);

    // Selected state (blue highlight)
    if (selectedRight === rightText) {
      classes += 'border-blue-500 bg-blue-50 ';
    }
    // Incorrect pair state (red highlight)
    else if (inIncorrectPair) {
      classes += 'border-red-500 bg-red-50 ';
    }
    // Correct pair state (green highlight)
    else if (inCorrectPair) {
      classes += 'border-green-500 bg-green-50 ';
    }
    // Paired but not submitted yet
    else if (pairs.some(pair => pair.right === rightText) && !hasSubmitted) {
      classes += 'bg-blue-50 border-blue-200 ';
    }
    // Default state
    else {
      classes += 'border-gray-200 ';
    }

    return classes;
  };

  const getPairNumber = (leftText: string, rightText: string) => {
    const pairIndex = pairs.findIndex(pair =>
      pair.left === leftText && pair.right === rightText
    );

    if (pairIndex === -1) return null;

    // Different colors for different states
    let bgColor = 'bg-blue-500';
    if (hasSubmitted) {
      const isCorrect = question.correctPairs.some(pair =>
        pair.left === leftText && pair.right === rightText
      );
      bgColor = isCorrect ? 'bg-green-500' : 'bg-red-500';
    }

    return (
      <span
        className={`absolute -left-3 -top-3 w-6 h-6 rounded-full ${bgColor} text-white flex items-center justify-center text-sm font-medium shadow-md z-10`}
      >
        {pairIndex + 1}
      </span>
    );
  };

  const isAllPaired = pairs.length === question.leftItems.length;
  const isComplete = isAllPaired || hasSubmitted;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">Match the Following</h2>
              <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                  {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                </span>
                <span className="mx-2">•</span>
                <span>{question.leftItems.length} items to match</span>
              </div>
            </div>
            {hasSubmitted && (
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                {isComplete ? (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Incomplete
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            <QuestionContent
              content={question.question}
              className="text-sm sm:text-base text-gray-700 mb-3"
            />
            {!hasSubmitted ? (
              <div className="flex items-center text-xs sm:text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Click on an item from the left column and then match it with an item from the right column.</span>
              </div>
            ) : showFeedback && (
              <div className={`flex items-center text-sm px-3 py-2 rounded-lg ${isComplete ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${isComplete ? 'text-green-500' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
                  {isComplete ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
                <span>{isComplete ? 'All items matched correctly!' : 'Some items are not matched yet.'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Match Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm font-medium text-gray-700 px-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Column A
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {question.leftItems.map((item, index) => (
                <div key={`left-${index}`} className="relative">
                  {getPairNumber(item.text, pairs.find(p => p.left === item.text)?.right || '')}
                  <motion.div
                    whileHover={!disabled && !hasSubmitted ? { scale: 1.01 } : {}}
                    whileTap={!disabled && !hasSubmitted ? { scale: 0.99 } : {}}
                    className={getLeftItemClasses(item.text)}
                    onClick={() => handleLeftItemClick(item.text)}
                  >
                    <div className="flex items-center">
                      <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 mr-2 sm:mr-3 transition-colors ${selectedLeft === item.text
                          ? 'border-blue-500 bg-blue-100'
                          : isLeftItemInIncorrectPair(item.text)
                            ? 'border-red-500 bg-red-100'
                            : isLeftItemInCorrectPair(item.text)
                              ? 'border-green-500 bg-green-100'
                              : pairs.some(p => p.left === item.text)
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 bg-white'
                        }`}>
                        {selectedLeft === item.text && (
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 m-0.5"></div>
                        )}
                        {hasSubmitted && isLeftItemInCorrectPair(item.text) && (
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500 m-0.5"></div>
                        )}
                        {hasSubmitted && isLeftItemInIncorrectPair(item.text) && (
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 m-0.5"></div>
                        )}
                      </span>
                      <div className="text-sm sm:text-base">
                        <QuestionContent content={item} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm font-medium text-gray-700 px-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              Column B
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {question.rightItems.map((item, index) => (
                <div key={`right-${index}`} className="relative">
                  {getPairNumber(pairs.find(p => p.right === item.text)?.left || '', item.text)}
                  <motion.div
                    whileHover={!disabled && !hasSubmitted ? { scale: 1.01 } : {}}
                    whileTap={!disabled && !hasSubmitted ? { scale: 0.99 } : {}}
                    className={getRightItemClasses(item.text)}
                    onClick={() => handleRightItemClick(item.text)}
                  >
                    <div className="flex items-center">
                      <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 mr-2 sm:mr-3 transition-colors ${selectedRight === item.text
                          ? 'border-purple-500 bg-purple-100'
                          : isRightItemInIncorrectPair(item.text)
                            ? 'border-red-500 bg-red-100'
                            : isRightItemInCorrectPair(item.text)
                              ? 'border-green-500 bg-green-100'
                              : pairs.some(p => p.right === item.text)
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-300 bg-white'
                        }`}>
                        {selectedRight === item.text && (
                          <div className="w-3 h-3 rounded-full bg-blue-500 m-0.5"></div>
                        )}
                        {hasSubmitted && isRightItemInCorrectPair(item.text) && (
                          <div className="w-3 h-3 rounded-full bg-green-500 m-0.5"></div>
                        )}
                        {hasSubmitted && isRightItemInIncorrectPair(item.text) && (
                          <div className="w-3 h-3 rounded-full bg-red-500 m-0.5"></div>
                        )}
                      </span>
                      <QuestionContent content={item} />
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!hasSubmitted ? (
              <div className="mt-4 flex flex-col sm:flex-row justify-between gap-3">
                <button
                  onClick={resetOrder}
                  disabled={disabled || pairs.length === 0}
                  className="order-2 sm:order-1 w-full sm:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset Pairs
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={disabled || pairs.length < question.correctPairs.length}
                  className="order-1 sm:order-2 w-full sm:w-auto px-6 py-2.5 bg-blue-500 text-white font-medium text-sm sm:text-base rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {pairs.length === question.correctPairs.length ? 'Submit Answer' : `Match All Items (${pairs.length}/${question.correctPairs.length})`}
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <div className={`p-4 rounded-lg mb-4 border-l-4 ${isFullyCorrect
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                  }`}>
                  <div className="flex items-start">
                    {isFullyCorrect ? (
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <div>
                      <p className={`font-medium ${isFullyCorrect ? 'text-green-800' : 'text-red-800 bg'}`}>
                        {isFullyCorrect
                          ? `Good job! You scored ${calculateScore().correct}/${question.marks} (${calculateScore().percentage}%)`
                          : `Incorrect. You scored: ${calculateScore().correct}/${question.marks}`}
                      </p>
                    </div>
                  </div>
                </div>

                {question.explanation && (
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
                )}
              </div>
            )}
             
      </div>
      <div className="w-full mt-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 gap-2 sm:gap-0">
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>Match the Following Question</span>
        </div>
        <div className="text-xs sm:text-sm font-medium text-gray-600 bg-white px-2.5 sm:px-3 py-1 rounded-full border border-gray-200">
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </div>
      </div>
    </div>
  );
};

export default MatchTheFollowingQuestion;
