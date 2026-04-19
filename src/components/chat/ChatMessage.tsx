import { useState, useRef, useEffect } from 'react';
import { User, ChevronRight, PenLine, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GutBrainLogo } from '@/components/brand/GutBrainLogo';
import {
  getGutBrainDisplayText,
  parseCoachActions,
  parseGutBrainClarifier,
  parseGutBrainRecipeActions,
  parseGutBrainShoppingActions,
  type CoachAction,
  type GutBrainRecipeAction,
  type GutBrainShoppingAction,
} from '@/lib/gutbrain';
import { AnimatedText } from './AnimatedText';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  enableChoices?: boolean;
  onChoiceSelect?: (choice: string) => void;
  onActionSelect?: (action: CoachAction) => void;
  onRecipeActionSelect?: (action: GutBrainRecipeAction) => Promise<unknown> | unknown;
  onShoppingActionSelect?: (action: GutBrainShoppingAction) => Promise<unknown> | unknown;
  onRecipeIngredientsToShoppingSelect?: (action: GutBrainRecipeAction) => Promise<unknown> | unknown;
}

const isOtherOption = (option: string) => {
  const lower = option.toLowerCase().trim();
  return lower === 'something else' || lower === 'other' || lower.startsWith('something else');
};

const getFreeTextConfig = (question: string) => {
  const normalized = question.toLowerCase();
  const mentionsIngredients = /(ingredient|ingredients|pantry|fridge|on hand|what do you have|have available)/.test(normalized);
  const mentionsCooking = /(cook|cooking|kitchen|stove|oven|prep|equipment|time limit|skill)/.test(normalized);
  const mentionsOrdering = /(order|delivery|takeout|restaurant|pickup|chipotle)/.test(normalized);

  if (mentionsIngredients) {
    return {
      label: 'Share ingredients you have',
      placeholder: 'Ex: eggs, spinach, zucchini, lemon, olive oil',
    };
  }

  if (mentionsCooking && mentionsOrdering) {
    return {
      label: 'Share cook or order details',
      placeholder: 'Ex: can cook 20 min, or delivery near me',
    };
  }

  if (mentionsOrdering) {
    return {
      label: 'Share order preferences',
      placeholder: 'Ex: delivery only, near Chipotle, under $20',
    };
  }

  if (mentionsCooking) {
    return {
      label: 'Share your cooking setup',
      placeholder: 'Ex: 15 min max, stovetop only, beginner',
    };
  }

  if (/(recipe|meal|breakfast|lunch|dinner|snack)/.test(normalized)) {
    return {
      label: 'Type your meal details',
      placeholder: 'Tell GutBrain what sounds good or what to avoid',
    };
  }

  return {
    label: 'Type your own answer',
    placeholder: 'Type your answer...',
  };
};

export const ChatMessage = ({
  role,
  content,
  timestamp,
  isStreaming = false,
  enableChoices = false,
  onChoiceSelect,
  onActionSelect,
  onRecipeActionSelect,
  onShoppingActionSelect,
  onRecipeIngredientsToShoppingSelect,
}: ChatMessageProps) => {
  const isUser = role === 'user';
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const clarifier = isUser ? null : parseGutBrainClarifier(content);
  const coachActions = isUser ? [] : parseCoachActions(content);
  const recipeActions = isUser ? [] : parseGutBrainRecipeActions(content);
  const shoppingActions = isUser ? [] : parseGutBrainShoppingActions(content);
  const displayContent = isUser ? content : getGutBrainDisplayText(content);
  const showInteractiveChoices = Boolean(!isUser && clarifier && !isStreaming && enableChoices && onChoiceSelect);
  const quickActionChips = coachActions.filter((action) => (
    action.type === 'open_shopping'
    || action.type === 'open_normal_today'
    || (action.type === 'open_view' && (
      action.view === 'shopping'
      || action.view === 'recipes'
      || action.view === 'symptoms'
      || (
        action.view === 'help'
        && /support|normal|gutbrain/i.test(action.label.toLowerCase())
      )
    ))
  ));
  const showQuickActionChip = Boolean(!isUser && !isStreaming && quickActionChips.length && onActionSelect);

  const [customInputExpanded, setCustomInputExpanded] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [pendingActionKeys, setPendingActionKeys] = useState<string[]>([]);
  const [completedActionKeys, setCompletedActionKeys] = useState<string[]>([]);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customInputExpanded && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [customInputExpanded]);

  const closeCustomInput = () => {
    setCustomInputExpanded(false);
    setCustomInputText('');
  };

  const handleCustomSubmit = () => {
    if (customInputText.trim() && onChoiceSelect) {
      onChoiceSelect(customInputText.trim());
      closeCustomInput();
    }
  };

  // Extract step indicator from question if present (e.g. "(1 of 2)")
  const stepMatch = clarifier?.question.match(/\((\d+)\s+of\s+(\d+)\)/i);
  const stepInfo = stepMatch ? { current: parseInt(stepMatch[1]), total: parseInt(stepMatch[2]) } : null;
  const cleanQuestion = clarifier?.question.replace(/\s*\(\d+\s+of\s+\d+\)/i, '').trim() || '';
  const freeTextConfig = getFreeTextConfig(cleanQuestion || clarifier?.question || '');
  const hasOtherOption = Boolean(clarifier?.options.some((option) => isOtherOption(option)));

  const renderCustomInputCard = (label: string, key: string) => (
    <div key={key} className="w-full">
      {!customInputExpanded ? (
        <button
          onClick={() => setCustomInputExpanded(true)}
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
          <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-emerald-400 transition-colors" />
        </button>
      ) : (
        <div className={cn(
          'flex items-center gap-2 w-full rounded-xl border px-3 py-2',
          'bg-background/60 backdrop-blur-sm',
          'border-emerald-500/30 ring-1 ring-emerald-500/10',
        )}>
          <input
            ref={customInputRef}
            type="text"
            value={customInputText}
            onChange={(e) => setCustomInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomSubmit();
              if (e.key === 'Escape') closeCustomInput();
            }}
            placeholder={freeTextConfig.placeholder}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customInputText.trim()}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-full transition-colors',
              customInputText.trim()
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-muted/40 text-muted-foreground/30'
            )}
            aria-label="Send custom answer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  const markPendingAction = (key: string) => {
    setPendingActionKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const clearPendingAction = (key: string) => {
    setPendingActionKeys((prev) => prev.filter((entry) => entry !== key));
  };

  const markCompletedAction = (key: string) => {
    setCompletedActionKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const runStructuredAction = (key: string, action: (() => Promise<unknown> | unknown) | undefined) => {
    if (!action || pendingActionKeys.includes(key) || completedActionKeys.includes(key)) {
      return;
    }

    markPendingAction(key);
    Promise.resolve(action())
      .then(() => {
        markCompletedAction(key);
      })
      .finally(() => {
        clearPendingAction(key);
      });
  };

  const renderStructuredActionCards = () => {
    if (isUser || isStreaming || (!recipeActions.length && !shoppingActions.length)) {
      return null;
    }

    return (
      <div className="mb-3 grid w-full gap-2">
        {recipeActions.map((action, index) => {
          const baseKey = `recipe:${action.title.toLowerCase().trim()}:${action.phase ?? ''}:${action.mealType}:${index}`;
          const addKey = `${baseKey}:add`;
          const addIngredientsKey = `${baseKey}:ingredients`;
          const isAddPending = pendingActionKeys.includes(addKey);
          const isAddDone = completedActionKeys.includes(addKey);
          const isIngredientsPending = pendingActionKeys.includes(addIngredientsKey);
          const isIngredientsDone = completedActionKeys.includes(addIngredientsKey);

          return (
            <div
              key={baseKey}
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"
            >
              <p className="text-sm font-semibold text-foreground">{action.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(action.phase ?? 'Protocol phase') + ' · ' + action.mealType.replace(/_/g, ' ')}
              </p>
              {action.summary && (
                <p className="mt-1 text-xs text-muted-foreground">{action.summary}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isAddPending || isAddDone || !onRecipeActionSelect}
                  onClick={() => runStructuredAction(addKey, () => onRecipeActionSelect?.(action))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    isAddDone
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20',
                    (isAddPending || !onRecipeActionSelect) && 'cursor-not-allowed opacity-70',
                  )}
                >
                  {isAddPending ? 'Adding...' : isAddDone ? 'Added to recipes' : 'Add to recipes'}
                </button>
                <button
                  type="button"
                  disabled={isIngredientsPending || isIngredientsDone || !onRecipeIngredientsToShoppingSelect || !action.ingredients.length}
                  onClick={() => runStructuredAction(addIngredientsKey, () => onRecipeIngredientsToShoppingSelect?.(action))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    isIngredientsDone
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'border-primary/30 bg-primary/8 text-primary hover:bg-primary/14',
                    (isIngredientsPending || !onRecipeIngredientsToShoppingSelect || !action.ingredients.length) && 'cursor-not-allowed opacity-70',
                  )}
                >
                  {isIngredientsPending ? 'Adding...' : isIngredientsDone ? 'Ingredients added' : 'Add ingredients to shopping list'}
                </button>
              </div>
            </div>
          );
        })}
        {shoppingActions.map((action, index) => {
          const actionVerb = action.type === 'remove' ? 'Remove from shopping list' : 'Add to shopping list';
          const key = `shopping:${action.type}:${action.category.toLowerCase().trim()}:${action.itemName.toLowerCase().trim()}:${index}`;
          const isPending = pendingActionKeys.includes(key);
          const isDone = completedActionKeys.includes(key);

          return (
            <div key={key} className="rounded-xl border border-primary/15 bg-primary/6 p-3">
              <p className="text-sm font-semibold text-foreground">{action.itemName}</p>
              <p className="mt-1 text-xs text-muted-foreground">{action.category}</p>
              {action.quantity && (
                <p className="mt-1 text-xs text-muted-foreground">Qty: {action.quantity}</p>
              )}
              <div className="mt-2">
                <button
                  type="button"
                  disabled={isPending || isDone || !onShoppingActionSelect}
                  onClick={() => runStructuredAction(key, () => onShoppingActionSelect?.(action))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    isDone
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'border-primary/30 bg-primary/8 text-primary hover:bg-primary/14',
                    (isPending || !onShoppingActionSelect) && 'cursor-not-allowed opacity-70',
                  )}
                >
                  {isPending ? 'Saving...' : isDone ? 'Done' : actionVerb}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-primary' : 'bg-gradient-to-br from-emerald-500/20 to-teal-600/30 ring-1 ring-emerald-500/20'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <GutBrainLogo className="h-4 w-4 rounded-sm" />
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
            {showQuickActionChip && (
              <div className="mb-3 flex flex-wrap gap-2">
                {quickActionChips.map((action, index) => (
                  <button
                    key={`${action.type}-${action.label}-${index}`}
                    onClick={() => onActionSelect?.(action)}
                    className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/14"
                  >
                    {action.label || 'Open in app'}
                  </button>
                ))}
              </div>
            )}
            {renderStructuredActionCards()}
            {/* Choice cards */}
            <div className="grid gap-2 w-full">
              {clarifier.options.map((option, i) => {
                const isOther = isOtherOption(option);
                const optionKey = `${option}-${i}`;

                if (showInteractiveChoices && isOther) {
                  return renderCustomInputCard(freeTextConfig.label, optionKey);
                }

                return showInteractiveChoices ? (
                  <button
                    key={optionKey}
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
                    key={optionKey}
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
              {showInteractiveChoices && !hasOtherOption && renderCustomInputCard(freeTextConfig.label, 'custom-answer')}
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
            {renderStructuredActionCards()}
            {showQuickActionChip && (
              <div className="mt-2 flex flex-wrap gap-2">
                {quickActionChips.map((action, index) => (
                  <button
                    key={`${action.type}-${action.label}-${index}`}
                    onClick={() => onActionSelect?.(action)}
                    className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/14"
                  >
                    {action.label || 'Open in app'}
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
