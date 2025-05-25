import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import QuestionContent from './QuestionContent';

// Types
interface Item {
  id: string;
  text?: string;
  hide_text?: boolean;
  read_text?: string;
  read_text_url?: string;
  image?: string;
}

interface Category {
  id: string;
  text: string;
  hide_text?: boolean;
  read_text_url?: string;
  items?: Item[];
}

interface Question {
  id: string;
  marks: number;
  question: {
    text?: string;
    hide_text?: boolean;
    read_text_url?: string;
    image?: string;
  };
  items: Item[];
  categories: Category[];
  correctSorting: Record<string, string[]>;
  explanation?: string;
}

interface Feedback {
  isCorrect: boolean;
  message: string;
  explanation?: string;
}

interface SortingQuestionProps {
  question: Question;
  onAnswer: (answers: Record<string, string[]>, isCorrect: boolean, marks: number) => void;
  disabled?: boolean;
}

// Draggable Item Component
const DraggableItem: React.FC<{
  item: Item;
  index: number;
  onDragStart: (e: React.DragEvent, item: Item) => void;
  disabled?: boolean;
  isDragging?: boolean;
}> = ({ item, index, onDragStart, disabled, isDragging }) => {
  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => onDragStart(e, item)}
      className={`p-3 mb-2 bg-white border rounded-lg cursor-grab active:cursor-grabbing ${
        isDragging 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
      } transition-all duration-200`}
    >
      {item.image && (
        <div className="mb-2">
          <img 
            src={item.image} 
            alt="Item visual" 
            className="max-h-24 mx-auto object-contain" 
          />
        </div>
      )}
      {!item.hide_text && item.text && (
        <div className="font-medium">{item.text}</div>
      )}
      {item.read_text_url && (
        <div className="mt-1">
          <audio 
            src={item.read_text_url} 
            controls 
            className="h-8 w-full"
          />
        </div>
      )}
    </div>
  );
};

// Main Component
const SortingQuestion: React.FC<SortingQuestionProps> = ({ 
  question, 
  onAnswer, 
  disabled = false 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [unsortedItems, setUnsortedItems] = useState<Item[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);

  // Initialize component
  useEffect(() => {
    // Initialize categories with items
    const initializedCategories = question.categories.map(category => ({
      ...category,
      items: category.items?.map(item => ({
        ...item,
        id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`
      })) || []
    }));

    // Initialize unsorted items
    const initializedItems = question.items.map(item => ({
      ...item,
      id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`
    }));

    setCategories(initializedCategories);
    setUnsortedItems(initializedItems);
    setFeedback(null);
  }, [question]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, item: Item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    setDraggedItem(item);
    setIsDragging(true);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop on category
  const handleDrop = (e: React.DragEvent, categoryText: string) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('text/plain')) as Item;
    
    // Remove from unsorted items
    setUnsortedItems(prev => prev.filter(i => i.id !== item.id));
    
    // Add to the target category
    setCategories(prev => {
      const newCategories = [...prev];
      const targetCategory = newCategories.find(cat => cat.text === categoryText);
      
      if (targetCategory) {
        const itemExists = targetCategory.items?.some(i => i.id === item.id) || false;
        if (!itemExists) {
          targetCategory.items = [...(targetCategory.items || []), item];
        }
      }
      
      return newCategories;
    });
    
    setDraggedItem(null);
    setIsDragging(false);
  };

  // Handle drop to unsorted area
  const handleDropToUnsorted = (e: React.DragEvent) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('text/plain')) as Item;
    
    // Remove from categories
    setCategories(prev => {
      const newCategories = prev.map(category => ({
        ...category,
        items: category.items?.filter(i => i.id !== item.id) || []
      }));
      return newCategories;
    });
    
    // Add to unsorted if not already there
    setUnsortedItems(prev => {
      if (!prev.some(i => i.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });
    
    setDraggedItem(null);
    setIsDragging(false);
  };

  // Handle form submission
  const handleSubmit = () => {
    const isCorrect = categories.every(category => {
      const correctItems = question.correctSorting[category.text] || [];
      const userItems = category.items?.map(item => item.text || '') || [];
      
      return (
        correctItems.length === userItems.length &&
        correctItems.every(correct => userItems.includes(correct))
      );
    });
    
    setFeedback({
      isCorrect,
      message: isCorrect ? 'Correct! Well done!' : 'Not quite right. Please try again.',
      explanation: question.explanation
    });
  };

  // Handle next question
  const handleNext = () => {
    const sortedAnswers: Record<string, string[]> = {};
    categories.forEach(category => {
      sortedAnswers[category.text] = category.items?.map(item => item.text || '') || [];
    });
    
    onAnswer(
      sortedAnswers, 
      feedback?.isCorrect || false, 
      feedback?.isCorrect ? question.marks : 0
    );
  };

  // Render category header with audio if available
  const renderCategoryHeader = (category: Category) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
      <h3 className="text-lg font-semibold">
        {!category.hide_text && category.text}
      </h3>
      {category.read_text_url && (
        <audio 
          src={category.read_text_url} 
          controls 
          className="h-8 ml-2"
        />
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <DndProvider backend={HTML5Backend}>
        {/* Question Header */}
        <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <svg 
              className="w-6 h-6 text-blue-500" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
            </svg>
            <h2 className="text-xl font-semibold text-blue-600">
              Sorting <span className="text-gray-500 font-normal text-base">({question.marks} marks)</span>
            </h2>
          </div>
        </div>

        {/* Question Content */}
        {question.question.image && (
          <div className="mb-4">
            <img 
              src={question.question.image} 
              alt="Question visual" 
              className="max-h-80 mx-auto object-contain"
            />
          </div>
        )}
        
        {!question.question.hide_text && question.question.text && (
          <div className="mb-6">
            <QuestionContent 
              content={{
                hide_text: question.question.hide_text || false,
                text: question.question.text,
                read_text: !!question.question.read_text_url,
                read_text_url: question.question.read_text_url,
                image: question.question.image || '',
                read_text_value: question.question.text
              }} 
            />
          </div>
        )}
        
        {question.question.read_text_url && (
          <div className="mb-6">
            <audio 
              src={question.question.read_text_url} 
              controls 
              className="w-full h-10"
            />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-gray-700">
          <p><strong className="text-blue-600">Instructions:</strong> Drag and drop the items into their correct categories.</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              {renderCategoryHeader(category)}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.text)}
                className={`min-h-32 p-3 rounded-lg border-2 border-dashed transition-colors ${
                  isDragging && draggedItem && !category.items?.some(i => i.id === draggedItem.id)
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {category.items?.map((item, index) => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    index={index}
                    onDragStart={handleDragStart}
                    disabled={!!feedback}
                    isDragging={draggedItem?.id === item.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Unsorted Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
            Unsorted Items
          </h3>
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDropToUnsorted}
            className={`min-h-32 p-6 rounded-xl border-2 border-dashed ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unsortedItems.map((item, index) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  index={index}
                  onDragStart={handleDragStart}
                  disabled={!!feedback}
                  isDragging={draggedItem?.id === item.id}
                />
              ))}
              {unsortedItems.length === 0 && (
                <div className="text-gray-400 italic text-center col-span-full py-4">
                  Drag items here to remove from categories
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg mb-3 ${
              feedback.isCorrect 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {feedback.isCorrect ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                )}
                <span>{feedback.message}</span>
              </div>
            </div>
            
            {feedback.explanation && (
              <div className="p-4 bg-gray-50 border-l-4 border-blue-500 rounded-r">
                <p className="text-gray-700">{feedback.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end mt-6">
          {!feedback ? (
            <button
              onClick={handleSubmit}
              disabled={disabled}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answer
            </button>
          ) : (
            <></>
          )}
        </div>
      </DndProvider>
    </div>
  );
};

export default SortingQuestion;
