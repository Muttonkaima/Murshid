import React from 'react';

interface QuickActionCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  buttonText: string;
  bgColor: string;
  textColor: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  bgColor,
  textColor,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
      <div className={`w-12 h-12 ${bgColor} ${textColor} rounded-full flex items-center justify-center mb-4`}>
        {React.cloneElement(icon, { 
          className: 'text-xl ' 
        })}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
      <button 
        className={`mt-auto w-full py-2 px-4 rounded-lg text-sm font-medium ${bgColor} ${textColor} hover:opacity-90 transition-opacity cursor-pointer`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default QuickActionCard;
