export interface ChatSession {
  sessionId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedProducts?: SuggestedProduct[];
  timestamp: Date;
}

export interface SuggestedProduct {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
}

export interface SendMessageResponse {
  answer: string;
  suggestedProducts: SuggestedProduct[];
  sources: string[];
}
