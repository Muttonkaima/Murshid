import { QuestionType } from '@/types/quiz';

// Map question type to their corresponding file names
const questionTypeToFileMap: Record<QuestionType, string> = {
  'multiple-choice': 'mcq',
  'true-false': 'true-false',
  'fill-in-blanks': 'fill-in-blanks',
  'match-the-following': 'match-the-following',
  'multi-select': 'multi-select',
  'sorting': 'sorting',
  'reordering': 'reordering',
};

export const getQuestionFileName = (type: QuestionType): string => {
  return questionTypeToFileMap[type] || '';
};

// Function to get a random subset of questions
export const getRandomQuestions = <T>(questions: T[], count: number): T[] => {
  if (count >= questions.length) {
    return [...questions].sort(() => Math.random() - 0.5);
  }
  
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to calculate score for a question
export const calculateQuestionScore = (question: any, answer: any): number => {
  if (!answer) return 0;
  
  switch (question.questionType) {
    case 'multiple-choice':
      return answer === question.correctAnswer ? question.marks : 0;
      
    case 'true-false':
      return answer === question.correctAnswer ? question.marks : 0;
      
    case 'fill-in-blanks':
      const normalizedAnswer = answer.trim().toLowerCase();
      const normalizedCorrect = question.correctAnswer.toLowerCase();
      const alternatives = (question.alternatives || []).map((a: string) => a.toLowerCase());
      
      return (normalizedAnswer === normalizedCorrect || alternatives.includes(normalizedAnswer))
        ? question.marks
        : 0;
        
    case 'match-the-following':
      // For matching questions, we'll consider it all or nothing
      if (!Array.isArray(answer)) return 0;
      const correctMatches = answer.filter((match: any) => 
        question.correctOrder.some(correct => 
          correct.left === match.left && correct.right === match.right
        )
      );
      return (correctMatches.length / question.correctOrder.length) * question.marks;
      
    case 'multi-select':
      if (!Array.isArray(answer)) return 0;
      const correctAnswers = question.correctAnswers;
      const selectedCorrect = answer.filter((a: string) => correctAnswers.includes(a)).length;
      const selectedIncorrect = answer.length - selectedCorrect;
      const score = Math.max(0, (selectedCorrect - selectedIncorrect) / correctAnswers.length) * question.marks;
      return Math.round(score * 10) / 10; // Round to 1 decimal place
      
    case 'sorting':
    case 'reordering':
      if (!Array.isArray(answer)) return 0;
      let correctCount = 0;
      for (let i = 0; i < Math.min(answer.length, question.correctOrder.length); i++) {
        if (answer[i] === question.correctOrder[i]) {
          correctCount++;
        }
      }
      return (correctCount / question.correctOrder.length) * question.marks;
      
    default:
      return 0;
  }
};

// Function to get the appropriate question component
export const getQuestionComponent = (type: QuestionType) => {
  switch (type) {
    case 'multiple-choice':
      return 'MCQQuestion';
    case 'true-false':
      return 'TrueFalseQuestion';
    case 'fill-in-blanks':
      return 'FillInTheBlanksQuestion';
    case 'match-the-following':
      return 'MatchTheFollowingQuestion';
    case 'multi-select':
      return 'MultiSelectQuestion';
    case 'sorting':
      return 'SortingQuestion';
    case 'reordering':
      return 'ReorderingQuestion';
    default:
      return 'div'; // Fallback
  }
};
