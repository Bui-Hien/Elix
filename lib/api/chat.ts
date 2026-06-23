import { apiClient, longApiClient } from '../api-client';
import type { ChatSession, SendMessageRequest, SendMessageResponse } from '@/types/chat';

export const chatApi = {
  createSession: async (): Promise<ChatSession> => {
    const response = await apiClient.post('/chat/sessions', {});
    // Backend returns { sessionId: "guid" } with capital S
    return { sessionId: response.sessionId || response.SessionId };
  },

  sendMessage: async (request: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await apiClient.post('/chat/messages', request);
    // Backend returns { answer, suggestedProducts, sources }
    return {
      answer: response.answer || response.Answer,
      suggestedProducts: response.suggestedProducts || response.SuggestedProducts || [],
      sources: response.sources || response.Sources || []
    };
  },
};

export const adminChatApi = {
  reindex: async (force: boolean = false) => {
    // Use longApiClient for reindex (2 minute timeout)
    const response = await longApiClient.post(`/admin/chat/reindex?force=${force}`, {});
    return response;
  },
};
