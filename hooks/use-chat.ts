import { useState, useCallback } from 'react';
import { chatApi } from '@/lib/api/chat';
import type { ChatMessage, SuggestedProduct } from '@/types/chat';

export function useChat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lazy session initialization - only create when needed
  const initSession = useCallback(async () => {
    if (sessionId) return sessionId;
    try {
      const session = await chatApi.createSession();
      setSessionId(session.sessionId);
      return session.sessionId;
    } catch (err) {
      console.error('Failed to create chat session:', err);
      setError('Không thể khởi tạo phiên chat');
      return null;
    }
  }, [sessionId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Lazily create session if not yet initialized
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await initSession();
      if (!currentSessionId) return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendMessage({
        sessionId: currentSessionId,
        message: content.trim(),
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        suggestedProducts: response.suggestedProducts,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, initSession]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isReady: true, // Session is created lazily on first message
  };
}
