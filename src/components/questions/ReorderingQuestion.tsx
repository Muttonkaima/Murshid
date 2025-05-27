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

  const opacity = isDragging ? 0.6 : 1;
  drag(drop(ref));

  let borderColor = 'border-gray-200';
  let bgColor = 'bg-white';
  let numberBg = 'bg-gray-50';
  let numberText = 'text-gray-700';

  if (isCorrect) {
    borderColor = 'border-green-400';
    bgColor = 'bg-green-50';
    numberBg = 'bg-green-100';
    numberText = 'text-green-700';
  } else if (isIncorrect) {
    borderColor = 'border-red-400';
    bgColor = 'bg-red-50';
    numberBg = 'bg-red-100';
    numberText = 'text-red-700';
  }

  return (
    <div
      ref={ref}
      style={{ opacity, cursor: isDragging ? 'grabbing' : 'grab' }}
      className={`group p-3 sm:p-4 border-2 rounded-lg mb-2 flex items-center transition-all duration-200 ${disabled
          ? 'opacity-70 cursor-not-allowed'
          : 'hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30 active:cursor-grabbing'
        } ${borderColor} ${bgColor}`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base font-medium mr-3 transition-colors ${isCorrect
            ? 'bg-green-100 text-green-700 border-2 border-green-400 shadow-sm'
            : isIncorrect
              ? 'bg-red-100 text-red-700 border-2 border-red-400 shadow-sm'
              : 'bg-white text-gray-700 border-2 border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50/50'
          }`}
      >
        {index + 1}
      </div>
      <div className="flex-1 text-sm sm:text-base">
        <QuestionContent content={content} />
      </div>
      {!disabled && (
        <div className="ml-2 text-gray-300 group-hover:text-gray-400">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  onAnswer?: (order: string[], isCorrect: boolean, scoreObtained: number) => void;
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
    const scoreObtained = calculateScore();
    setIsSubmitted(true);
    setIsCorrect(correct);

    if (onAnswer) {
      onAnswer(items.map(item => item.text), correct, scoreObtained);
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
    // if (!isSubmitted || !question.correctOrder) return 0;

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full transition-all duration-200 hover:shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          {/* Question Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  <QuestionContent content={question.question} />
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Drag and drop to arrange in the correct order
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 whitespace-nowrap">
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>
          </div>

          {/* Items to Reorder */}
          <div className="mb-6">
            <div className="space-y-2 sm:space-y-3">
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
              <div className="mt-4 flex flex-col sm:flex-row justify-between gap-3">
                <button
                  onClick={resetOrder}
                  disabled={disabled}
                  className="order-2 sm:order-1 w-full sm:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset Order
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={disabled || items.length === 0}
                  className="order-1 sm:order-2 w-full sm:w-auto px-6 py-2.5 bg-blue-500 text-white font-medium text-sm sm:text-base rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <div className={`p-4 rounded-lg mb-4 border-l-4 ${isCorrect
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                  }`}>
                  <div className="flex items-start">
                    {isCorrect ? (
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <div>
                      <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect
                          ? `Good job! You scored ${calculateScore().toFixed(1)}/${question.marks} (${(calculateScore() / question.marks * 100).toFixed(0)}%)`
                          : `Incorrect. You scored: ${calculateScore().toFixed(1)}/${question.marks}`}
                      </p>
                    </div>
                  </div>
                </div>

                {!isCorrect && showCorrectOrder()}

                {question.explanation && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mt-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-blue-800 mb-1">Explanation</p>
                        <p className="text-blue-700">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>          
        </div>
  
        <div className="w-full mt-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 gap-2 sm:gap-0">
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Reordering Question</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-gray-600 bg-white px-2.5 sm:px-3 py-1 rounded-full border border-gray-200">
              {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
            </div>
          </div>
      </div>
    </DndProvider>
  );
};

export default ReorderingQuestion;
