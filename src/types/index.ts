export interface User {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  plan: 'free' | 'build' | 'scale' | 'enterprise';
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export interface Model {
  id: string;
  name: string;
  author: string;
  type: 'chat' | 'image' | 'language' | 'embedding' | 'audio' | 'moderation' | 'rerank';
  pricing: string;
  description?: string;
  huggingFaceUrl?: string;
  releaseDate?: string;
  isFree?: boolean;
}

export interface UserModel {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'deploying' | 'failed';
  modality: string;
  created: string;
  endpoint?: string;
}

export interface FineTuningJob {
  id: string;
  baseModel: string;
  suffix: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  runTime?: string;
  dateInitiated: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface PlaygroundState {
  currentModel: Model | null;
  systemPrompt: string;
  messages: ChatMessage[];
  isLoading: boolean;
}

export interface BillingInfo {
  balance: number;
  rateLimits: {
    rpm: number;
    tier: string;
  };
  paymentMethod?: {
    last4: string;
    brand: string;
  };
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  dataUsage: boolean;
  modelTraining: boolean;
} 