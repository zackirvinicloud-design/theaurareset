import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export const ChatInput = ({
  onSend,
  disabled,
  placeholder = "Ask about the program...",
  compact = false,
}: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      "flex gap-2 border-t border-border bg-background pb-safe",
      compact ? "p-3" : "p-4"
    )}>
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          compact
            ? "min-h-[52px] max-h-[112px] resize-none text-[15px]"
            : "min-h-[60px] max-h-[120px] resize-none text-base md:text-sm",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        size="icon"
        className={cn(
          "flex-shrink-0",
          compact ? "h-[52px] w-11" : "h-[60px] w-12"
        )}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};
