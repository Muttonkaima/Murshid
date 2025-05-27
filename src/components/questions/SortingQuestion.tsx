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
  questionId?: string; // Track which question these categories belong to
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

interface ItemFeedback {
  itemId: string;
  itemText: string;
  isCorrect: boolean;
  currentCategory: string;
  correctCategory?: string;
}

interface Feedback {
  isCorrect: boolean;
  message: string;
  explanation?: string;
  itemFeedbacks?: ItemFeedback[];
  correctAnswers?: Record<string, string[]>;
}

interface SortingQuestionProps {
  question: Question;
  onAnswer: (answers: Record<string, string[]>, isCorrect: boolean, marks: number) => void;
  disabled?: boolean;
  userAnswer?: { answer: Record<string, string[]>; isCorrect: boolean };
}

// Draggable Item Component
const DraggableItem: React.FC<{
  item: Item;
  index: number;
  onDragStart: (e: React.DragEvent, item: Item) => void;
  disabled?: boolean;
  isDragging?: boolean;
  isDisabled?: boolean;
}> = ({ item, index, onDragStart, disabled, isDragging, isDisabled }) => {
  return (
    <div
      draggable={!disabled && !isDisabled}
      onDragStart={(e) => !isDisabled && onDragStart(e, item)}
      className={`p-3 mb-2 bg-white border rounded-lg ${
        isDisabled 
          ? 'cursor-not-allowed opacity-70' 
          : isDragging 
            ? 'cursor-grabbing border-blue-500 bg-blue-50 shadow-md' 
            : 'cursor-grab border-gray-200 hover:border-blue-400 hover:shadow-sm'
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
        <div className="font-medium text-gray-900">{item.text}</div>
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
const SortingQuestion: React.FC<SortingQuestionProps> = (props) => {
  const { 
    question, 
    onAnswer, 
    disabled = false,
    userAnswer 
  } = props;
  const [categories, setCategories] = useState<Category[]>([]);
  const [unsortedItems, setUnsortedItems] = useState<Item[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [correctItemsCount, setCorrectItemsCount] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize component
  useEffect(() => {
    // Only initialize state if we don't have any categories yet or if the question changes
    if (categories.length === 0 || question.id !== categories[0]?.questionId) {
      // Initialize categories with items
      let initializedCategories = question.categories.map(category => {
        // If we have a userAnswer, try to restore items for this category
        const categoryItems = userAnswer?.answer[category.id] || [];
        const items = categoryItems.length > 0 
          ? question.items.filter(item => categoryItems.includes(item.id))
          : [];
          
        return {
          ...category,
          questionId: question.id,
          items: items.map(item => ({
            ...item,
            id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`
          }))
        };
      });

      // Initialize unsorted items (all items not in any category)
      const usedItemIds = new Set(
        initializedCategories.flatMap(cat => cat.items.map(item => item.id))
      );
      
      let initializedItems = question.items
        .filter(item => !usedItemIds.has(item.id))
        .map(item => ({
          ...item,
          id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`
        }));
        
      // Set categories and unsorted items
      setCategories(initializedCategories);
      setUnsortedItems(initializedItems);
      
      // Set submission state and feedback if we had a userAnswer
      if (userAnswer) {
        setIsSubmitted(true);
        setFeedback({
          isCorrect: userAnswer.isCorrect,
          message: userAnswer.isCorrect ? 'Correct! Well done!' : 'Not quite right. Please try again.',
          explanation: question.explanation
        });
      } else {
        setIsSubmitted(false);
        setFeedback(null);
      }
    }
  }, [question.id, userAnswer]);

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

  // Check if all items are sorted into categories
  const allItemsSorted = () => {
    const totalItemsInCategories = categories.reduce(
      (sum, category) => sum + (category.items?.length || 0), 0
    );
    return totalItemsInCategories === question.items.length;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (disabled || isSubmitted) return;
    
    // Check if all items are sorted
    if (!allItemsSorted()) {
      // Don't set feedback state as it disables drag-and-drop
      // Instead, we'll show a temporary message without changing the state
      const tempMessage = document.createElement('div');
      tempMessage.className = 'fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded';
      tempMessage.role = 'alert';
      tempMessage.innerHTML = '<span class="font-bold">Notice:</span> Please sort all items into their correct categories before submitting.';
      document.body.appendChild(tempMessage);
      
      // Remove the message after 3 seconds
      setTimeout(() => {
        if (document.body.contains(tempMessage)) {
          document.body.removeChild(tempMessage);
        }
      }, 3000);
      
      return;
    }
    
    const currentCategories = JSON.parse(JSON.stringify(categories));
    const sortedAnswers: Record<string, string[]> = {};
    let correctItemsCount = 0;
    let totalItems = 0;
    const itemFeedbacks: ItemFeedback[] = [];
    const correctAnswers = { ...question.correctSorting };
    
    // Create a map of item text to its correct category
    const itemToCorrectCategory = new Map<string, string>();
    Object.entries(question.correctSorting).forEach(([categoryId, items]) => {
      items.forEach(itemText => {
        itemToCorrectCategory.set(itemText, categoryId);
      });
    });
    
    totalItems = itemToCorrectCategory.size;

    // Check each category
    currentCategories.forEach((category: Category) => {
      const categoryItemTexts = category.items?.map((item: Item) => item.text || '') || [];
      sortedAnswers[category.id] = categoryItemTexts;
      
      const correctItemTexts = question.correctSorting[category.text] || [];
      
      // Count correct items in this category
      categoryItemTexts.forEach((itemText: string) => {
        if (correctItemTexts.includes(itemText)) {
          correctItemsCount++;
        }
      });

      // Add feedback for each item in this category
      category.items?.forEach((item: Item) => {
        const itemText = item.text || '';
        const correctCategoryId = itemToCorrectCategory.get(itemText);
        const correctCategory = question.categories.find(c => c.text === correctCategoryId);
        const isItemCorrect = correctCategoryId === category.text;
        
        itemFeedbacks.push({
          itemId: item.id,
          itemText: item.text || item.id,
          isCorrect: isItemCorrect,
          currentCategory: category.text,
          correctCategory: isItemCorrect ? undefined : correctCategory?.text
        });
      });
    });
    
    // Calculate score based on correct items
    const score = (correctItemsCount / totalItems) * question.marks;
    const isFullyCorrect = correctItemsCount === totalItems;
    
    // Update state with results
    setScore(parseFloat(score.toFixed(2)));
    setCorrectItemsCount(correctItemsCount);
    setTotalItems(totalItems);

    // Update the UI state
    setCategories(currentCategories);
    setFeedback({
      isCorrect: isFullyCorrect,
      message: isFullyCorrect 
        ? 'Perfect! All items are in their correct categories!' 
        : `${correctItemsCount} out of ${totalItems} items are in the correct category`,
      explanation: question.explanation,
      itemFeedbacks,
      correctAnswers
    });
    setIsSubmitted(true);
    
    // Notify parent component
    onAnswer(sortedAnswers, isFullyCorrect, score);
  };

  // Render category header with audio if available
  const renderCategoryHeader = (category: Category) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
      <h3 className="text-lg font-semibold text-gray-900">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-3xl mx-auto transition-all duration-200 hover:shadow-md overflow-hidden">
      <div className='px-4 sm:px-6 pt-4 sm:pt-6'>
      <DndProvider backend={HTML5Backend}>

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
        {/* <div className="bg-gray-50 p-4 rounded-lg mb-6 text-gray-900">
          <p><strong className="text-blue-600">Instructions:</strong> Drag and drop the items into their correct categories.</p>
        </div> */}

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
          <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-900">
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
                  isDisabled={!!userAnswer}
                />
              ))}
              {unsortedItems.length === 0 && (
                <div className="text-gray-500 italic text-center col-span-full py-4">
                  Drag items here to remove from categories
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="mb-6 space-y-4">
            <div className={`p-4 rounded-lg ${
              feedback.isCorrect 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-amber-50 border border-amber-100'
            }`}>
              <div className="flex items-start gap-3">
                {feedback.isCorrect ? (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-red-900">
                    {feedback.message}
                  </h3>
                  {feedback.explanation && (
                    <p className="mt-1 text-sm text-gray-600">
                      {feedback.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed feedback for incorrect answers */}
            {!feedback.isCorrect && feedback.itemFeedbacks && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Here's what needs attention:</h4>
                <div className="space-y-2">
                  {feedback.itemFeedbacks
                    .filter(item => !item.isCorrect)
                    .map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-xs">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            <span className="font-semibold">{item.itemText}</span> is in the wrong category.
                          </p>
                          {item.correctCategory && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              Should be in: <span className="font-medium text-gray-900">{item.correctCategory}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Show correct answers if needed */}
            {!feedback.isCorrect && feedback.correctAnswers && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Correct Answers:</h4>
                <div className="space-y-3">
                  {Object.entries(feedback.correctAnswers).map(([category, items]) => (
                    <div key={category}>
                      <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">{category}</div>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-white rounded-full border border-blue-200 text-blue-800">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={handleSubmit}
            disabled={disabled || isSubmitted}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitted ? 'Submitted' : 'Submit Answers'}
          </button>
        </div>
      </DndProvider>
      </div>
      <div className="w-full mt-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 gap-2 sm:gap-0">
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>Sorting Question</span>
        </div>
        <div className="text-xs sm:text-sm font-medium text-gray-600 bg-white px-2.5 sm:px-3 py-1 rounded-full border border-gray-200">
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
        </div>
      </div>
    </div>
  );
};

export default SortingQuestion;