import api from './api';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: Message[];
  isDeleted?: boolean;
  updatedAt: string;
  createdAt: string;
}

export const conversationService = {
  // Create a new conversation
  async createConversation(title: string = 'New Conversation'): Promise<{ data: { conversation: Conversation } }> {
    try {
      const response = await api.post('/conversations', { title });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Get all conversations for the current user
  async getUserConversations(): Promise<{ data: { conversations: Conversation[] } }> {
    try {
      const response = await api.get('/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get a single conversation with messages
  async getConversation(id: string): Promise<{ data: { conversation: Conversation } }> {
    try {
      const response = await api.get(`/conversations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Update a conversation (add messages or update title)
  async updateConversation(
    id: string, 
    updates: { 
      messages?: Message[], 
      title?: string,
      isDeleted?: boolean
    }
  ): Promise<{ data: { conversation: Conversation } }> {
    try {
      const response = await api.patch(`/conversations/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  },

  // Delete a conversation
  async deleteConversation(id: string): Promise<void> {
    try {
      await api.delete(`/conversations/${id}`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Add a message to a conversation
  async addMessage(
    conversationId: string, 
    message: Message
  ): Promise<{ data: { conversation: Conversation } }> {
    return this.updateConversation(conversationId, {
      messages: [message]
    });
  },
};

export default conversationService;
