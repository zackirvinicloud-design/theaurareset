import { Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChatMessage = ({ role, content, timestamp, suggestions, onSuggestionClick }: ChatMessageProps) => {
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
      <div className={cn('flex flex-col gap-2 max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'rounded-lg px-4 py-2',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-foreground'
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        </div>
        {suggestions && suggestions.length > 0 && !isUser && (
          <div className="flex flex-col gap-1.5 w-full">
            {suggestions.map((suggestion, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-xs justify-start h-auto py-2 px-3 whitespace-normal text-left leading-relaxed hover:bg-primary/10 hover:border-primary/40"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
    </div>
  );
};
