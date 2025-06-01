import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import conversationService, { Message as ConversationMessage, Conversation } from './conversationService';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  parts?: { text: string }[]; // For Gemini API compatibility
  id?: string;
  timestamp?: Date;
}

// Get API key from environment variables
const getApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyCdOvSAm6PhM91SwpfMGLs4iFyRrhhlBko';
  
  if (!apiKey && typeof window !== 'undefined') {
    console.error('NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables');
    return '';
  }
  
  return apiKey;
};

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

export const chatService = {
  /**
   * Send a message to the Gemini API and get a response
   */
  async sendMessage(
    messages: ChatMessage[], 
    conversationId?: string
  ): Promise<{ 
    success: boolean; 
    message: string;
    conversationId?: string;
    isNewConversation?: boolean;
  }> {
    try {
      if (!model) {
        const errorMsg = 'Gemini API is not properly initialized. Please check your API key and try again.';
        console.error(errorMsg);
        return {
          success: false,
          message: errorMsg
        };
      }

      // Get the last user message
      const userMessage = messages.findLast((msg): msg is ChatMessage & { role: 'user', content: string } => 
        msg.role === 'user' && !!msg.content
      );
      
      if (!userMessage) {
        throw new Error('No valid user message found to send to Gemini');
      }

      console.log('Sending message to Gemini:', userMessage.content);

      // Create a new conversation if no conversationId is provided
      let currentConversationId = conversationId;
      let isNewConversation = false;
      
      if (!currentConversationId) {
        const newConversation = await conversationService.createConversation(
          userMessage.content.substring(0, 50) + (userMessage.content.length > 50 ? '...' : '')
        );
        currentConversationId = newConversation.data.conversation._id;
        isNewConversation = true;
      }

      // Save user message to conversation
      const userMsgToSave: ConversationMessage = {
        role: 'user',
        content: userMessage.content,
        timestamp: new Date()
      };
      
      await conversationService.addMessage(currentConversationId, userMsgToSave);

      // Start a new chat session with no history
      const chat = model.startChat();
      
      // Send the user message to Gemini
      const result = await chat.sendMessage(userMessage.content);
      const response = await result.response;
      const aiResponse = response.text();
      console.log('Received response from Gemini:', aiResponse);

      // Save AI response to conversation
      const aiMsgToSave: ConversationMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      await conversationService.addMessage(currentConversationId, aiMsgToSave);

      return {
        success: true,
        message: aiResponse,
        conversationId: currentConversationId,
        isNewConversation
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process message'
      };
    }
  },

  // Create a new conversation
  async createConversation(title: string = 'New Chat') {
    try {
      const response = await conversationService.createConversation(title);
      return {
        success: true,
        conversation: response.data.conversation
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create conversation',
        conversation: null
      };
    }
  },

  // Get all conversations for the current user
  async getConversations() {
    try {
      const response = await conversationService.getUserConversations();
      console.log('Conversations response:', response); // Debug log
      return {
        success: true,
        conversations: response?.data?.conversations || []
      };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch conversations',
        conversations: []
      };
    }
  },

  // Get a single conversation with messages
  async getConversation(conversationId: string) {
    try {
      const response = await conversationService.getConversation(conversationId);
      return {
        success: true,
        conversation: response.data.conversation
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch conversation',
        conversation: null
      };
    }
  },

  // Update a conversation
  async updateConversation(conversationId: string, updates: { title?: string }) {
    try {
      const response = await conversationService.updateConversation(conversationId, updates);
      return {
        success: true,
        conversation: response.data.conversation
      };
    } catch (error) {
      console.error('Error updating conversation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update conversation'
      };
    }
  },

  // Soft delete a conversation
  async deleteConversation(conversationId: string) {
    try {
      // First mark as deleted
      const response = await conversationService.updateConversation(conversationId, { 
        isDeleted: true 
      });
      
      return {
        success: true,
        conversation: response.data.conversation
      };
    } catch (error) {
      console.error('Error soft deleting conversation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete conversation'
      };
    }
  }
};

export default chatService;
