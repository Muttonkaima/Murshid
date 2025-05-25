'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import QuestionContent from './QuestionContent';

// Dynamically import AudioPlayer with SSR disabled to prevent hydration issues
const AudioPlayer = dynamic(
  () => import('./AudioPlayer'),
  { ssr: false }
);

interface MatchItem {
  hide_text: boolean;
  text: string;
  read_text: boolean;
  read_text_url?: string;
  read_text_value?: string;
  image: string;
}

interface MatchTheFollowingQuestionProps {
  question: {
    id: string | number;
    type: string;
    marks: number;
    question: {
      hide_text: boolean;
      text: string;
      read_text: boolean;
      read_text_url?: string;
      image: string;
      read_text_value?: string;
    };
    leftItems: MatchItem[];
    rightItems: MatchItem[];
    correctMatches: Array<{left: string; right: string}>;
    explanation?: string;
  };
  onAnswer?: (matches: Record<string, string>, isCorrect: boolean) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  userAnswer?: { answer: Record<string, string>, isCorrect: boolean };
}

const MatchTheFollowingQuestion: React.FC<MatchTheFollowingQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  disabled = false,
  userAnswer,
}) => {
  // Helper function to normalize strings for comparison
  const normalize = (str: string) => String(str || '').trim().toLowerCase();
  type MatchResult = {
    score: number;
    total: number;
    evaluation: Record<string, boolean>;
    correctMatches: number;
    totalPossible: number;
    isPerfect: boolean;
  };

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState<{obtained: number; total: number} | null>(null);
  const [evaluation, setEvaluation] = useState<Record<string, boolean>>({});
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // Initialize with user's previous answer if it exists
  useEffect(() => {
    if (userAnswer) {
      setMatches(userAnswer.answer);
      setHasSubmitted(true);
      setShowExplanation(true);
      // Evaluate existing answer
      const result = evaluateMatches(userAnswer.answer);
      setMatchResult(result);
      setScore({ 
        obtained: result.score, 
        total: result.total 
      });
      setEvaluation(result.evaluation);
    } else {
      setMatches({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setHasSubmitted(false);
      setShowExplanation(false);
      setMatchResult(null);
      setScore(null);
      setEvaluation({});
    }
  }, [question.id, userAnswer]);

  const isCorrect = (leftItem: string, rightItem: string): boolean => {
    if (!question.correctMatches || !Array.isArray(question.correctMatches)) return false;
    
    const normalizedLeft = normalize(leftItem);
    const normalizedRight = normalize(rightItem);
    
    // Check if there's a matching pair in correctMatches
    return question.correctMatches.some(pair => 
      normalize(pair.left) === normalizedLeft && 
      normalize(pair.right) === normalizedRight
    );
  };

  const isItemMatched = (itemText: string, isLeft: boolean) => {
    if (isLeft) {
      return Object.keys(matches).includes(itemText);
    } else {
      return Object.values(matches).includes(itemText);
    }
  };

  const handleItemClick = (item: MatchItem, isLeft: boolean) => {
    if (disabled || hasSubmitted) return;

    const itemText = item.text;

    if (isLeft) {
      if (selectedLeft === itemText) {
        setSelectedLeft(null);
      } else if (selectedRight) {
        // Create a match
        const newMatches = { ...matches, [itemText]: selectedRight };
        setMatches(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);
        
        // Submit answer if all matches are made
        if (Object.keys(newMatches).length === question.leftItems.length) {
          const allCorrect = Object.entries(newMatches).every(([left, right]) => 
            isCorrect(left, right)
          );
          setHasSubmitted(true);
          setShowExplanation(true);
          if (onAnswer) {
            onAnswer(newMatches, allCorrect);
          }
        }
      } else {
        setSelectedLeft(itemText);
        if (selectedRight) setSelectedRight(null);
      }
    } else {
      if (selectedRight === itemText) {
        setSelectedRight(null);
      } else if (selectedLeft) {
        // Create a match
        const newMatches = { ...matches, [selectedLeft]: itemText };
        setMatches(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);
        
        // Submit answer if all matches are made
        if (Object.keys(newMatches).length === question.leftItems.length) {
          const allCorrect = Object.entries(newMatches).every(([left, right]) => 
            isCorrect(left, right)
          );
          setHasSubmitted(true);
          setShowExplanation(true);
          if (onAnswer) {
            onAnswer(newMatches, allCorrect);
          }
        }
      } else {
        setSelectedRight(itemText);
        if (selectedLeft) setSelectedLeft(null);
      }
    }
  };

  const getItemClasses = (item: MatchItem, isLeft: boolean) => {
    const itemText = item.text;
    let classes = 'p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between';
    
    if (disabled) {
      classes += 'opacity-70 cursor-not-allowed ';
    } else if (!hasSubmitted) {
      classes += 'hover:border-blue-400 ';
    }

    // Handle selection state
    if ((isLeft && selectedLeft === itemText) || (!isLeft && selectedRight === itemText)) {
      classes += 'border-blue-500 bg-blue-50 ';
    } 
    // Handle matched state
    else if (isItemMatched(itemText, isLeft)) {
      if (showFeedback) {
        const isCorrectMatch = isLeft 
          ? isCorrect(itemText, matches[itemText])
          : Object.entries(matches).some(([left, right]) => 
              right === itemText && isCorrect(left, right)
            );
        
        classes += isCorrectMatch 
          ? 'border-green-500 bg-green-50 ' 
          : 'border-red-500 bg-red-50 ';
      } else {
        classes += 'border-purple-500 bg-purple-50 ';
      }
    } 
    // Default state
    else {
      classes += 'border-gray-200 ';
    }

    return classes;
  };

  const renderItemContent = (item: MatchItem) => (
    <div className="flex items-center space-x-2">
      {!item.hide_text && (
        <span className="text-gray-800">{item.text}</span>
      )}
      {item.read_text && item.read_text_url && (
        <AudioPlayer 
          audioUrl={item.read_text_url} 
          // size="small"
          className="ml-2"
        />
      )}
      {item.image && (
        <div className="ml-2">
          <img 
            src={item.image} 
            alt="" 
            className="h-10 w-10 object-contain"
          />
        </div>
      )}
    </div>
  );

  // Evaluate matches and calculate score
  const evaluateMatches = (currentMatches = matches): MatchResult => {
    if (!question.correctMatches || !Array.isArray(question.correctMatches)) {
      return { 
        score: 0, 
        total: question.marks, 
        evaluation: {},
        correctMatches: 0,
        totalPossible: 0,
        isPerfect: false
      };
    }
    
    let correctCount = 0;
    const evaluation: Record<string, boolean> = {};
    const totalPossible = question.correctMatches.length;
    
    // Check each correct pair to see if it exists in user's matches
    question.correctMatches.forEach(correctPair => {
      const userMatch = Object.entries(currentMatches).find(
        ([left, right]) => 
          normalize(left) === normalize(correctPair.left) && 
          normalize(right) === normalize(correctPair.right)
      );
      
      if (userMatch) {
        evaluation[`${userMatch[0]}->${userMatch[1]}`] = true;
        correctCount++;
      }
    });
    
    // Calculate score based on percentage of correct matches
    const scorePercentage = totalPossible > 0 ? (correctCount / totalPossible) : 0;
    const obtainedScore = Math.round(scorePercentage * question.marks * 10) / 10; // 1 decimal place
    const isPerfect = correctCount === totalPossible && correctCount > 0;
    
    return {
      score: Math.min(obtainedScore, question.marks), // Ensure score doesn't exceed max marks
      total: question.marks,
      evaluation,
      correctMatches: correctCount,
      totalPossible,
      isPerfect
    };
  };

  // Auto-submit when all matches are made
  useEffect(() => {
    if (Object.keys(matches).length === question.leftItems.length && !hasSubmitted) {
      const result = evaluateMatches(matches);
      setMatchResult(result);
      setScore({ 
        obtained: result.score, 
        total: result.total 
      });
      setEvaluation(result.evaluation);
      setHasSubmitted(true);
      setShowExplanation(true);
      
      if (onAnswer) {
        onAnswer(matches, result.isPerfect);
      }
    }
  }, [matches, hasSubmitted, onAnswer, question.leftItems.length, question.marks]);

  // Check if a specific match is correct
  const isMatchCorrect = (left: string, right: string): boolean => {
    if (!hasSubmitted) return false;
    return isCorrect(left, right);
  };

  // Get the correct match for a left item
  const getCorrectMatch = (leftItem: string) => {
    if (!question.correctMatches || !Array.isArray(question.correctMatches)) return null;
    
    const normalizedLeft = normalize(leftItem);
    const match = question.correctMatches.find(
      pair => normalize(pair.left) === normalizedLeft
    );
    
    return match ? match.right : null;
  };

  // Check if all matches are correct
  const allCorrect = hasSubmitted && question.correctMatches &&
    Object.entries(matches).every(([left, right]) => isCorrect(left, right));

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto space-y-6">
      {/* Question */}
      <div className="mb-6">
        <QuestionContent content={question.question} />
      </div>
      
      {/* Match the following interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700 mb-2">Column A</h3>
          <div className="space-y-3">
            {question.leftItems.map((item, index) => {
              const isMatched = isItemMatched(item.text, true);
              return (
                <motion.div
                  key={`left-${index}`}
                  className={getItemClasses(item, true)}
                  onClick={() => handleItemClick(item, true)}
                  whileHover={!disabled && !hasSubmitted ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !hasSubmitted ? { scale: 0.98 } : {}}
                >
                  {renderItemContent(item)}
                  {isMatched && (
                    <span className="ml-2 text-green-600">
                      ✓
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700 mb-2">Column B</h3>
          <div className="space-y-3">
            {question.rightItems.map((item, index) => {
              const isMatched = isItemMatched(item.text, false);
              return (
                <motion.div
                  key={`right-${index}`}
                  className={getItemClasses(item, false)}
                  onClick={() => handleItemClick(item, false)}
                  whileHover={!disabled && !hasSubmitted ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !hasSubmitted ? { scale: 0.98 } : {}}
                >
                  {renderItemContent(item)}
                  {isMatched && (
                    <span className="ml-2 text-green-600">
                      ✓
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {hasSubmitted && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="font-medium">Score: </span>
              <span className={`font-bold ${score?.obtained === score?.total ? 'text-green-600' : 'text-blue-600'}`}>
                {score?.obtained} / {score?.total}
              </span>
              {score?.obtained === score?.total && (
                <span className="ml-2 text-green-600">✓ Perfect!</span>
              )}
            </div>
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
          </div>
          
          {showExplanation && question.explanation && (
            <div className="mt-2 text-gray-700 bg-white p-3 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-1">Explanation:</h4>
              <p>{question.explanation}</p>
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-800 mb-2">Your Matches:</h4>
            <ul className="space-y-2">
              {question.leftItems.map((leftItem) => {
                const leftText = leftItem.text;
                const userMatch = matches[leftText];
                const isCorrectMatch = userMatch ? isMatchCorrect(leftText, userMatch) : false;
                const correctMatch = getCorrectMatch(leftText);
                
                return (
                  <li 
                    key={leftText}
                    className={`p-3 rounded-lg border-2 ${
                      isCorrectMatch 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{leftText}</span>
                      <span className="mx-2">→</span>
                      <span className={isCorrectMatch ? 'text-green-700' : 'text-red-700'}>
                        {userMatch || 'Not matched'}
                      </span>
                      {userMatch && (
                        <span className={`ml-2 ${isCorrectMatch ? 'text-green-600' : 'text-red-600'}`}>
                          {isCorrectMatch ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                    {!isCorrectMatch && correctMatch && (
                      <div className="mt-1 text-sm text-gray-600">
                        Correct answer: <span className="text-green-700 font-medium">{correctMatch}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      
      {/* Marks */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
      </div>
    </div>
  );
};

export default MatchTheFollowingQuestion;
