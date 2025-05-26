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
  onAnswer?: (pairs: MatchPair[], isCorrect: boolean) => void;
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
    const isFullyCorrect = score.correct === score.total;
    
    if (onAnswer) {
      onAnswer(pairs, isFullyCorrect);
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
    <div className="space-y-6">
      <div className="mb-6">
        <QuestionContent 
          content={question.question} 
          className="text-lg font-medium text-gray-800 mb-2"
        />
        <div className="text-sm text-gray-500">
          {!hasSubmitted && (
            <p>Click on an item from the left and then match it with an item from the right.</p>
          )}
          {hasSubmitted && showFeedback && (
            <p className={isComplete ? 'text-green-600' : 'text-yellow-600'}>
              {isComplete ? '✓ All items matched!' : 'Some items are not matched yet.'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700 mb-2">Column A</h3>
          <div className="space-y-3">
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
                    <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mr-3 transition-colors ${
                      selectedLeft === item.text 
                        ? 'border-blue-500 bg-blue-100' 
                        : isLeftItemInIncorrectPair(item.text)
                          ? 'border-red-500 bg-red-100'
                          : isLeftItemInCorrectPair(item.text)
                            ? 'border-green-500 bg-green-100'
                            : pairs.some(p => p.left === item.text) 
                              ? 'border-blue-300 bg-blue-50' 
                              : 'border-gray-300 bg-white'
                    }`}>
                      {selectedLeft === item.text && (
                        <div className="w-3 h-3 rounded-full bg-blue-500 m-0.5"></div>
                      )}
                      {hasSubmitted && isLeftItemInCorrectPair(item.text) && (
                        <div className="w-3 h-3 rounded-full bg-green-500 m-0.5"></div>
                      )}
                      {hasSubmitted && isLeftItemInIncorrectPair(item.text) && (
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

        {/* Right Column */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700 mb-2">Column B</h3>
          <div className="space-y-3">
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
                    <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mr-3 transition-colors ${
                      selectedRight === item.text 
                        ? 'border-blue-500 bg-blue-100' 
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

      <div className="flex justify-between items-center mt-6">
        {hasSubmitted && score && (
          <div className="text-lg font-medium">
            Score: <span className={`font-bold ${
              score.percentage >= 80 ? 'text-green-600' : 
              score.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {score.correct} / {score.total} ({score.percentage}%)
            </span>
          </div>
        )}
        {!hasSubmitted && (
          <div className="text-sm text-gray-500">
            {pairs.length} of {question.correctPairs.length} pairs matched
          </div>
        )}
        <div>
          {!hasSubmitted ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={disabled || pairs.length === 0}
              className={`px-6 py-2 rounded-lg font-medium ${
                disabled || pairs.length === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Submit
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </motion.button>
          )}
        </div>
      </div>

      {showExplanation && question.explanation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <h4 className="font-medium text-blue-800 mb-2">Explanation</h4>
          <div 
            className="prose max-w-none text-blue-700"
            dangerouslySetInnerHTML={{ __html: question.explanation }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default MatchTheFollowingQuestion;
