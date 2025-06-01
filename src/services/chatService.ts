import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Get API key from environment variables
const getApiKey = (): string => {
  // In Next.js, environment variables with NEXT_PUBLIC_ prefix are exposed to the browser
  // They are inlined during the build process
  const isBrowser = typeof window !== 'undefined';
  
  // Log environment info for debugging
  if (isBrowser) {
    console.log('Browser environment variables:', {
      hasApiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      apiKeyLength: process.env.NEXT_PUBLIC_GEMINI_API_KEY?.length,
      nodeEnv: process.env.NODE_ENV,
      allEnv: process.env
    });
  }

  // First try to get from process.env (works in both server and client in Next.js)
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyCdOvSAm6PhM91SwpfMGLs4iFyRrhhlBko';
  
  if (!apiKey) {
    console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables');
    if (isBrowser) {
      console.error('Make sure the environment variable is properly set in .env.local');
    }
    return '';
  }
  
  return apiKey;
};

// Initialize Gemini API with configuration
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Lazy initialization to ensure we have the API key
try {
  const apiKey = getApiKey();
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.9,
        topP: 1,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
  }
} catch (error) {
  console.error('Failed to initialize Gemini API:', error);
}


export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: Date;
}

export interface Conversation {
  id?: string;
  title: string;
  messages: ChatMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const chatService = {
  /**
   * Send a message to the Gemini API and get a response
   */
  async sendMessage(messages: ChatMessage[]): Promise<{ success: boolean; message: string }> {
    try {
      if (!model) {
        const errorMsg = 'Gemini API is not properly initialized. Please check your API key and try again.';
        console.error(errorMsg);
        return {
          success: false,
          message: errorMsg
        };
      }

      // Get the last user message (we only process one message at a time now)
      const userMessage = messages.findLast(msg => msg.role === 'user');
      
      if (!userMessage) {
        throw new Error('No user message found to send to Gemini');
      }

      console.log('Sending message to Gemini:', userMessage.content);

      // Start a new chat session with no history
      const chat = model.startChat();
      
      // Send the user message
      const result = await chat.sendMessage(userMessage.content);
      const response = await result.response;
      const text = response.text();
      console.log('Received response from Gemini:', text);
      
      return {
        success: true,
        message: text,
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error processing your request.',
      };
    }
  },

  /**
   * Create a new conversation
   */
  async createConversation(title: string, initialMessage: string): Promise<Conversation> {
    const newConversation: Conversation = {
      title,
      messages: [
        {
          role: 'user',
          content: initialMessage,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, you would save this to your backend
    // For now, we'll just return the new conversation
    return newConversation;
  },

  /**
   * Add a message to an existing conversation
   */
  async addMessageToConversation(
    conversation: Conversation,
    role: 'user' | 'assistant',
    content: string
  ): Promise<Conversation> {
    const updatedConversation = {
      ...conversation,
      messages: [
        ...conversation.messages,
        {
          role,
          content,
          timestamp: new Date(),
        },
      ],
      updatedAt: new Date(),
    };

    // In a real implementation, you would save this to your backend
    return updatedConversation;
  },

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    // In a real implementation, you would fetch this from your backend
    return [];
  },

  /**
   * Get a single conversation by ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    // In a real implementation, you would fetch this from your backend
    return null;
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<boolean> {
    // In a real implementation, you would delete this from your backend
    return true;
  },
};

export default chatService;
