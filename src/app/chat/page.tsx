'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// Type declarations for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};
import { FiSend, FiMic, FiPaperclip, FiMenu, FiPlus, FiLogOut } from 'react-icons/fi';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

const suggestedQuestions = [
  'What subjects can you help me with?',
  'How does Murshid work?',
  'Can you explain this concept to me?',
  'I need help with my homework',
  'What are the upcoming lessons?',
];

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! I\'m Murshid, your AI learning assistant. How can I help you today?',
    sender: 'ai',
    timestamp: new Date(),
  },
];

const initialChatHistory: ChatHistory[] = [
  {
    id: '1',
    title: 'Introduction to Murshid',
    timestamp: new Date(),
    preview: 'Hello! I\'m Murshid, your AI learning assistant...',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(initialChatHistory);
  const [currentChatId, setCurrentChatId] = useState<string | null>('1');
  const [showNewChatButton, setShowNewChatButton] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`; // 384px = 24rem
    }
  }, [input]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition() as SpeechRecognition;
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: Event) => {
          const errorEvent = event as unknown as SpeechRecognitionErrorEvent;
          console.error('Speech recognition error', errorEvent.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${input}"`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);

      // Update chat history
      if (currentChatId === '1') {
        const newChatId = Date.now().toString();
        setChatHistory(prev => [{
          id: newChatId,
          title: input.substring(0, 30) + (input.length > 30 ? '...' : ''),
          timestamp: new Date(),
          preview: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
        }, ...prev]);
        setCurrentChatId(newChatId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = useCallback(() => {
    setMessages(initialMessages);
    setCurrentChatId(null);
    setEditingChatId(null);
  }, []);

  const handleDeleteChat = useCallback((chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        handleNewChat();
      }
    }
  }, [currentChatId, handleNewChat]);

  const startEditing = useCallback((chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  }, []);

  const saveEdit = useCallback((chatId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      setChatHistory(prev =>
        prev.map(chat =>
          chat.id === chatId
            ? { ...chat, title: editTitle.trim() }
            : chat
        )
      );
      setEditingChatId(null);
      setEditTitle('');
    }
  }, [editTitle]);

  const cancelEdit = useCallback(() => {
    setEditingChatId(null);
    setEditTitle('');
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file.name);
    }
  };

  // Show welcome screen when no messages or only the initial message
  const showWelcomeScreen = messages.length <= 1 && !isLoading;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setShowSidebar(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white shadow-lg"
      >
        <FiMenu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] cursor-pointer transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <h3 className="px-2 py-2 text-sm font-medium text-gray-500">Recent Chats</h3>
          <div className="space-y-1">
            {chatHistory.map(chat => (
              <div
                key={chat.id}
                className={`group relative ${currentChatId === chat.id ? 'bg-[var(--primary-color)] bg-opacity-10' : ''} rounded-lg`}
              >
                {editingChatId === chat.id ? (
                  <form onSubmit={(e) => saveEdit(chat.id, e)} className="p-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 text-sm border rounded focus:border-none focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-gray-900"
                      autoFocus
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2 py-1 text-xs bg-[var(--primary-color)] text-white rounded hover:bg-[var(--primary-color)] cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      setShowSidebar(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate cursor-pointer ${currentChatId === chat.id
                      ? 'bg-blue-100 text-[var(--primary-color)]'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <div className="font-medium flex justify-between items-center">
                      <span className="truncate pr-8">{chat.title}</span>
                      <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => startEditing(chat.id, chat.title, e)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full cursor-pointer"
                          title="Rename chat"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer"
                          title="Delete chat"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{chat.preview}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FiMessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Murshid AI</span>
          </div>
        </div> */}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-64">
        {/* Back Button */}
        <div className="flex justify-end gap-2 px-4 py-6 border-b">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-red-600 transition cursor-pointer"
          >
            <FiLogOut className="mr-2" />
            Back
          </button>
        </div>


        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {showWelcomeScreen ? (
            <div className="max-w-3xl mx-auto pt-10 px-4">
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-cyan-400 p-1">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src="/images/favicon.png"
                      alt="Murshid"
                      width={80}
                      height={80}
                      priority
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">How can I help you today?</h2>
                <p className="text-gray-600">Ask me anything about your studies or choose from these common questions:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      // Auto-send the selected question
                      setTimeout(() => {
                        const event = new KeyboardEvent('keydown', {
                          key: 'Enter',
                          code: 'Enter',
                          keyCode: 13,
                          which: 13,
                          bubbles: true,
                        });
                        document.dispatchEvent(event);
                      }, 100);
                    }}
                    className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 cursor-pointer"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-2xl px-4 py-3 ${message.sender === 'user'
                    ? 'bg-[var(--primary-color)] text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                    }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white text-right' : 'text-gray-400 text-left'
                    }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className=" p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full px-4 py-6 pr-20 text-gray-900 border border-gray-300 rounded-xl resize-none overflow-y-auto focus:outline-none focus:ring-0 focus:border-gray-00"
                disabled={isLoading}
              />

              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  disabled={isLoading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Attach file"
                >
                  <FiPaperclip className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${isListening
                    ? 'text-red-500 bg-red-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  title={isListening ? 'Stop listening' : 'Use voice input'}
                >
                  <FiMic className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-full ${input.trim()
                    ? 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)] hover:text-white cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    } transition-colors`}
                  title="Send message"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Murshid may produce inaccurate information. Consider checking important information.
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}
