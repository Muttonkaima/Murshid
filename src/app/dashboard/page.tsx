'use client';

import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { 
  FiBell, 
  FiChevronDown, 
  FiZap, 
  FiMessageSquare, 
  FiTool, 
  FiAward, 
  FiDivideCircle,
  FiGitBranch,
  FiFileText,
  FiClock,
  FiBarChart2,
  FiAward as FiTrophy,
  FiUsers,
  FiEdit3,
  FiBook,
  FiCode,
  FiType,
  FiPlus,
  FiUser,
  FiSettings,
  FiLogOut,
  FiUser as FiUserIcon
} from 'react-icons/fi';
import Link from 'next/link';

// Components
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import RecommendationCard from '../../components/dashboard/RecommendationCard';
import ActivityItem from '../../components/dashboard/ActivityItem';
import PerformanceChart from '../../components/dashboard/PerformanceChart';
import Leaderboard from '../../components/dashboard/Leaderboard';
import AIToolCard from '../../components/dashboard/AIToolCard';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overall');
  const [activeSubject, setActiveSubject] = useState('all');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock data
  const recommendations = [
    {
      id: 1,
      title: 'Improve Indian History',
      description: 'Based on your recent quiz performance',
      subject: 'Social',
      progress: 65,
    },
    {
      id: 2,
      title: 'Master Algebra',
      description: 'Practice more algebra problems',
      subject: 'Mathematics',
      progress: 40,
    },
  ];

  const recentActivities = [
    { id: 1, type: 'quiz', subject: 'Social', time: '2 hours ago', score: 75 },
    { id: 2, type: 'lesson', subject: 'Mathematics', time: '1 day ago', description: 'Completed Algebra basics' },
  ];

  const leaderboardData = [
    { id: 1, rank: 1, name: 'mithun@example.com', score: 98 },
    { id: 2, rank: 2, name: 'karthik@example.com', score: 95 },
    { id: 3, rank: 3, name: 'shetty@example.com', score: 92 },
    { id: 4, rank: 4, name: 'rahul@example.com', score: 89 },
    { id: 5, rank: 5, name: 'moin@example.com', score: 85 },
  ];

  const aiTools = [
    { id: 1, name: 'Math Solver', icon: <FiDivideCircle size={24} />, description: 'Get step-by-step solutions to math problems' },
    { id: 2, name: 'Essay Writer', icon: <FiEdit3 size={24} />, description: 'Generate well-structured essays on any topic' },
    { id: 3, name: 'Mindmap Generator', icon: <FiGitBranch size={24} />, description: 'Generate mindmaps for better understanding' },
    { id: 4, name: 'Topic Summarizer', icon: <FiFileText size={24} />, description: 'Summarize topics for quick revision' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="md:ml-64 transition-all duration-300">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="md:hidden">
              {/* Spacer to balance the flex layout on mobile */}
              <div className="w-8"></div>
            </div>
            <div className="flex-1 md:flex-none">
              {/* <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1> */}
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer">
                <FiBell size={20} />
              </button>
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-label="User menu"
                  aria-expanded={isProfileOpen}
                >
                 
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900">Mithun</p>
                    <p className="text-xs text-gray-500">Class 10 • CBSE</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white cursor-pointer">
                    <FiUser size={16} />
                  </div>
                  {/* <FiChevronDown 
                    className={`hidden md:block w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} 
                  /> */}
                </button>

                {/* Dropdown menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-gray ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUserIcon className="mr-3 text-gray-400" size={16} />
                        <span>My Profile</span>
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiSettings className="mr-3 text-gray-400" size={16} />
                        <span>Settings</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => {
                          // Handle logout
                          console.log('Logging out...');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                        role="menuitem"
                      >
                        <FiLogOut className="mr-3" size={16} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuickActionCard
                icon={<FiZap />}
                title="Start Practice"
                description="Practice with personalized questions"
                buttonText="Practice Now"
                buttonLink="/practice"
                bgColor="bg-blue-100"
                textColor="text-blue-600"
              />
              <QuickActionCard
                icon={<FiMessageSquare />}
                title="Ask Murshid"
                description="Get instant help with your doubts"
                buttonText="Ask Now"
                buttonLink="/chat"
                bgColor="bg-purple-100"
                textColor="text-purple-600"
              />
              <QuickActionCard
                icon={<FiTool />}
                title="AI Tools"
                description="Explore AI-powered learning tools"
                buttonText="Explore"
                buttonLink="/ai-tools"
                bgColor="bg-green-100"
                textColor="text-green-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Murshid Recommendations */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Murshid Recommendations</h3>
                  <button className="text-sm text-[var(--primary-color)] hover:underline cursor-pointer whitespace-nowrap">View All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map((rec) => (
                    <RecommendationCard key={rec.id} {...rec} />
                  ))}
                </div>
              </div>

              {/* Performance Overview */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setActiveTab('overall')}
                      className={`px-3 py-1 text-sm rounded-full ${activeTab === 'overall' ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100 text-gray-600'} cursor-pointer whitespace-nowrap`}
                    >
                      Overall
                    </button>
                    <button 
                      onClick={() => setActiveTab('subject')}
                      className={`px-3 py-1 text-sm rounded-full ${activeTab === 'subject' ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-100 text-gray-600'} cursor-pointer whitespace-nowrap`}
                    >
                      Subject-wise
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  <PerformanceChart activeTab={activeTab} />
                </div>
              </div>

              {/* AI Tools */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">AI Tools</h3>
                  <button className="text-sm text-[var(--primary-color)] hover:underline cursor-pointer whitespace-nowrap">View All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aiTools.map((tool) => (
                    <AIToolCard key={tool.id} {...tool} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <button className="text-sm text-[var(--primary-color)] hover:underline cursor-pointer">View All</button>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                  ))}
                </div>
              </div>

              {/* Latest Quiz Performance */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Latest Quiz Performance</h3>
                  <FiAward className="text-yellow-500" size={20} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Subject</span>
                    <span className="font-medium text-gray-900">Social</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Topic</span>
                    <span className="font-medium text-gray-900">Indian History</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Score</span>
                    <span className="font-medium text-[var(--primary-color)]">85%</span>
                  </div>
                  <button className="w-full mt-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    View Detailed Report
                  </button>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
                  <div className="flex items-center space-x-1">
                    <FiTrophy className="text-yellow-500" />
                    <span className="text-sm text-gray-500">Your rank: #12</span>
                  </div>
                </div>
                <div className="mb-4">
                  <select 
                    value={activeSubject}
                    onChange={(e) => setActiveSubject(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[var(--primary-color)] focus:border-none text-gray-900 cursor-pointer"
                  >
                    <option value="all">All Subjects</option>
                    <option value="math">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="social">Social Studies</option>
                    <option value="english">English</option>
                  </select>
                </div>
                <Leaderboard data={leaderboardData} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;