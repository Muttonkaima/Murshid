'use client';

import { useState, useEffect } from 'react';
import { 
  FiBook, 
  FiCalendar, 
  FiAward, 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiChevronUp, 
  FiLayers, 
  FiClock, 
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';
import Sidebar from '@/components/layout/Sidebar';
import { resultService } from '@/services/resultService';
import { authService } from '@/services/authService';

// Modal component for showing quiz details
const QuestionAccordion = ({ question, index, isOpen, onClick }: { 
  question: any, 
  index: number,
  isOpen: boolean,
  onClick: () => void 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'text-green-700 bg-green-100';
      case 'incorrect': return 'text-red-700 bg-red-100';
      case 'partially_correct': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />;
      case 'incorrect':
        return <FiXCircle className="text-red-500 mr-2 flex-shrink-0" />;
      case 'partially_correct':
        return <FiAlertCircle className="text-yellow-500 mr-2 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format answer with proper indentation and styling for arrays, objects, and nested structures
  const formatAnswer = (answer: any): React.ReactNode => {
    if (answer === null || answer === undefined) return 'Not answered';

    // ✅ Matching pairs array: [{left: "", right: ""}, ...]
    if (
      Array.isArray(answer) &&
      answer.length &&
      typeof answer[0] === 'object' &&
      'left' in answer[0] &&
      'right' in answer[0]
    ) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {answer.map((pair: any, idx: number) => (
            <li key={idx}>
              <strong>{pair.left}</strong> → {pair.right}
            </li>
          ))}
        </ul>
      );
    }

    // ✅ Array of primitives
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }

    // ✅ Primitive: string, number, boolean
    if (typeof answer === 'string' || typeof answer === 'number' || typeof answer === 'boolean') {
      return String(answer);
    }

    // ✅ Matching pair object
    if ('pair1' in answer && 'pair2' in answer) {
      return `${answer.pair1} → ${answer.pair2}`;
    }

    // ✅ Fill-in-the-blank style object
    if ('text' in answer || 'hide_text' in answer || 'read_text' in answer || 'image' in answer) {
      return (
        <div className="space-y-2">
          {answer.text && <div>{answer.text}</div>}
          {answer.hide_text && <div className="font-medium">{answer.hide_text}</div>}
          {answer.read_text && <div className="text-sm text-gray-600">{answer.read_text}</div>}
          {answer.image && (
            <div className="mt-2">
              <img
                src={answer.image}
                alt="Answer illustration"
                className="max-w-full h-auto rounded-md border border-gray-200"
              />
            </div>
          )}
        </div>
      );
    }

    // ✅ Object with keys mapping to arrays (like { English: [...], Dutch: [...] })
    // ✅ Object with keys mapping to arrays (like { English: [...], Dutch: [...] })
    if (
      typeof answer === 'object' &&
      !Array.isArray(answer) &&
      Object.values(answer).every((val) => Array.isArray(val))
    ) {
      return (
        <div className="space-y-2">
          {(Object.entries(answer) as [string, any[]][]).map(([language, names]) => (
            <div key={language}>
              <strong>{language}:</strong> {names.join(', ')}
            </div>
          ))}
        </div>
      );
    }


    // ✅ Malformed: { undefined: [...] }
    const keys = Object.keys(answer);
    if (keys.length === 1 && Array.isArray(answer[keys[0]])) {
      return answer[keys[0]].join(', ');
    }

    // ✅ Fallback: show JSON
    return <pre className="text-xs text-gray-900">{JSON.stringify(answer, null, 2)}</pre>;
  };

  const isCorrect = question.status === 'correct';
  const isPartiallyCorrect = question.status === 'partially_correct';

  return (
    <div className={`border rounded-lg overflow-hidden mb-3 transition-all duration-200 ${
      isCorrect ? 'border-green-200 bg-green-50' : 
      !isCorrect && !isPartiallyCorrect ? 'border-red-200 bg-red-50' : 
      'border-yellow-200 bg-yellow-50'
    }`}>
      <button
        className={`w-full px-5 py-4 text-left flex items-start justify-between focus:outline-none transition-colors cursor-pointer ${
          isOpen ? 'bg-opacity-50' : 'hover:bg-opacity-30'
        } ${isCorrect ? 'bg-green-50' : !isCorrect && !isPartiallyCorrect ? 'bg-red-50' : 'bg-yellow-50'}`}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={`question-${index}-content`}
      >
        <div className="flex items-start flex-1 min-w-0">
          <div className={`flex items-center justify-center h-6 w-6 rounded-full flex-shrink-0 mt-0.5 mr-3 ${
            isCorrect ? 'bg-green-100 text-green-800' : 
            !isCorrect && !isPartiallyCorrect ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            <span className="text-sm font-medium">{index + 1}</span>
          </div>
          <div className="text-left">
            <p className="text-gray-900 font-medium">{question.question || `Question ${index + 1}`}</p>
            <div className="mt-1 flex items-center">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                isCorrect ? 'bg-green-100 text-green-800' : 
                !isCorrect && !isPartiallyCorrect ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {getStatusText(question.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex items-center">
          {isOpen ? (
            <FiChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <FiChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>
      <div 
        id={`question-${index}-content`}
        className={`overflow-y-auto transition-all duration-200 ${isOpen ? 'max-h-150' : 'max-h-0'}`}
      >
        <div className="p-4 bg-white border-t border-gray-100 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Your Answer:</p>
            <div className="bg-gray-50 p-4 rounded-md text-sm border border-gray-200 overflow-x-auto">
              <div className="whitespace-pre-wrap font-mono text-sm text-gray-900">
                {formatAnswer(question.user_answer)}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Correct Answer:</p>
            <div className="bg-green-50 p-4 rounded-md text-sm border border-green-100 overflow-x-auto">
              <div className="whitespace-pre-wrap font-mono text-sm text-green-900">
                {formatAnswer(question.correct_answer)}
              </div>
            </div>
          </div>
          {question.explanation && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">Explanation:</p>
              <p className="mt-1 text-sm text-blue-700">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const QuizDetailsModal = ({ result, onClose }: { result: QuizResult | null, onClose: () => void }) => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  
  if (!result) return null;

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />;
      case 'incorrect':
        return <FiXCircle className="text-red-500 mr-2 flex-shrink-0" />;
      case 'partially_correct':
        return <FiAlertCircle className="text-yellow-500 mr-2 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:block sm:p-0">
        {/* Modal panel */}
        <div 
          className="relative inline-block w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-6 py-5 sm:p-6">
            <div className="flex justify-center sticky top-0 z-10 text-center bg-white">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {result.subject} <br /> {result.quizType === 'syllabus' ? `Chapter: ${result.chapter}` : `Level: ${result.level}`}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {result.quizType === 'syllabus' ? 'Syllabus Quiz' : 'Fundamentals Quiz'}
                  {result.quizType === 'syllabus' && result.branch && ` • ${result.branch}`}
                </p>
              </div>
            </div>

            {/* Score Summary */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white px-4 py-5 shadow-lg rounded-lg">
                <p className="text-sm font-medium text-gray-500">Score</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {result.scored} <span className="text-lg text-gray-500">/ {result.total_score}</span>
                </p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${result.percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-500">{result.percentage.toFixed(1)}%</p>
              </div>

              <div className="bg-white px-4 py-5 shadow-lg rounded-lg">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1 flex items-center">
                  {result.percentage >= 50 ? (
                    <FiCheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <FiXCircle className="h-8 w-8 text-red-500" />
                  )}
                  <span className="ml-2 text-xl font-semibold text-gray-900">
                    {result.percentage >= 50 ? 'Passed' : 'Failed'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {result.questions.filter(q => q.status === 'correct').length} of {result.questions.length} correct
                </p>
              </div>

              <div className="bg-white px-4 py-5 shadow-lg rounded-lg">
                <p className="text-sm font-medium text-gray-500">Date & Time</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {new Date(result.date_time).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(result.date_time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>

            {/* Questions Section */}
            <div className="mt-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Questions</h4>
              <div className="space-y-3">
                {result.questions.map((question, index) => (
                  <QuestionAccordion
                    key={index}
                    question={question}
                    index={index}
                    isOpen={openQuestion === index}
                    onClick={() => toggleQuestion(index)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 sm:px-6 sticky bottom-0 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {result.questions.length} question{result.questions.length !== 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuizResult {
  _id: string;
  subject: string;
  quizType: 'syllabus' | 'fundamentals';
  branch?: string;
  chapter?: string;
  level?: string;
  scored: number;
  total_score: number;
  percentage: number;
  date_time: string;
  questions: Array<{
    question: string;
    user_answer: any;
    correct_answer: any;
    explanation: string;
    status: 'correct' | 'incorrect' | 'partially_correct';
  }>;
}

const ResultsPage = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);

  // Fetch user's results on component mount
  useEffect(() => {
    const fetchResults = async () => {
      if (!authService.isAuthenticated()) {
        setError('Please log in to view your results');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await resultService.getUserResults();
        // The response has a results property containing the array
        const quizResults = response.data.results;
        console.log('Fetched results:', quizResults);
        setResults(quizResults);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again later.');
        setResults([]); // Set empty array on error to prevent map errors
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  // Calculate correct answers count
  const getCorrectAnswersCount = (questions: QuizResult['questions']) => {
    return questions.filter(q => q.status === 'correct').length;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    subject: 'all',
    quizType: 'all',
    sortBy: 'date-desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique subjects and quiz types for filters
  const subjects = Array.from(new Set(results.map(result => result.subject)));
  const quizTypes = ['syllabus', 'fundamentals'];

 // Filter and sort results
  const filteredResults = (Array.isArray(results) ? results : [])
    .filter(result => result && typeof result === 'object')
    .filter(result => {
      const matchesSearch = 
        result.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (result.quizType === 'syllabus' && result.chapter?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (result.quizType === 'fundamentals' && result.level?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = 
        filters.status === 'all' || 
        (filters.status === 'passed' && result.percentage >= 50) ||
        (filters.status === 'failed' && result.percentage < 50);
      
      const matchesSubject = 
        filters.subject === 'all' || 
        result.subject === filters.subject;
      
      const matchesQuizType =
        filters.quizType === 'all' ||
        result.quizType === filters.quizType;
      
      return matchesSearch && matchesStatus && matchesSubject && matchesQuizType;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'date-desc') {
        return new Date(b.date_time).getTime() - new Date(a.date_time).getTime();
      } else if (filters.sortBy === 'date-asc') {
        return new Date(a.date_time).getTime() - new Date(b.date_time).getTime();
      } else if (filters.sortBy === 'score-desc') {
        return b.percentage - a.percentage;
      } else {
        return a.percentage - b.percentage;
      }
    });

  const getStatusBadge = (percentage: number) => {
    const passed = percentage >= 50;
    const bgColor = passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const text = passed ? 'Passed' : 'Failed';
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${bgColor}`}>
        {text}
      </span>
    );
  };

  const getQuizTypeBadge = (quizType: string) => {
    const bgColor = quizType === 'syllabus' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800';
    const text = quizType === 'syllabus' ? 'Syllabus' : 'Fundamentals';
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${bgColor}`}>
        {text}
      </span>
    );
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 50) return 'text-blue-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="md:block md:w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <FiAward className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Results</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedResult && (
        <QuizDetailsModal 
          result={selectedResult} 
          onClose={() => setSelectedResult(null)} 
        />
      )}
      <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="md:block md:w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0 mt-10">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Your Quiz Results</h1>
            <p className="text-gray-600">View and analyze your quiz performance</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by subject or topic..."
                  className="block w-full pl-10 pr-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-2 cursor-pointer md:hidden"
                aria-label="Filters"
              >
                <FiFilter className="h-5 w-5 text-gray-500" />
              </button>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="hidden md:flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-2 cursor-pointer"
              >
                <FiFilter className="h-5 w-5 mr-2 text-gray-500" />
                Filters
                {showFilters ? (
                  <FiChevronUp className="ml-2 h-5 w-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="ml-2 h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      className="block w-full pl-3 pr-10 py-2 text-gray-700 border border-gray-300 sm:text-sm rounded-lg cursor-pointer"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="all">All Results</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quizType" className="block text-sm font-medium text-gray-700 mb-1">
                      Quiz Type
                    </label>
                    <select
                      id="quizType"
                      className="block w-full pl-3 pr-10 py-2 text-gray-700 border border-gray-300 sm:text-sm rounded-lg cursor-pointer"
                      value={filters.quizType}
                      onChange={(e) => setFilters({ ...filters, quizType: e.target.value })}
                    >
                      <option value="all">All Quizzes</option>
                      <option value="syllabus">Syllabus Quizzes</option>
                      <option value="fundamentals">Fundamentals Quizzes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="subject"
                      className="block w-full pl-3 pr-10 py-2 text-gray-700 border border-gray-300 sm:text-sm rounded-lg cursor-pointer"
                      value={filters.subject}
                      onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      id="sort"
                      className="block w-full pl-3 pr-10 py-2 text-gray-700 border border-gray-300 sm:text-sm rounded-lg cursor-pointer"
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="score-desc">Highest Score</option>
                      <option value="score-asc">Lowest Score</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Grid */}
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((result) => (
                <div 
                  key={result._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3">
                            {result.quizType === 'syllabus' ? <FiBook size={20} /> : <FiLayers size={20} />}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{result.subject}</h3>
                            <p className="text-sm text-gray-500">
                              {result.quizType === 'syllabus' 
                                ? `${result.branch || ''} ${result.branch && result.chapter ? '•' : ''} ${result.chapter || ''}`
                                : `Level: ${result.level || 'N/A'}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      {getQuizTypeBadge(result.quizType)}
                      {getStatusBadge(result.percentage)}
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Score</span>
                        <span className={`text-lg font-bold ${getScoreColor(result.percentage)}`}>
                          {result.scored} / {result.total_score}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${result.percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{result.percentage.toFixed(1)}%</span>
                        <span className="text-xs text-gray-500">
                          {getCorrectAnswersCount(result.questions)} of {result.questions.length} correct
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500 flex justify-between items-center">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1.5 flex-shrink-0" />
                          <span>{formatDate(result.date_time).date}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <FiClock className="mr-1.5 text-sm" />
                          <span>{formatDate(result.date_time).time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {result.quizType === 'syllabus' ? 'Syllabus Quiz' : 'Fundamentals Quiz'}
                    </span>
                    <button 
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      onClick={() => setSelectedResult(result)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <FiAward className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || filters.status !== 'all' || filters.subject !== 'all' || filters.quizType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You have not taken any quizzes yet.'}
              </p>
              {(searchTerm || filters.status !== 'all' || filters.subject !== 'all' || filters.quizType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      status: 'all',
                      subject: 'all',
                      quizType: 'all',
                      sortBy: 'date-desc',
                    });
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default ResultsPage;
