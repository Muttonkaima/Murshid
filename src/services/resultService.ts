import api from './api';

interface QuestionResult {
  question: string;
  user_answer: any;
  correct_answer: any;
  explanation: string;
  status: 'correct' | 'incorrect' | 'partially_correct';
}

export interface QuizResultData {
  quizType: 'syllabus' | 'fundamentals';
  subject: string;
  branch: string;
  chapter: string;
  level: string;
  questions: QuestionResult[];
  scored: number;
  total_score: number;
  percentage: number;
}

export const resultService = {
  // Save quiz results
  async saveResult(resultData: QuizResultData) {
    try {
      const response = await api.post('/results', resultData);
      return response.data;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw error;
    }
  },

  // Get user's quiz results
  async getUserResults() {
    try {
      const response = await api.get('/results');
      return response.data;
    } catch (error) {
      console.error('Error fetching user results:', error);
      throw error;
    }
  },

  // Get a specific quiz result
  async getResultById(resultId: string) {
    try {
      const response = await api.get(`/results/${resultId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching result:', error);
      throw error;
    }
  },

  // Get results by subject
  async getResultsBySubject(subjectId: string) {
    try {
      const response = await api.get(`/results/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching results by subject:', error);
      throw error;
    }
  },

  // Get user's progress
  async getUserProgress() {
    try {
      const response = await api.get('/results/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }
};

export default resultService;
