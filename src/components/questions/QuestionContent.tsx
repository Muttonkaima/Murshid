import React from 'react';
import Image from 'next/image';
import AudioPlayer from './AudioPlayer';

interface QuestionContentProps {
  content: {
    hide_text: boolean;
    text: string;
    read_text: boolean;
    read_text_url?: string;
    image: string;
    read_text_value?: string;
  };
  className?: string;
}

const QuestionContent: React.FC<QuestionContentProps> = ({ 
  content, 
  className = '' 
}) => {
  const { 
    hide_text, 
    text, 
    read_text, 
    read_text_url, 
    image,
    read_text_value
  } = content;

  // Handle audio button click to prevent event propagation
  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Audio Player */}
      {read_text && read_text_url && (
        <div className="mb-4" onClick={handleAudioClick}>
          <AudioPlayer audioUrl={read_text_url} />
        </div>
      )}

      {/* Text Content */}
      {!hide_text && text && (
        <div className="text-lg font-medium text-gray-800">
          {text}
        </div>
      )}

      {/* Image */}
      {image && (
        <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={image}
            alt="Question illustration"
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionContent;
