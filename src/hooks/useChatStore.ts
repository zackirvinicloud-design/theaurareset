import { useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
}

export interface UserProgress {
  currentDay: number;
  currentPhase: 1 | 2 | 3 | 4;
  startDate: string;
  notes: Array<{
    day: number;
    note: string;
    timestamp: number;
  }>;
}

interface ChatStore {
  messages: ChatMessage[];
  userProgress: UserProgress;
}

const STORAGE_KEY = 'aura-protocol-chat';

const defaultProgress: UserProgress = {
  currentDay: 0,
  currentPhase: 1,
  startDate: new Date().toISOString(),
  notes: [],
};

const loadFromStorage = (): ChatStore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load chat from storage:', error);
  }
  return {
    messages: [],
    userProgress: defaultProgress,
  };
};

const saveToStorage = (store: ChatStore) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Failed to save chat to storage:', error);
  }
};

export const useChatStore = () => {
  const [store, setStore] = useState<ChatStore>(loadFromStorage);

  useEffect(() => {
    saveToStorage(store);
  }, [store]);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    setStore(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
    return newMessage;
  };

  const updateLastMessage = (content: string, suggestions?: string[]) => {
    setStore(prev => {
      const messages = [...prev.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
          ...(suggestions && { suggestions }),
        };
      }
      return { ...prev, messages };
    });
  };

  const updateProgress = (progress: Partial<UserProgress>) => {
    setStore(prev => ({
      ...prev,
      userProgress: { ...prev.userProgress, ...progress },
    }));
  };

  const clearMessages = () => {
    setStore(prev => ({ ...prev, messages: [] }));
  };

  const exportChat = () => {
    const text = store.messages
      .map(msg => {
        const date = new Date(msg.timestamp).toLocaleString();
        return `[${date}] ${msg.role.toUpperCase()}: ${msg.content}`;
      })
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-protocol-journal-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    messages: store.messages,
    userProgress: store.userProgress,
    addMessage,
    updateLastMessage,
    updateProgress,
    clearMessages,
    exportChat,
  };
};
