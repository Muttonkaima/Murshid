'use client';

import { useState } from 'react';
import { FiBook, FiClock, FiCalendar, FiAward, FiSearch, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Sidebar from '@/components/layout/Sidebar';

interface QuizResult {
  id: string;
  subject: string;
  topic: string;
  score: number;
  totalMarks: number;
  percentage: number;
  date: string;
  time: string;
  duration: string;
  correctAnswers: number;
  totalQuestions: number;
  status: 'completed' | 'incomplete' | 'passed' | 'failed';
}

const ResultsPage = () => {
  // Sample quiz results data
  const [results, setResults] = useState<QuizResult[]>([
    {
      id: '1',
      subject: 'Mathematics',
      topic: 'Algebra',
      score: 18,
      totalMarks: 20,
      percentage: 90,
      date: '2024-05-20',
      time: '10:30 AM',
      duration: '30 min',
      correctAnswers: 18,
      totalQuestions: 20,
      status: 'passed'
    },
    {
      id: '2',
      subject: 'Physics',
      topic: 'Mechanics',
      score: 15,
      totalMarks: 25,
      percentage: 60,
      date: '2024-05-18',
      time: '02:15 PM',
      duration: '45 min',
      correctAnswers: 15,
      totalQuestions: 25,
      status: 'passed'
    },
    {
      id: '3',
      subject: 'Chemistry',
      topic: 'Organic Chemistry',
      score: 12,
      totalMarks: 25,
      percentage: 48,
      date: '2024-05-15',
      time: '11:00 AM',
      duration: '40 min',
      correctAnswers: 12,
      totalQuestions: 25,
      status: 'failed'
    },
    {
      id: '4',
      subject: 'Biology',
      topic: 'Cell Biology',
      score: 22,
      totalMarks: 25,
      percentage: 88,
      date: '2024-05-10',
      time: '09:45 AM',
      duration: '35 min',
      correctAnswers: 22,
      totalQuestions: 25,
      status: 'passed'
    },
    {
      id: '5',
      subject: 'Computer Science',
      topic: 'Data Structures',
      score: 19,
      totalMarks: 20,
      percentage: 95,
      date: '2024-05-05',
      time: '03:30 PM',
      duration: '50 min',
      correctAnswers: 19,
      totalQuestions: 20,
      status: 'passed'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    subject: 'all',
    sortBy: 'date-desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique subjects for filter
  const subjects = Array.from(new Set(results.map(result => result.subject)));

  // Filter and sort results
  const filteredResults = results
    .filter(result => {
      const matchesSearch = 
        result.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.topic.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filters.status === 'all' || 
        (filters.status === 'passed' && result.percentage >= 50) ||
        (filters.status === 'failed' && result.percentage < 50);
      
      const matchesSubject = 
        filters.subject === 'all' || 
        result.subject === filters.subject;
      
      return matchesSearch && matchesStatus && matchesSubject;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (filters.sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (filters.sortBy === 'score-desc') {
        return b.percentage - a.percentage;
      } else {
        return a.percentage - b.percentage;
      }
    });

  const getStatusBadge = (status: string, percentage: number) => {
    const passed = percentage >= 50;
    const bgColor = passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const text = passed ? 'Passed' : 'Failed';
    
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

  return (
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
                  key={result.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3">
                            <FiBook size={20} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{result.subject}</h3>
                        </div>
                        <p className="text-sm text-gray-500 ml-11">{result.topic}</p>
                      </div>
                      {getStatusBadge(result.status, result.percentage)}
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Score</span>
                        <span className={`text-lg font-bold ${getScoreColor(result.percentage)}`}>
                          {result.score} / {result.totalMarks}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${result.percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{result.percentage}%</span>
                        <span className="text-xs text-gray-500">
                          {result.correctAnswers} of {result.totalQuestions} correct
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="mr-1.5" />
                        <span>{new Date(result.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span className="mx-2">•</span>
                        <FiClock className="mr-1.5" />
                        <span>{result.time}</span>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center">
                        <FiClock className="mr-1.5" />
                        {result.duration}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3 flex justify-end">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
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
                {searchTerm || filters.status !== 'all' || filters.subject !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You have not taken any quizzes yet.'}
              </p>
              {(searchTerm || filters.status !== 'all' || filters.subject !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      status: 'all',
                      subject: 'all',
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
  );
};

export default ResultsPage;
