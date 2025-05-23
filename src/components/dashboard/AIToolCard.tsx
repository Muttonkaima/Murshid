import { ReactNode } from 'react';
import { FiArrowRight } from 'react-icons/fi';

interface AIToolCardProps {
  id: number;
  name: string;
  icon: ReactNode;
  description: string;
}

const AIToolCard = ({ name, icon, description }: AIToolCardProps) => {
  return (
    <div className="group relative bg-white p-4 rounded-xl border border-gray-200 hover:border-[var(--primary-color)] transition-colors flex flex-col h-full">
      <div className="flex-1">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--primary-color)] bg-opacity-10 flex items-center justify-center text-white">
            {icon}
          </div>
          <div className="ml-4">
            <h4 className="font-medium text-gray-900">{name}</h4>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full flex items-center justify-center py-2 px-3 text-sm font-medium text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white hover:bg-opacity-10 rounded-lg transition-colors cursor-pointer">
          Open Tool
          <FiArrowRight className="ml-1.5" />
        </button>
      </div>
    </div>
  );
};

export default AIToolCard;
