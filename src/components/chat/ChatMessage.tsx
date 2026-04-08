import { useState, useRef, useEffect } from 'react';
import { Leaf, User, ChevronRight, PenLine, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGutBrainDisplayText, parseCoachActions, parseGutBrainClarifier, type CoachAction } from '@/lib/gutbrain';
import { AnimatedText } from './AnimatedText';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  enableChoices?: boolean;
  onChoiceSelect?: (choice: string) => void;
  onActionSelect?: (action: CoachAction) => void;
}

const isOtherOption = (option: string) => {
  const lower = option.toLowerCase().trim();
  return lower === 'something else' || lower === 'other' || lower.startsWith('something else');
};

export const ChatMessage = ({
  role,
  content,
  timestamp,
  isStreaming = false,
  enableChoices = false,
  onChoiceSelect,
  onActionSelect,
}: ChatMessageProps) => {
  const isUser = role === 'user';
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const clarifier = isUser ? null : parseGutBrainClarifier(content);
  const coachActions = isUser ? [] : parseCoachActions(content);
  const displayContent = isUser ? content : getGutBrainDisplayText(content);
  const showInteractiveChoices = Boolean(!isUser && clarifier && !isStreaming && enableChoices && onChoiceSelect);
  const shoppingActionChips = coachActions.filter((action) => (
    action.type === 'open_shopping'
    || (action.type === 'open_view' && action.view === 'shopping')
  ));
  const showShoppingActionChip = Boolean(!isUser && !isStreaming && shoppingActionChips.length && onActionSelect);

  const [otherExpanded, setOtherExpanded] = useState(false);
  const [otherText, setOtherText] = useState('');
  const otherInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (otherExpanded && otherInputRef.current) {
      otherInputRef.current.focus();
    }
  }, [otherExpanded]);

  const handleOtherSubmit = () => {
    if (otherText.trim() && onChoiceSelect) {
      onChoiceSelect(otherText.trim());
      setOtherExpanded(false);
      setOtherText('');
    }
  };

  // Extract step indicator from question if present (e.g. "(1 of 2)")
  const stepMatch = clarifier?.question.match(/\((\d+)\s+of\s+(\d+)\)/i);
  const stepInfo = stepMatch ? { current: parseInt(stepMatch[1]), total: parseInt(stepMatch[2]) } : null;
  const cleanQuestion = clarifier?.question.replace(/\s*\(\d+\s+of\s+\d+\)/i, '').trim() || '';

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-primary' : 'bg-gradient-to-br from-emerald-500/20 to-teal-600/30 ring-1 ring-emerald-500/20'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Leaf className="w-4 h-4 text-emerald-400" />
        )}
      </div>
      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start', !isUser && 'max-w-[90%]')}>
        {clarifier && !isStreaming ? (
          <>
            {/* Preamble text (brief answer) */}
            {clarifier.preamble && (
              <div className={cn('rounded-lg px-4 py-2 mb-2', 'bg-muted text-foreground')}>
                <p className="text-sm whitespace-pre-wrap break-words">{clarifier.preamble}</p>
              </div>
            )}
            {/* Clarifier question with optional step indicator */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {cleanQuestion || clarifier.question}
              </p>
              {stepInfo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  {stepInfo.current}/{stepInfo.total}
                </span>
              )}
            </div>
            {/* Step progress bar */}
            {stepInfo && (
              <div className="flex gap-1 mb-2 px-1 w-full">
                {Array.from({ length: stepInfo.total }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      i < stepInfo.current ? 'bg-emerald-500/60' : 'bg-border/40'
                    )}
                  />
                ))}
              </div>
            )}
            {showShoppingActionChip && (
              <div className="mb-3 flex flex-wrap gap-2">
                {shoppingActionChips.map((action, index) => (
                  <button
                    key={`${action.type}-${action.label}-${index}`}
                    onClick={() => onActionSelect?.(action)}
                    className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/14"
                  >
                    {action.label || 'Open shopping list'}
                  </button>
                ))}
              </div>
            )}
            {/* Choice cards */}
            <div className="grid gap-2 w-full">
              {clarifier.options.map((option, i) => {
                const isOther = isOtherOption(option);

                if (showInteractiveChoices && isOther) {
                  // "Something else" card with expansion
                  return (
                    <div key={option} className="w-full">
                      {!otherExpanded ? (
                        <button
                          onClick={() => setOtherExpanded(true)}
                          className={cn(
                            'group relative flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left text-sm',
                            'bg-background/40 backdrop-blur-sm',
                            'border-dashed border-border/50 hover:border-emerald-500/30',
                            'hover:bg-emerald-500/5',
                            'transition-all duration-200 ease-out',
                          )}
                        >
                          <span className={cn(
                            'flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0',
                            'bg-muted/60 text-muted-foreground',
                            'group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors',
                          )}>
                            <PenLine className="w-3 h-3" />
                          </span>
                          <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors">{option}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-emerald-400 transition-colors" />
                        </button>
                      ) : (
                        <div className={cn(
                          'flex items-center gap-2 w-full rounded-xl border px-3 py-2',
                          'bg-background/60 backdrop-blur-sm',
                          'border-emerald-500/30 ring-1 ring-emerald-500/10',
                        )}>
                          <input
                            ref={otherInputRef}
                            type="text"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleOtherSubmit();
                              if (e.key === 'Escape') { setOtherExpanded(false); setOtherText(''); }
                            }}
                            placeholder="Type your answer..."
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                          />
                          <button
                            onClick={handleOtherSubmit}
                            disabled={!otherText.trim()}
                            className={cn(
                              'flex items-center justify-center w-7 h-7 rounded-full transition-colors',
                              otherText.trim()
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-muted/40 text-muted-foreground/30'
                            )}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                return showInteractiveChoices ? (
                  <button
                    key={option}
                    onClick={() => onChoiceSelect?.(option)}
                    className={cn(
                      'group relative flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left text-sm',
                      'bg-background/60 backdrop-blur-sm',
                      'border-border/60 hover:border-emerald-500/40',
                      'hover:bg-emerald-500/5',
                      'transition-all duration-200 ease-out',
                      'active:scale-[0.98]',
                    )}
                  >
                    <span className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold flex-shrink-0',
                      'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
                      'group-hover:bg-emerald-500/20 group-hover:ring-emerald-500/40 transition-colors',
                    )}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 font-medium">{option}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ) : (
                  <div
                    key={option}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border border-border/40 px-4 py-3 text-sm bg-muted/30',
                      isOther && 'border-dashed'
                    )}
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold bg-muted text-muted-foreground flex-shrink-0">
                      {isOther ? <PenLine className="w-3 h-3" /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 text-muted-foreground">{option}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
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
                    targetText={displayContent} 
                    isComplete={!isStreaming}
                    speed={50}
                  />
                )}
              </p>
            </div>
            {showShoppingActionChip && (
              <div className="mt-2 flex flex-wrap gap-2">
                {shoppingActionChips.map((action, index) => (
                  <button
                    key={`${action.type}-${action.label}-${index}`}
                    onClick={() => onActionSelect?.(action)}
                    className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/14"
                  >
                    {action.label || 'Open shopping list'}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <span className="text-xs text-muted-foreground mt-1">{time}</span>
      </div>
    </div>
  );
};
