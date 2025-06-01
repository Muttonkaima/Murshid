'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FiSend, FiMic, FiPaperclip, FiMenu, FiPlus, FiLogOut, FiTrash2, FiEdit2, FiX, FiMessageSquare } from 'react-icons/fi';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import chatService, { ChatMessage } from '@/services/chatService';
import { useRouter } from 'next/navigation';

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

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  isActive?: boolean;
}

function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await chatService.getConversations();
        console.log('Conversations response in page:', response); // Debug log
        
        if (response.success && Array.isArray(response.conversations)) {
          const history = response.conversations
            .filter(conv => conv) // Filter out any null/undefined conversations
            .map(conv => ({
              id: conv._id,
              title: conv.title || 'New Chat',
              timestamp: new Date(conv.updatedAt || conv.createdAt || Date.now()),
              preview: conv.messages?.[0]?.content?.substring(0, 50) || 'New conversation',
              isActive: conv._id === currentChatId
            }));
          
          console.log('Processed history:', history); // Debug log
          setChatHistory(history);
          
          // If there are conversations but none selected, select the first one
          if (history.length > 0 && !currentChatId) {
            await loadConversation(history[0].id);
          }
          
          // If we have a currentChatId but no active conversation, select it
          if (currentChatId && !history.some(chat => chat.id === currentChatId)) {
            const currentConv = await chatService.getConversation(currentChatId);
            if (currentConv.success && currentConv.conversation) {
              setChatHistory(prev => [
                {
                  id: currentConv.conversation._id,
                  title: currentConv.conversation.title || 'New Chat',
                  timestamp: new Date(currentConv.conversation.updatedAt || currentConv.conversation.createdAt || Date.now()),
                  preview: currentConv.conversation.messages?.[0]?.content?.substring(0, 50) || 'New conversation',
                  isActive: true
                },
                ...prev
              ]);
            }
          }
        } else {
          console.error('Invalid conversations data:', response);
          setError('Failed to load conversations. Invalid data received.');
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
        setError('Failed to load conversations. Please refresh the page.');
      } finally {
        setIsInitialized(true);
      }
    };

    loadConversations();
  }, [currentChatId]);

  // Load a specific conversation
  const loadConversation = async (conversationId: string) => {
    try {
      if (currentChatId === conversationId) return;
      
      setIsLoading(true);
      const response = await chatService.getConversation(conversationId);
      
      if (response.success && response.conversation) {
        const conv = response.conversation;
        const formattedMessages = conv.messages.map((msg: any) => ({
          id: msg._id || uuidv4(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp || Date.now())
        }));
        
        setMessages(formattedMessages);
        setCurrentChatId(conversationId);
        setShowWelcomeScreen(false);
        
        // Update the chat history to mark this as the active conversation
        setChatHistory(prev => 
          prev.map(chat => ({
            ...chat,
            isActive: chat.id === conversationId
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('Failed to load conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message to UI immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setShowWelcomeScreen(false);
    setIsLoading(true);
    setError(null);

    try {
      // Send the message and get AI response
      const response = await chatService.sendMessage(
        updatedMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        currentChatId || undefined
      );

      if (response.success) {
        const aiMessage: Message = {
          id: uuidv4(),
          content: response.message,
          role: 'assistant',
          timestamp: new Date(),
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);

        // Update chat history
        if (response.isNewConversation && response.conversationId) {
          // Add new conversation to history
          const newChat: ChatHistory = {
            id: response.conversationId,
            title: response.message.substring(0, 30) + (response.message.length > 30 ? '...' : ''),
            timestamp: new Date(),
            preview: response.message.substring(0, 50) + (response.message.length > 50 ? '...' : '')
          };
          setChatHistory(prev => [newChat, ...prev]);
          setCurrentChatId(response.conversationId);
        } else if (currentChatId) {
          // Update existing chat in history
          setChatHistory((prev: ChatHistory[]) =>
            prev.map((chat: ChatHistory) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    preview: response.message.substring(0, 50) + (response.message.length > 50 ? '...' : ''),
                    timestamp: new Date()
                  }
                : chat
            )
          );
        }
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, currentChatId]);

  // Handle deleting a conversation
  const handleDeleteChat = useCallback(async (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      try {
        const response = await chatService.deleteConversation(chatId);
        if (response.success) {
          // Remove the deleted chat from history
          setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
          
          // If the deleted chat was the current one, reset the view
          if (currentChatId === chatId) {
            setMessages([]);
            setCurrentChatId(null);
            setShowWelcomeScreen(true);
            
            // If there are other chats, select the most recent one
            const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
            if (updatedHistory.length > 0) {
              await loadConversation(updatedHistory[0].id);
            }
          }
        } else {
          throw new Error(response.message || 'Failed to delete conversation');
        }
      } catch (error) {
        console.error('Failed to delete conversation:', error);
        setError('Failed to delete conversation. Please try again.');
      }
    }
  }, [currentChatId, chatHistory, loadConversation]);

  // Handle saving edited chat title
  const saveEdit = useCallback(async (chatId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      const response = await chatService.updateConversation(chatId, { title: editTitle });

      if (response.success && response.conversation) {
        setChatHistory(prev =>
          prev.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  title: response.conversation?.title || editTitle,
                  timestamp: new Date(response.conversation.updatedAt || Date.now())
                }
              : chat
          )
        );
      } else {
        throw new Error(response.message || 'Failed to update conversation');
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
      setError('Failed to update conversation title. Please try again.');
    }

    setEditingChatId(null);
    setEditTitle('');
  }, [editTitle]);

  const cancelEdit = useCallback(() => {
    setEditingChatId(null);
    setEditTitle('');
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would handle file upload here
      console.log('File selected:', file.name);
      // For now, just show a message
      setInput((prev: string) => `${prev ? `${prev}\n` : ''}I've uploaded: ${file.name}`);
    }
    // Reset the input to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  }, []);

  // Handle starting a new chat
  const handleNewChat = async () => {
    try {
      // Create a new conversation in the backend
      const response = await chatService.createConversation('New Chat');
      
      if (response.success && response.conversation) {
        const newChat: ChatHistory = {
          id: response.conversation._id,
          title: 'New Chat',
          timestamp: new Date(),
          preview: 'Start a new conversation',
          isActive: true
        };
        
        // Reset the active state for all other chats
        setChatHistory(prev => [
          newChat,
          ...prev.map(chat => ({
            ...chat,
            isActive: false
          }))
        ]);
        
        setMessages([]);
        setCurrentChatId(newChat.id);
        setShowWelcomeScreen(true);
        setEditingChatId(null);
        setError(null);
      } else {
        throw new Error('Failed to create new conversation');
      }
    } catch (error) {
      console.error('Failed to start new conversation:', error);
      setError('Failed to start a new conversation. Please try again.');
    }
  };

  // Handle key down event for the input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Start editing a chat title
  const startEditing = useCallback((chatId: string, title: string) => {
    setEditingChatId(chatId);
    setEditTitle(title);
  }, []);

  // Show welcome screen when explicitly set or when there are no messages

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

        <div className="flex-1 overflow-y-auto">
          <h3 className="px-4 py-3 text-sm font-medium text-gray-500 border-b border-gray-100">Recent Chats</h3>
          <div className="divide-y divide-gray-100">
            {chatHistory.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No conversations yet. Start a new chat!
              </div>
            ) : (
              chatHistory.map(chat => (
                <div
                  key={chat.id}
                  className={`group relative ${chat.isActive ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
                >
                  {editingChatId === chat.id ? (
                    <form 
                      onSubmit={(e) => saveEdit(chat.id, e)} 
                      className="p-2 bg-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] text-gray-900"
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
                        loadConversation(chat.id);
                        setShowSidebar(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {chat.title}
                          </p>
                          {/* {chat.preview && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {chat.preview}
                            </p>
                          )} */}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(chat.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-1 ml-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => startEditing(chat.id, chat.title)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Rename chat"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                          onClick={() => handleDeleteChat(chat.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete chat"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              )))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FiMessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Murshid AI</span>
          </div>
        </div>
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
          {error && (
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          )}
          {showWelcomeScreen ? (
            <div className="max-w-3xl mx-auto pt-10 px-4">
              <div className="text-center mb-8">
                <div className="w-64 h-64 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-cyan-400 p-1">
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src="/images/favicon.png"
                      alt="Murshid"
                      width={180}
                      height={180}
                      priority
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Hi there! I'm Murshid, your AI learning assistant.</h2>
                <p className="text-gray-600">How can I help you today?</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-2xl px-4 py-3 ${message.role === 'user'
                    ? 'bg-[var(--primary-color)] text-white rounded-br-none'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                    }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-white text-right' : 'text-gray-400 text-left'
                    }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  className={`p-2 rounded-full ${input.trim() && !isLoading
                    ? 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)] hover:text-white cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    } transition-colors`}
                  title={input.trim() ? "Send message" : "Type a message to send"}
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

export default ChatPage;
