'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch, FiBookOpen, FiBook, FiFileText, FiLayers, FiCode, FiImage, FiMusic, FiFilm, FiGlobe, FiZap, FiCheckCircle, FiClock, FiTrendingUp, FiFilter } from 'react-icons/fi';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isNew?: boolean;
  isPopular?: boolean;
  isLocked?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  { id: 'all', name: 'All Tools', icon: <FiZap className="w-5 h-5" /> },
  { id: 'study', name: 'Study Aids', icon: <FiBookOpen className="w-5 h-5" /> },
  { id: 'writing', name: 'Writing', icon: <FiFileText className="w-5 h-5" /> },
  { id: 'stem', name: 'STEM', icon: <FiCode className="w-5 h-5" /> },
  { id: 'creative', name: 'Creative', icon: <FiImage className="w-5 h-5" /> },
];

const tools: Tool[] = [
  {
    id: 'math-solver',
    title: 'Math Solver',
    description: 'Step-by-step solutions to complex math problems',
    icon: <FiLayers className="w-6 h-6 text-white" />,
    category: 'stem',
    isPopular: true
  },
  {
    id: 'essay-generator',
    title: 'Essay Generator',
    description: 'Generate well-structured essays on any topic',
    icon: <FiFileText className="w-6 h-6 text-white" />,
    category: 'writing',
    isPopular: true
  },
  {
    id: 'summarizer',
    title: 'Topic Summarizer',
    description: 'Condense long articles and documents into key points',
    icon: <FiBook className="w-6 h-6 text-white" />,
    category: 'study',
    isNew: true
  },
  {
    id: 'mindmap',
    title: 'Mind Map Generator',
    description: 'Visualize ideas and concepts in a mind map format',
    icon: <FiGlobe className="w-6 h-6 text-white" />,
    category: 'study',
  },
  {
    id: 'flashcards',
    title: 'Smart Flashcards',
    description: 'Create and study with AI-generated flashcards',
    icon: <FiBookOpen className="w-6 h-6 text-white" />,
    category: 'study',
    isNew: true
  },
  {
    id: 'citation-generator',
    title: 'Citation Generator',
    description: 'Generate citations in any format (APA, MLA, Chicago)',
    icon: <FiFileText className="w-6 h-6 text-white" />,
    category: 'writing',
  },
  {
    id: 'equation-solver',
    title: 'Equation Solver',
    description: 'Solve algebraic, trigonometric, and calculus equations',
    icon: <FiCode className="w-6 h-6 text-white" />,
    category: 'stem',
  },
  {
    id: 'plagiarism-checker',
    title: 'Plagiarism Checker',
    description: 'Check your work for originality',
    icon: <FiCheckCircle className="w-6 h-6 text-white" />,
    category: 'writing'
  },
  {
    id: 'presentation-maker',
    title: 'Presentation Maker',
    description: 'Create stunning presentations with AI assistance',
    icon: <FiImage className="w-6 h-6 text-white" />,
    category: 'creative',
    isNew: true
  },
  {
    id: 'language-tutor',
    title: 'Language Tutor',
    description: 'Practice and learn new languages with AI',
    icon: <FiGlobe className="w-6 h-6 text-white" />,
    category: 'study',
    isLocked: true
  },
  {
    id: 'code-explainer',
    title: 'Code Explainer',
    description: 'Understand complex code snippets in simple terms',
    icon: <FiCode className="w-6 h-6 text-white" />,
    category: 'stem',
    isLocked: true
  },
  {
    id: 'time-management',
    title: 'Study Scheduler',
    description: 'Create optimal study schedules based on your goals',
    icon: <FiClock className="w-6 h-6 text-white" />,
    category: 'study',
    isLocked: true
  }
];

export default function AIToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredTools, setFilteredTools] = useState<Tool[]>(tools);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter tools based on search and category
  useEffect(() => {
    let result = [...tools];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tool =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(tool => tool.category === selectedCategory);
    }

    setFilteredTools(result);
  }, [searchQuery, selectedCategory]);

  const handleToolClick = (toolId: string) => {
    // Navigate to the tool's page or open a modal
    console.log(`Opening tool: ${toolId}`);
    // Add your navigation logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="md:block md:w-64 flex-shrink-0">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto sm:mt-0 mt-12">
        <h2 className="md:hidden block text-2xl font-bold text-gray-900 mx-3 my-4">AI Tools</h2>
        <p className="text-gray-600 mx-3 my-4">Smart AI tools to supercharge student life</p>

      {/* Category and Search Section */}
      <div className="bg-white shadow-sm sticky top-0 z-10 mx-3 rounded-lg sm:mx-0 sm:rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Search and Dropdown */}
          <div className="md:hidden py-3 space-y-2">
  {/* Mobile Search + Filter Row */}
  <div className="flex items-center gap-2">
    {/* Search Bar */}
    <div className="relative flex-grow">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none"
        placeholder="Search tools..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    {/* Filter Button */}
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <FiFilter className="h-5 w-5" />
      </button>

      {/* Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg">
          <div className="py-1 max-h-60 overflow-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                  selectedCategory === category.id
                    ? 'bg-[var(--primary-color)] bg-opacity-10 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
</div>


          {/* Desktop View */}
          <div className="hidden md:flex md:items-center md:justify-between py-3">
            {/* Category Tabs */}
            <div className="flex space-x-1 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === category.id
                      ? 'bg-[var(--primary-color)] bg-opacity-10 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* Desktop Search */}
            <div className="w-64 ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse h-48">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="md:text-2xl font-bold text-gray-900">
                {selectedCategory === 'all'
                  ? 'All Tools'
                  : `${categories.find(c => c.id === selectedCategory)?.name} Tools`}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'})
                </span>
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <FiTrendingUp className="mr-1" />
                Sorted by: Popularity
              </div>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => !tool.isLocked && handleToolClick(tool.id)}
                    className={`group rounded-xl shadow-sm border p-6 transition-all duration-200 ${
                      tool.isLocked 
                        ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-70' 
                        : 'bg-white border-gray-200 cursor-pointer hover:shadow-md hover:border-[var(--primary-color)] hover:border-opacity-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)]">
                        {tool.icon}
                      </div>
                      <div className="flex space-x-2">
                        {tool.isNew && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New
                          </span>
                        )}
                        {tool.isPopular && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className={`text-lg font-semibold mb-1 transition-colors ${
                      tool.isLocked 
                        ? 'text-gray-500' 
                        : 'text-gray-900 group-hover:text-[var(--primary-color)]'
                    }`}>
                      {tool.title}
                      {tool.isLocked && (
                        <span className="ml-2 text-xs font-normal text-gray-400">(Coming Soon)</span>
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm">{tool.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {categories.find(c => c.id === tool.category)?.name}
                      </span>
                      {/* <button className="text-sm font-medium text-[var(--primary-color)] hover:underline">
                        Try now
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No tools found</h3>
                <p className="mt-1 text-gray-500">
                  We couldn't find any tools matching your search. Try different keywords.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-[var(--primary-color)] to-cyan-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              We're constantly adding new tools to help with your studies. Let us know what you'd like to see next!
            </p>
            <button className="bg-white text-[var(--primary-color)] px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors cursor-pointer">
              Suggest a Tool
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
