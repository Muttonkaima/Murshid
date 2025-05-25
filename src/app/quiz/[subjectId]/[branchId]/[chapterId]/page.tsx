'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MCQQuestion from '@/components/questions/MCQQuestion';
import TrueFalseQuestion from '@/components/questions/TrueFalseQuestion';
import FillInTheBlanksQuestion from '@/components/questions/FillInTheBlanksQuestion';
import MatchTheFollowingQuestion from '@/components/questions/MatchTheFollowingQuestion';
import MultiSelectQuestion from '@/components/questions/MultiSelectQuestion';
import SortingQuestion from '@/components/questions/SortingQuestion';
import ReorderingQuestion from '@/components/questions/ReorderingQuestion';

type QuestionType = 'mcq' | 'true-false' | 'fill-in-blanks' | 'match-the-following' | 'multi-select' | 'sorting' | 'reordering';

const QuizPage = () => {
  const { subjectId, branchId, chapterId } = useParams();
  const searchParams = useSearchParams();
  
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: {answer: any, isCorrect: boolean}}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  
  // Get quiz settings from URL
  const questionType = searchParams.get('type') as QuestionType || 'mcq';
  const questionCount = parseInt(searchParams.get('count') || '10', 10);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setShowResults(false);
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        
        // Dynamically import the JSON file
        const module = await import(
          `@/data/10/STATE/subjects/${subjectId}/${branchId}/${chapterId}/${questionType}.json`
        );
        
        // Get the questions array from the imported module
        let questions = module.questions || [];
        
        if (questions.length === 0) {
          throw new Error('No questions found for the selected type');
        }
        
        // Shuffle questions if needed
        if (questionCount && questionCount < questions.length) {
          questions = questions
            .sort(() => 0.5 - Math.random())
            .slice(0, questionCount);
        }
        
        // Calculate total marks
        const marks = questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);
        setTotalMarks(marks);
        
        setQuestions(questions);
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
  }

  const handleAnswer = (answer: any, isCorrect: boolean) => {
    setCurrentAnswer(answer);
    const newUserAnswers: Record<number, UserAnswer> = {
      ...userAnswers,
      [currentQuestionIndex]: { answer, isCorrect }
    };
    setUserAnswers(newUserAnswers);
    
    // Calculate score
    const newScore = Object.values<UserAnswer>(newUserAnswers).reduce<number>(
      (acc: number, { isCorrect }: UserAnswer) => isCorrect ? acc + 1 : acc, 
      0
    );
    setScore(newScore);
    
    // Mark answer as submitted
    setIsAnswerSubmitted(true);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer(null);
      setIsAnswerSubmitted(false);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setCurrentAnswer(null);
      setIsAnswerSubmitted(false);
      setShowExplanation(false);
    }
  };
  
  const handleFinishQuiz = () => {
    setShowResults(true);
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const renderQuestion = () => {
    if (isLoading) {
      return <div>Loading questions...</div>;
    }

    if (questions.length === 0) {
      return <div>No questions available</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const commonProps = {
      question: currentQuestion,
      userAnswer: userAnswers[currentQuestionIndex],
      onAnswer: handleAnswer,
      showFeedback: true,
      disabled: false
    };

    switch (questionType) {
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
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {questionType.charAt(0).toUpperCase() + questionType.slice(1).replace('-', ' ')} Quiz
              </h1>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            <div className="mb-6">
              {renderQuestion()}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              
              <button
                onClick={goToNext}
                disabled={currentQuestionIndex >= questions.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {currentQuestionIndex >= questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default QuizPage;