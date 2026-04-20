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
      "border-t border-border/50 bg-background/95 backdrop-blur-md",
      compact ? "px-2 py-2" : "p-4"
    )}>
      <div className={cn(
        "flex w-full items-end gap-2 rounded-[1.4rem] border border-border/60 bg-card/80 p-2 shadow-sm",
        compact && "rounded-[1.2rem] p-1.5"
      )}>
        <div className="min-w-0 flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
              compact
                ? "min-h-[40px] max-h-[96px] resize-none px-2 py-1 text-sm"
                : "min-h-[62px] max-h-[120px] resize-none px-2 py-2 text-base md:text-sm",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          {!compact && (
            <p className="px-2 pb-1 text-[11px] text-muted-foreground">
              Keep it conversational. Press Enter to send.
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          size="icon"
          className={cn(
            "flex-shrink-0 rounded-full shadow-sm",
            compact ? "h-10 w-10" : "h-11 w-11"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
