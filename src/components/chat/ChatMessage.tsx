import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedText } from './AnimatedText';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export const ChatMessage = ({ role, content, timestamp, isStreaming = false }: ChatMessageProps) => {
  const isUser = role === 'user';
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-primary' : 'bg-secondary'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>
      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'rounded-lg px-4 py-2 max-w-[85%]',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-foreground'
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {isUser ? (
              content
            ) : (
              <AnimatedText 
                targetText={content} 
                isComplete={!isStreaming}
                speed={50}
              />
            )}
          </p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">{time}</span>
      </div>
    </div>
  );
};
