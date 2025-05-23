import React from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

interface LeaderboardProps {
  data: {
    id: number;
    rank: number;
    name: string;
    score: number;
  }[];
}

const Leaderboard = ({ data }: LeaderboardProps) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800';
    if (rank === 2) return 'bg-gray-100 text-gray-800';
    if (rank === 3) return 'bg-amber-100 text-amber-800';
    return 'bg-gray-50 text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@');
    return `${username.substring(0, 3)}***@${domain}`;
  };

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${getRankBadge(item.rank)}`}>
            {getRankIcon(item.rank)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {formatEmail(item.name)}
            </p>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {item.score}%
          </div>
        </div>
      ))}
      <Link 
        href="/leaderboard"
        className="mt-4 flex items-center justify-center space-x-2 w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors"
      >
        <span className='text-[var(--primary-color)]'>View Full Leaderboard</span>
      </Link>
    </div>
  );
};

export default Leaderboard;
