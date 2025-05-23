interface RecommendationCardProps {
  title: string;
  description: string;
  subject: string;
  progress: number;
}

const RecommendationCard = ({ title, description, subject, progress }: RecommendationCardProps) => {
  const getSubjectColor = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'mathematics':
        return 'bg-blue-100 text-blue-600';
      case 'science':
        return 'bg-green-100 text-green-600';
      case 'social':
        return 'bg-purple-100 text-purple-600';
      case 'languages':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${getSubjectColor(subject)}`}>
          {subject}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full bg-[var(--primary-color)]" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button className="mt-4 w-full py-2 text-sm font-medium text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white hover:bg-opacity-10 rounded-lg transition-colors cursor-pointer">
        Start Learning
      </button>
    </div>
  );
};

export default RecommendationCard;
