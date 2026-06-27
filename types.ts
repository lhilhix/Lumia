
export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  image?: string; // Base64 encoded image
}

export interface UserProfile {
  username: string;
  avatar: string;
  isAuth: boolean;
  theme: 'light' | 'dark';
}

export enum AppStep {
  SECRET_KEY = 'secret_key',
  USERNAME = 'username',
  CHAT = 'chat'
}
