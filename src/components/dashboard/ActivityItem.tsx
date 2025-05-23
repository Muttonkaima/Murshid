import { FiAward, FiBook, FiClock } from 'react-icons/fi';

type ActivityType = 'quiz' | 'lesson' | 'achievement' | string;

interface ActivityItemProps {
  type: ActivityType;
  subject: string;
  time: string;
  score?: string | number;  // Allow both string and number
  description?: string;
}

const ActivityItem = ({ type, subject, time, score, description }: ActivityItemProps) => {
  const getIcon = () => {
    switch (type) {
      case 'quiz':
        return <FiAward className="text-yellow-500" />;
      case 'lesson':
        return <FiBook className="text-blue-500" />;
      case 'achievement':
        return <FiAward className="text-purple-500" />;
      default:
        return <FiBook className="text-gray-500" />;
    }
  };

  const getActivityText = () => {
    switch (type) {
      case 'quiz':
        return `You played ${subject} quiz`;
      case 'lesson':
        return description || `Completed ${subject} lesson`;
      case 'achievement':
        return `Earned ${subject} badge`;
      default:
        return '';
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="mt-0.5">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {getActivityText()}
        </p>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <FiClock className="mr-1" size={12} />
          <span>{time}</span>
          {score && (
            <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
              {score}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
