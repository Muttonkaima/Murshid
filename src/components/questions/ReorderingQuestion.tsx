import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import QuestionContent from './QuestionContent';

interface SortableItemProps {
  id: string;
  text: string;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  content: any;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  disabled?: boolean;
}

const ItemType = 'REORDER_ITEM';

const SortableItem: React.FC<SortableItemProps> = ({ 
  id, 
  text, 
  index, 
  moveItem, 
  content,
  isCorrect,
  isIncorrect,
  disabled
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id, index },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));

  let borderColor = 'border-gray-200';
  let bgColor = 'bg-white';
  
  if (isCorrect) {
    borderColor = 'border-green-400';
    bgColor = 'bg-green-50';
  } else if (isIncorrect) {
    borderColor = 'border-red-400';
    bgColor = 'bg-red-50';
  }

  return (
    <div 
      ref={ref} 
      style={{ opacity }} 
      className={`p-4 border-2 rounded-lg mb-2 flex items-center ${
        disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-move hover:shadow'
      } ${borderColor} ${bgColor} transition-all`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium ${
        isCorrect 
          ? 'bg-green-100 text-green-700' 
          : isIncorrect 
            ? 'bg-red-100 text-red-700' 
            : 'bg-gray-100 text-gray-700'
      }`}>
        {index + 1}
      </div>
      <QuestionContent content={content} />
      {!disabled && (
        <div className="ml-auto text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}
    </div>
  );
};

interface ReorderingQuestionProps {
  question: {
    id: string | number;
    marks: number;
    question: {
      hide_text: boolean;
      text: string;
      read_text: boolean;
      read_text_url?: string;
      image: string;
      read_text_value?: string;
    };
    items: Array<{
      hide_text: boolean;
      text: string;
      read_text: boolean;
      read_text_url?: string;
      image: string;
      read_text_value?: string;
    }>;
    correctOrder: string[];
    explanation?: string;
  };
  onAnswer?: (order: string[], isCorrect: boolean) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  userAnswer?: { answer: string[], isCorrect: boolean };
}

const ReorderingQuestion: React.FC<ReorderingQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = false,
  disabled = false,
  userAnswer,
}) => {
  const [items, setItems] = useState<Array<{
    id: string;
    content: any;
    originalIndex: number;
    text: string;
  }>>([]);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Initialize items with unique IDs or restore from userAnswer
  useEffect(() => {
    if (userAnswer) {
      // If we have a userAnswer, restore the order from it
      const orderedItems = userAnswer.answer.map((text, index) => {
        const originalItem = question.items.find(item => item.text === text) || question.items[0];
        return {
          id: `item-${index}`,
          content: originalItem,
          originalIndex: question.items.findIndex(item => item.text === text),
          text: text
        };
      });
      setItems(orderedItems);
      setIsSubmitted(true);
      setIsCorrect(userAnswer.isCorrect);
    } else {
      // Otherwise, use the default order
      setItems(question.items.map((item, index) => ({
        id: `item-${index}`,
        content: item,
        originalIndex: index,
        text: item.text
      })));
      setIsSubmitted(false);
      setIsCorrect(null);
    }
    setShowExplanation(false);
  }, [question.id, question.items, userAnswer]);

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    if (disabled || isSubmitted) return;
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      const [removed] = newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, removed);
      return newItems;
    });
  };

  const checkAnswer = () => {
    if (!question.correctOrder) return false;
    
    const currentOrder = items.map(item => item.text);
    return JSON.stringify(currentOrder) === JSON.stringify(question.correctOrder);
  };

  const handleSubmit = () => {
    if (disabled || isSubmitted) return;
    
    const correct = checkAnswer();
    setIsSubmitted(true);
    setIsCorrect(correct);
    
    if (onAnswer) {
      onAnswer(items.map(item => item.text), correct);
    }
  };

  const resetOrder = () => {
    setItems(question.items.map((item, index) => ({
      id: `item-${index}`,
      content: item,
      originalIndex: index,
      text: item.text
    })));
    setIsSubmitted(false);
    setIsCorrect(null);
    // Don't call onAnswer here as it would submit the empty answer
  };

  const showCorrectOrder = () => {
    if (!question.correctOrder) return null;
    
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-700 mb-2">Correct Order:</h4>
        <ol className="list-decimal list-inside space-y-2">
          {question.correctOrder.map((text, index) => (
            <li key={`correct-${index}`} className="text-blue-700">
              {text}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  const calculateScore = () => {
    if (!isSubmitted || !question.correctOrder) return 0;
    
    let correctCount = 0;
    const currentOrder = items.map(item => item.text);
    
    currentOrder.forEach((text, index) => {
      if (text === question.correctOrder?.[index]) {
        correctCount++;
      }
    });
    
    return (correctCount / question.correctOrder.length) * question.marks;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
        {/* Question */}
        <div className="mb-6">
          <QuestionContent content={question.question} />
          <p className="text-sm text-gray-500 mt-2">
            Drag and drop the items to arrange them in the correct order.
          </p>
        </div>

        {/* Items to Reorder */}
        <div className="mb-6">
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                text={item.text}
                index={index}
                moveItem={moveItem}
                content={item.content}
                disabled={disabled || isSubmitted}
                isCorrect={isSubmitted && isCorrect !== null && isCorrect && item.text === question.correctOrder?.[index]}
                isIncorrect={isSubmitted && isCorrect !== null && !isCorrect && item.text !== question.correctOrder?.[index]}
              />
            ))}
          </div>
          
          {!isSubmitted ? (
            <div className="mt-4 flex justify-between">
              <button
                onClick={resetOrder}
                disabled={disabled}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Reset Order
              </button>
              <button
                onClick={handleSubmit}
                disabled={disabled || items.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Check Answer
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <div className={`p-4 rounded-lg mb-4 ${
                isCorrect 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {isCorrect ? (
                    <svg className="w-6 h-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div>
                    <h3 className="font-medium">
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </h3>
                    <p className="text-sm">
                      {isSubmitted && `Score: ${calculateScore().toFixed(1)}/${question.marks}`}
                    </p>
                  </div>
                </div>
              </div>
              
              {!isCorrect && showCorrectOrder()}
             
            </div>
          )}
        </div>

        {/* Explanation */}
        {isSubmitted && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <button 
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-blue-600 font-medium flex items-center"
            >
              {showExplanation ? 'Hide' : 'Show'} Explanation
              <svg 
                className={`ml-2 w-4 h-4 transition-transform ${showExplanation ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showExplanation && (
              <div className="mt-2 text-gray-700">
                {question.explanation}
              </div>
            )}
          </div>
        )}

        {/* Marks */}
        <div className="mt-4 text-sm text-gray-500 text-right">
          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          {isSubmitted && ` (${calculateScore().toFixed(1)} / ${question.marks})`}
        </div>
      </div>
    </DndProvider>
  );
};

export default ReorderingQuestion;
