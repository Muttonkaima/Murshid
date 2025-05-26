'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MCQQuestion from '@/components/questions/MCQQuestion';
import TrueFalseQuestion from '@/components/questions/TrueFalseQuestion';
import FillInTheBlanksQuestion from '@/components/questions/FillInTheBlanksQuestion';
import MatchTheFollowingQuestion from '@/components/questions/MatchTheFollowingQuestion';
import MultiSelectQuestion from '@/components/questions/MultiSelectQuestion';
import SortingQuestion from '@/components/questions/SortingQuestion';
import ReorderingQuestion from '@/components/questions/ReorderingQuestion';

type QuestionType = 'mcq' | 'true-false' | 'fill-in-blanks' | 'match-the-following' | 'multi-select' | 'sorting' | 'reordering' | 'all';

const ALL_QUESTION_TYPES: QuestionType[] = [
  'mcq',
  'true-false',
  'fill-in-blanks',
  'match-the-following',
  'multi-select',
  'sorting',
  'reordering'
];

const QuizPage = () => {
  const { subjectId, branchId, chapterId } = useParams();
  const searchParams = useSearchParams();
  
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: {answer: any, isCorrect: boolean}}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [score, setScore] = useState(0);
  const [totalPossibleMarks, setTotalPossibleMarks] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLimit, setTimeLimit] = useState(60); // 1 minute in seconds
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // Calculate score and statistics
  const totalQuestions = questions.length;
  const correctAnswers = Object.values(userAnswers).filter(answer => answer?.isCorrect).length;
  const scorePercentage = totalPossibleMarks > 0 ? Math.round((score / totalPossibleMarks) * 100) : 0;
  const timePerQuestion = totalQuestions > 0 ? Math.round(timeElapsed / totalQuestions) : 0;
  
  // Get performance message based on score
  const getPerformanceMessage = () => {
    if (scorePercentage >= 90) return 'Outstanding! 🎯';
    if (scorePercentage >= 75) return 'Great Job! 🎉';
    if (scorePercentage >= 50) return 'Good Effort! 👍';
    return 'Keep Practicing! 💪';
  };
  
  // Get performance color based on score
  const getPerformanceColor = (forSvg = false) => {
    if (scorePercentage >= 75) return forSvg ? 'rgb(5, 150, 105)' : 'text-emerald-600';
    if (scorePercentage >= 50) return forSvg ? 'rgb(245, 158, 11)' : 'text-amber-500';
    return forSvg ? 'rgb(239, 68, 68)' : 'text-red-500';
  };
  
  // Get performance color for SVG
  const getSvgPerformanceColor = () => {
    if (scorePercentage >= 75) return 'rgb(5, 150, 105)'; // emerald-600
    if (scorePercentage >= 50) return 'rgb(245, 158, 11)'; // amber-500
    return 'rgb(239, 68, 68)'; // red-500
  };
  
  // Get performance emoji based on score
  const getPerformanceEmoji = () => {
    if (scorePercentage >= 90) return '🏆';
    if (scorePercentage >= 75) return '✨';
    if (scorePercentage >= 50) return '👍';
    return '💡';
  };

  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const renderAnswerText = (answer: any): React.ReactNode => {
    if (!answer) return null;
    
    // Handle array answers (for multi-select, matching, etc.)
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    
    // Handle object answers (for matching, fill-in-blanks, etc.)
    if (typeof answer === 'object') {
      // For matching questions
      if (answer.pair1 && answer.pair2) {
        return `${answer.pair1} → ${answer.pair2}`;
      }
      // For fill-in-blanks
      if (answer.text !== undefined) {
        return answer.text;
      }
      // For question/answer objects with hide_text, text, read_text, image
      if ('text' in answer || 'hide_text' in answer || 'read_text' in answer) {
        return (
          <div className="space-y-2">
            {answer.text && <div>{answer.text}</div>}
            {answer.hide_text && <div className="font-medium">{answer.hide_text}</div>}
            {answer.read_text && <div className="text-sm text-gray-600">{answer.read_text}</div>}
            {answer.image && (
              <div className="mt-2">
                <img 
                  src={answer.image} 
                  alt="Question illustration" 
                  className="max-w-full h-auto rounded-md border border-gray-200"
                />
              </div>
            )}
          </div>
        );
      }
      // Fallback for other object types
      return JSON.stringify(answer);
    }
    
    // Handle primitive types
    return String(answer);
  };
  
  // Calculate time percentage for progress and get color based on remaining time
  const timePercentage = (timeLeft / timeLimit) * 100;
  
  // Get color based on time percentage (smooth transition between green, orange, and red)
  const getTimeBarColor = (percentage: number) => {
    if (percentage > 60) {
      // Green to yellow (60-100%)
      return `var(--primary-color)`; // Green-400 with opacity
    } else if (percentage > 30) {
      // Yellow to orange (30-60%)
      return `rgb(251, 191, 36)`; // Yellow-400 with opacity
    } else {
      // Orange to red (0-30%)
      // const ratio = percentage / 30; // Normalize to 0-1 range for 0-30%
      return `rgb(239, 68, 68)`; // Red-500 with opacity
    }
  };
  
  // Initialize timer with correct initial value
  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  // Move handleFinishQuiz before it's used in effects
  const handleFinishQuiz = useCallback(() => {
    if (!showResults) {
      setIsTimerRunning(false);
      setShowResults(true);
      
      // Mark unanswered questions as incorrect
      const unansweredQuestions = questions.reduce((acc, _, index) => {
        if (!userAnswers[index]) {
          return { ...acc, [index]: { answer: null, isCorrect: false, marksObtained: 0, maxMarks: questions[index].marks || 1 } };
        }
        return acc;
      }, {});
      
      if (Object.keys(unansweredQuestions).length > 0) {
        setUserAnswers(prev => ({
          ...prev,
          ...unansweredQuestions
        }));
      }
    }
  }, [questions, showResults, userAnswers]);

  // Timer effect - client-side only
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    let interval: NodeJS.Timeout;
    
    const handleTimerTick = () => {
      setTimeElapsed(prev => prev + 1);
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    };
    
    if (isTimerRunning && !showResults && timeLeft > 0) {
      interval = setInterval(handleTimerTick, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, showResults, timeLeft, handleFinishQuiz]);
  
  // Calculate progress percentage based on answered questions
  const progress = questions.length > 0 
    ? (Object.keys(userAnswers).length / questions.length) * 100 
    : 0;
  
  // Get quiz settings from URL
  const questionType = searchParams.get('type') as QuestionType || 'mcq';
  const questionCount = parseInt(searchParams.get('count') || '10', 10);

  // Set time limit based on question count - client-side only
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // 30 seconds per question as default
    const calculatedTime = questionCount * 12;
    setTimeLimit(calculatedTime);
    setTimeLeft(calculatedTime);
  }, [questionCount]);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setShowResults(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setTimeElapsed(0);
        setIsTimerRunning(true);
        
        const typesToLoad = questionType === 'all' ? ALL_QUESTION_TYPES : [questionType];
        const questionsByType: Record<string, any[]> = {};
        
        // Load questions from all specified types
        for (const type of typesToLoad) {
          try {
            const module = await import(
              `@/data/10/STATE/subjects/${subjectId}/${branchId}/${chapterId}/${type}.json`
            );
            if (module.questions?.length > 0) {
              questionsByType[type] = module.questions.map((q: any) => ({
                ...q,
                originalType: type // Store the original type for rendering
              }));
            }
          } catch (e) {
            console.warn(`Failed to load questions for type: ${type}`, e);
            // Continue with other types even if one fails
          }
        }
        
        // Check if we have any questions at all
        const totalQuestions = Object.values(questionsByType).reduce((sum, qs) => sum + qs.length, 0);
        if (totalQuestions === 0) {
          throw new Error('No questions found for the selected types');
        }
        
        let selectedQuestions: any[] = [];
        
        if (questionType === 'all') {
          // For 'all' type, distribute questions evenly across all available types
          const typesWithQuestions = Object.entries(questionsByType)
            .filter(([_, qs]) => qs.length > 0)
            .map(([type]) => type);
          
          const questionsPerType = Math.max(1, Math.floor(questionCount / typesWithQuestions.length));
          
          for (const type of typesWithQuestions) {
            const availableQuestions = [...questionsByType[type]].sort(() => 0.5 - Math.random());
            const questionsToTake = Math.min(questionsPerType, availableQuestions.length);
            selectedQuestions.push(...availableQuestions.slice(0, questionsToTake));
          }
          
          // If we don't have enough questions, add more from types that have them
          if (selectedQuestions.length < questionCount) {
            const remaining = questionCount - selectedQuestions.length;
            const allShuffled = Object.values(questionsByType)
              .flat()
              .sort(() => 0.5 - Math.random());
            
            selectedQuestions = [
              ...selectedQuestions,
              ...allShuffled
                .filter(q => !selectedQuestions.includes(q))
                .slice(0, remaining)
            ];
          }
        } else {
          // For single question type, just take the requested number of questions
          const questions = questionsByType[questionType] || [];
          selectedQuestions = [...questions]
            .sort(() => 0.5 - Math.random())
            .slice(0, questionCount);
        }
        
        // Final shuffle to mix the questions from different types
        selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random());
        
        // Calculate total possible marks from all questions
        const totalMarks = selectedQuestions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);
        setTotalPossibleMarks(totalMarks);
        
        // Initialize score to 0
        setScore(0);
        
        setQuestions(selectedQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        setError(error instanceof Error ? error.message : 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [subjectId, branchId, chapterId, questionType, questionCount]);

  interface UserAnswer {
    answer: any;
    isCorrect: boolean;
    marksObtained: number;
    maxMarks: number;
  }

  const calculateMarksObtained = (question: any, answer: any, isCorrect: boolean): number => {
    // Default to full marks if no marks specified
    const maxMarks = question.marks || 1;
    
    // If answer is incorrect, return 0
    if (!isCorrect) return 0;
    
    // For partial marking in specific question types
    switch (question.type) {
      case 'match-the-following':
      case 'sorting':
      case 'reordering':
        // For these types, we might have partial marks
        // Assuming answer contains a 'score' property with the partial score (0-1)
        if (answer?.score !== undefined) {
          return Math.round(maxMarks * answer.score);
        }
        return isCorrect ? maxMarks : 0;
      
      case 'fill-in-the-blanks':
        // For fill in blanks, check if there are alternatives
        if (question.alternatives && question.alternatives.length > 0) {
          // If answer matches any alternative, return full marks
          return question.alternatives.includes(answer) ? maxMarks : 0;
        }
        return isCorrect ? maxMarks : 0;
      
      default:
        // For other types (MCQ, True/False), it's all or nothing
        return isCorrect ? maxMarks : 0;
    }
  };

  const handleAnswer = (answer: any, isCorrect: boolean) => {
    setCurrentAnswer(answer);
    
    const currentQuestion = questions[currentQuestionIndex];
    const maxMarks = currentQuestion.marks || 1;
    let marksObtained = 0;
    
    // Calculate marks based on question type and answer
    if (isCorrect) {
      if (currentQuestion.type === 'match-the-following' || 
          currentQuestion.type === 'sorting' || 
          currentQuestion.type === 'reordering') {
        // For these types, check if answer has a score property for partial marks
        marksObtained = answer?.score ? Math.round(maxMarks * answer.score) : maxMarks;
      } else if (currentQuestion.type === 'fill-in-blanks' && currentQuestion.alternatives) {
        // For fill in blanks with alternatives, check if answer matches any alternative
        marksObtained = currentQuestion.alternatives.includes(answer) ? maxMarks : 0;
      } else {
        // For other types, it's all or nothing
        marksObtained = isCorrect ? maxMarks : 0;
      }
    }
    
    const newUserAnswers: Record<number, UserAnswer> = {
      ...userAnswers,
      [currentQuestionIndex]: { 
        answer, 
        isCorrect,
        marksObtained,
        maxMarks
      }
    };
    
    setUserAnswers(newUserAnswers);
    
    // Calculate total score based on marks obtained
    const totalMarksObtained = Object.values<UserAnswer>(newUserAnswers).reduce<number>(
      (acc: number, ans) => acc + (ans?.marksObtained || 0), 
      0
    );
    
    setScore(totalMarksObtained);
    
    // Mark answer as submitted
    setIsAnswerSubmitted(true);
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswerSubmitted(false);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsAnswerSubmitted(false);
    }
  };

  const renderQuestion = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>;
    }

    if (questions.length === 0) {
      return <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900">No questions available</h3>
        <p className="mt-2 text-gray-500">Please try a different chapter or question type.</p>
      </div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const commonProps = {
      question: currentQuestion,
      userAnswer: userAnswers[currentQuestionIndex],
      onAnswer: handleAnswer,
      showFeedback: true,
      disabled: isAnswerSubmitted
    };

    // Use the question's originalType if it exists (for 'all' type quizzes), otherwise use the quiz type
    const questionTypeToRender = currentQuestion.originalType || questionType;

    switch (questionTypeToRender) {
      case 'mcq':
        return <MCQQuestion {...commonProps} />;
      case 'true-false':
        return <TrueFalseQuestion {...commonProps} />;
      case 'fill-in-blanks':
        return <FillInTheBlanksQuestion {...commonProps} />;
      case 'match-the-following':
        return <MatchTheFollowingQuestion {...commonProps} />;
      case 'multi-select':
        return <MultiSelectQuestion {...commonProps} />;
      case 'sorting':
        return <SortingQuestion {...commonProps} />;
      case 'reordering':
        return <ReorderingQuestion {...commonProps} />;
      default:
        return <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Unsupported question type: {questionTypeToRender}
              </p>
            </div>
          </div>
        </div>;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {showResults ? (
            // Results screen
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full mx-auto">
              {/* Header with score */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold">Quiz Completed!</h1>
                    <p className="text-blue-100">
                      You've completed the {questionType === 'all' 
                        ? 'Mixed Question Types' 
                        : questionType.replace(/-/g, ' ')} quiz
                    </p>
                  </div>
                  <div className="text-5xl">{getPerformanceEmoji()}</div>
                </div>
                
                {/* Score Circle */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="transition-all duration-1000 ease-linear ease-in-out"
                        style={{
                          strokeDasharray: '251.2',
                          strokeDashoffset: `${251.2 * (1 - scorePercentage / 100)}`,
                          stroke: getSvgPerformanceColor(),
                          transform: 'rotate(-90deg)',
                          transformOrigin: '50% 50%'
                        }}
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{scorePercentage}%</span>
                      <span className="text-sm text-blue-100">Score</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {score} <span className="text-sm font-normal text-gray-500">/ {Object.values(userAnswers as Record<string, UserAnswer>).reduce<number>((acc, ans) => acc + (ans?.maxMarks || 0), 0)}</span>
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Percentage</p>
                  <p className="text-2xl font-bold text-blue-600">{scorePercentage}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Time Taken</p>
                  <p className="text-xl font-bold text-purple-600">{formatTime(timeElapsed)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Avg. Time/Question</p>
                  <p className="text-xl font-bold text-blue-600">{timePerQuestion}s</p>
                </div>
              </div>
              
              {/* Performance Message */}
              <div className="px-6 pb-6">
                <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <span className={`text-2xl mr-3 ${getPerformanceColor()}`}>{getPerformanceEmoji()}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{getPerformanceMessage()}</h3>
                      <p className="text-sm text-gray-500">
                        {scorePercentage >= 75 
                          ? 'You have a solid understanding of this topic! Keep up the great work!'
                          : scorePercentage >= 50
                          ? 'Good effort! Review the questions to improve your score.'
                          : 'Keep practicing! You\'ll get better with more practice.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowDetailedResults(!showDetailedResults)}
                  className="flex-1 py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                >
                  {showDetailedResults ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              {/* Detailed Results */}
              {showDetailedResults && (
                <div className="border-t border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                          expandedQuestion === index ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <button
                          className={`w-full text-left p-4 flex justify-between items-center focus:outline-none ${
                            userAnswers[index]?.isCorrect ? 'bg-green-50' : 'bg-red-50'
                          }`}
                          onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                        >
                          <div className="flex items-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                              userAnswers[index]?.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {userAnswers[index]?.isCorrect ? '✓' : '✗'}
                            </span>
                            <span className="font-medium">Question {index + 1}</span>
                          </div>
                          <svg 
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              expandedQuestion === index ? 'transform rotate-180' : ''
                            }`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {expandedQuestion === index && (
                          <div className="p-4 bg-white">
                            <p className="font-medium mb-2">{question.question}</p>
                            <div className="mt-3">
                              <p className="text-sm text-gray-600">Your answer: <span className={`font-medium ${
                                userAnswers[index]?.isCorrect ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {renderAnswerText(userAnswers[index]?.answer) || 'Not answered'}
                              </span></p>
                              {!userAnswers[index]?.isCorrect && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Correct answer: <span className="font-medium text-green-600">
                                    {renderAnswerText(question.correctAnswer)}
                                  </span>
                                </p>
                              )}
                              {question.explanation && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                                  <p className="text-sm text-blue-700">
                                    <span className="font-medium">Explanation:</span> {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Modern Quiz Screen
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="bg-white rounded-t-2xl shadow-sm p-6 pb-4 mb-6">
                <div className="flex flex-col flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {questionType.charAt(0).toUpperCase() + questionType.slice(1).replace('-', ' ')} Quiz
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Test your knowledge</p>
                  </div>
                  
                  {/* Timer - Modern Card */}
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-18 h-18 flex-shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            className="text-blue-100"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="38"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.4, 0, 0.2, 1)]"
                            style={{
                              stroke: getTimeBarColor(timePercentage),
                              strokeDasharray: '239',
                              strokeDashoffset: 239 - (239 * timePercentage / 100),
                              transitionProperty: 'stroke-dashoffset',
                              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                              transitionDuration: '300ms'
                            }}
                            strokeWidth="8"
                            strokeLinecap="round"
                            fill="transparent"
                            r="38"
                            cx="50"
                            cy="50"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-800">
                            {formatTime(timeLeft)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Question <span className="font-bold">{currentQuestionIndex + 1}</span> of {questions.length}
                    </p>
                    <span className="text-sm font-medium text-gray-600">{Math.round(progress)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question Content */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="prose max-w-none">
                  {renderQuestion()}
                </div>
              </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={goToPrevious}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={currentQuestionIndex >= questions.length - 1 ? handleFinishQuiz : goToNext}
                    className="px-6 py-2 bg-[var(--primary-color)] text-white rounded hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {currentQuestionIndex >= questions.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default QuizPage;