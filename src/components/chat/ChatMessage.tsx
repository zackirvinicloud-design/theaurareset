import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, PenLine, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GutBrainLogo } from '@/components/brand/GutBrainLogo';
import {
  buildLegacyGutBrainTurnPayload,
  getGutBrainDisplayText,
  type CoachAction,
  type GutBrainRecipeAction,
  type GutBrainRecipeCard,
  type GutBrainShoppingAction,
  type GutBrainTurnPayload,
} from '@/lib/gutbrain';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  assistantPayload?: GutBrainTurnPayload | null;
  timestamp: number;
  isStreaming?: boolean;
  enableChoices?: boolean;
  onChoiceSelect?: (choice: string) => void;
  onActionSelect?: (action: CoachAction) => void;
  onRecipeActionSelect?: (action: GutBrainRecipeAction) => Promise<unknown> | unknown;
  onRecipeOpenSelect?: (recipe: GutBrainRecipeCard) => void;
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

const recipeCardKey = (card: GutBrainRecipeCard, index: number) => (
  `recipe:${card.title.toLowerCase().trim()}:${card.phase ?? ''}:${card.mealType}:${card.status}:${index}`
);

const shoppingActionKey = (action: GutBrainShoppingAction, index: number) => (
  `shopping:${action.type}:${action.category.toLowerCase().trim()}:${action.itemName.toLowerCase().trim()}:${index}`
);

export const ChatMessage = ({
  role,
  content,
  assistantPayload = null,
  timestamp,
  isStreaming = false,
  enableChoices = false,
  onChoiceSelect,
  onActionSelect,
  onRecipeActionSelect,
  onRecipeOpenSelect,
  onShoppingActionSelect,
  onRecipeIngredientsToShoppingSelect,
}: ChatMessageProps) => {
  const isUser = role === 'user';
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const turnPayload = !isUser
    ? (assistantPayload ?? buildLegacyGutBrainTurnPayload(content))
    : null;
  const displayContent = isUser
    ? content
    : (turnPayload?.replyText || getGutBrainDisplayText(content));
  const clarifier = !isUser ? turnPayload?.clarifier ?? null : null;
  const coachActions = !isUser ? turnPayload?.coachActions ?? [] : [];
  const recipeCards = !isUser ? turnPayload?.recipeCards ?? [] : [];
  const shoppingActions = !isUser ? turnPayload?.shoppingActions ?? [] : [];
  const showInteractiveChoices = Boolean(!isUser && clarifier && !isStreaming && enableChoices && onChoiceSelect);
  const coachActionsForDisplay = coachActions.filter((action) => action.type === 'set_reminder');
  const showCoachActions = Boolean(!isUser && !isStreaming && coachActionsForDisplay.length && onActionSelect);

  const [customInputExpanded, setCustomInputExpanded] = useState(false);
  const [customInputText, setCustomInputText] = useState('');
  const [pendingActionKeys, setPendingActionKeys] = useState<string[]>([]);
  const [completedActionKeys, setCompletedActionKeys] = useState<string[]>([]);
  const [activeRecipeCardIndex, setActiveRecipeCardIndex] = useState(0);
  const [activeShoppingCardIndex, setActiveShoppingCardIndex] = useState(0);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customInputExpanded && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [customInputExpanded]);

  useEffect(() => {
    setActiveRecipeCardIndex((prev) => {
      if (!recipeCards.length) {
        return 0;
      }
      return Math.min(prev, recipeCards.length - 1);
    });
  }, [recipeCards.length]);

  useEffect(() => {
    setActiveShoppingCardIndex((prev) => {
      if (!shoppingActions.length) {
        return 0;
      }
      return Math.min(prev, shoppingActions.length - 1);
    });
  }, [shoppingActions.length]);

  useEffect(() => {
    setCustomInputExpanded(false);
    setCustomInputText('');
  }, [timestamp, clarifier?.question]);

  const closeCustomInput = () => {
    setCustomInputExpanded(false);
    setCustomInputText('');
  };

  const cleanQuestion = clarifier?.question.replace(/\s*\(\d+\s+of\s+\d+\)/i, '').trim() || '';
  const clarifierQuestion = cleanQuestion || clarifier?.question || '';
  const clarifierOptions = clarifier?.options ?? [];
  const freeTextConfig = getFreeTextConfig(clarifierQuestion);
  const hasOtherOption = Boolean(clarifierOptions.some((option) => isOtherOption(option)));

  const submitClarifierChoice = (choice: string) => {
    if (!onChoiceSelect) {
      return;
    }

    const safeChoice = choice.trim();
    if (!safeChoice) {
      return;
    }

    onChoiceSelect(safeChoice);
    closeCustomInput();
  };

  const handleCustomSubmit = () => {
    if (!customInputText.trim()) {
      return;
    }
    submitClarifierChoice(customInputText.trim());
  };

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

  const renderCustomInputCard = (label: string, key: string) => (
    <div key={key} className="w-full">
      {!customInputExpanded ? (
        <button
          type="button"
          onClick={() => setCustomInputExpanded(true)}
          className={cn(
            'group relative flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm',
            'bg-background/40 backdrop-blur-sm',
            'border-dashed border-border/50 hover:border-emerald-500/30',
            'hover:bg-emerald-500/5',
            'transition-all duration-200 ease-out',
          )}
        >
          <span className={cn(
            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
            'bg-muted/60 text-muted-foreground',
            'group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors',
          )}>
            <PenLine className="h-3 w-3" />
          </span>
          <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-emerald-400 transition-colors" />
        </button>
      ) : (
        <div className={cn(
          'flex w-full items-center gap-2 rounded-xl border px-3 py-2',
          'bg-background/60 backdrop-blur-sm',
          'border-emerald-500/30 ring-1 ring-emerald-500/10',
        )}>
          <input
            ref={customInputRef}
            type="text"
            value={customInputText}
            onChange={(event) => setCustomInputText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleCustomSubmit();
              if (event.key === 'Escape') closeCustomInput();
            }}
            placeholder={freeTextConfig.placeholder}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            disabled={!customInputText.trim()}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
              customInputText.trim()
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-muted/40 text-muted-foreground/30',
            )}
            aria-label="Send custom answer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  const renderCarouselControls = (
    total: number,
    activeIndex: number,
    onPrev: () => void,
    onNext: () => void,
  ) => {
    if (total <= 1) {
      return null;
    }

    return (
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Swipe cards
        </p>
        <div className="flex items-center gap-2">
          <span className="min-w-[3ch] text-right text-[11px] font-medium text-muted-foreground">
            {activeIndex + 1}/{total}
          </span>
          <button
            type="button"
            onClick={onPrev}
            disabled={activeIndex <= 0}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
              activeIndex <= 0
                ? 'cursor-not-allowed border-border/40 text-muted-foreground/40'
                : 'border-primary/25 bg-primary/8 text-primary hover:bg-primary/14',
            )}
            aria-label="Previous card"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={activeIndex >= total - 1}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
              activeIndex >= total - 1
                ? 'cursor-not-allowed border-border/40 text-muted-foreground/40'
                : 'border-primary/25 bg-primary/8 text-primary hover:bg-primary/14',
            )}
            aria-label="Next card"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderRecipeCards = () => {
    if (isUser || isStreaming || !recipeCards.length) {
      return null;
    }

    const safeIndex = Math.min(activeRecipeCardIndex, recipeCards.length - 1);
    const card = recipeCards[safeIndex];
    if (!card) {
      return null;
    }

    const baseKey = recipeCardKey(card, safeIndex);
    const addKey = `${baseKey}:add`;
    const addIngredientsKey = `${baseKey}:ingredients`;
    const isAddPending = pendingActionKeys.includes(addKey);
    const isAddDone = completedActionKeys.includes(addKey);
    const isIngredientsPending = pendingActionKeys.includes(addIngredientsKey);
    const isIngredientsDone = completedActionKeys.includes(addIngredientsKey);
    const isExisting = card.status === 'existing';
    const canAddRecipe = !isExisting && Boolean(onRecipeActionSelect);
    const canAddIngredients = !isExisting && Boolean(onRecipeIngredientsToShoppingSelect) && card.ingredients.length > 0;
    const canOpenRecipe = isExisting && Boolean(onRecipeOpenSelect);

    return (
      <div className="mt-3 w-full max-w-[34rem]">
        {renderCarouselControls(
          recipeCards.length,
          safeIndex,
          () => setActiveRecipeCardIndex((prev) => Math.max(prev - 1, 0)),
          () => setActiveRecipeCardIndex((prev) => Math.min(prev + 1, recipeCards.length - 1)),
        )}
        <div
          key={baseKey}
          className={cn(
            'rounded-2xl border p-3 shadow-sm backdrop-blur-sm transition-all duration-200',
            isExisting ? 'border-border/55 bg-card/80' : 'border-emerald-500/25 bg-emerald-500/7',
          )}
        >
          <p className="text-sm font-semibold text-foreground">{card.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {(card.phase ?? 'Protocol phase') + ' · ' + card.mealType.replace(/_/g, ' ')}
          </p>
          {card.summary && (
            <p className="mt-1 text-xs text-muted-foreground">{card.summary}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={(!isExisting && (isAddPending || isAddDone || !canAddRecipe)) || (isExisting && !canOpenRecipe)}
              onClick={() => {
                if (isExisting) {
                  onRecipeOpenSelect?.(card);
                  return;
                }
                runStructuredAction(addKey, () => onRecipeActionSelect?.(card));
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isExisting
                  ? 'border-primary/25 bg-primary/8 text-primary hover:bg-primary/14'
                  : isAddDone
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20',
                ((!isExisting && (isAddPending || !canAddRecipe)) || (isExisting && !canOpenRecipe)) && 'cursor-not-allowed opacity-70',
              )}
            >
              {isExisting ? 'Open in recipes' : isAddPending ? 'Adding...' : isAddDone ? 'Added to recipes' : 'Add to recipes'}
            </button>
            {!isExisting && (
              <button
                type="button"
                disabled={isIngredientsPending || isIngredientsDone || !canAddIngredients}
                onClick={() => runStructuredAction(addIngredientsKey, () => onRecipeIngredientsToShoppingSelect?.(card))}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  isIngredientsDone
                    ? 'border-primary/40 bg-primary/15 text-primary'
                    : 'border-primary/30 bg-primary/8 text-primary hover:bg-primary/14',
                  (isIngredientsPending || !canAddIngredients) && 'cursor-not-allowed opacity-70',
                )}
              >
                {isIngredientsPending ? 'Adding...' : isIngredientsDone ? 'Ingredients added' : 'Add ingredients to shopping list'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderShoppingCards = () => {
    if (isUser || isStreaming || !shoppingActions.length) {
      return null;
    }

    const safeIndex = Math.min(activeShoppingCardIndex, shoppingActions.length - 1);
    const action = shoppingActions[safeIndex];
    if (!action) {
      return null;
    }

    const key = shoppingActionKey(action, safeIndex);
    const isPending = pendingActionKeys.includes(key);
    const isDone = completedActionKeys.includes(key);
    const actionVerb = action.type === 'remove' ? 'Remove from shopping list' : 'Add to shopping list';

    return (
      <div className="mt-3 w-full max-w-[34rem]">
        {renderCarouselControls(
          shoppingActions.length,
          safeIndex,
          () => setActiveShoppingCardIndex((prev) => Math.max(prev - 1, 0)),
          () => setActiveShoppingCardIndex((prev) => Math.min(prev + 1, shoppingActions.length - 1)),
        )}
        <div className="rounded-2xl border border-primary/18 bg-primary/7 p-3 shadow-sm backdrop-blur-sm">
          <p className="text-sm font-semibold text-foreground">{action.itemName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{action.category}</p>
          {action.quantity && (
            <p className="mt-1 text-xs text-muted-foreground">Qty: {action.quantity}</p>
          )}
          <div className="mt-3">
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
      </div>
    );
  };

  const renderClarifier = () => {
    if (isUser || isStreaming || !clarifier) {
      return null;
    }

    return (
      <div className="mt-3 w-full max-w-[34rem]">
        <div className="mb-3 rounded-2xl border border-border/50 bg-card/70 px-4 py-3 shadow-sm backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Pick your path
          </p>
          <p className="mt-1 text-sm font-medium leading-6 text-foreground">
            {clarifierQuestion}
          </p>
        </div>
        <div className="grid w-full gap-2">
          {clarifierOptions.map((option, index) => {
            const isOther = isOtherOption(option);
            const optionKey = `${option}-${index}`;

            if (showInteractiveChoices && isOther) {
              return renderCustomInputCard(freeTextConfig.label, optionKey);
            }

            return showInteractiveChoices ? (
              <button
                key={optionKey}
                type="button"
                onClick={() => submitClarifierChoice(option)}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm',
                  'bg-card/78 backdrop-blur-sm shadow-sm',
                  'border-border/60 hover:border-emerald-500/35',
                  'hover:bg-emerald-500/6',
                  'transition-all duration-200 ease-out',
                  'active:scale-[0.98]',
                )}
              >
                <span className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
                  'group-hover:bg-emerald-500/20 group-hover:ring-emerald-500/40 transition-colors',
                )}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 font-medium">{option}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-400 transition-colors" />
              </button>
            ) : (
              <div
                key={optionKey}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm',
                  isOther && 'border-dashed',
                )}
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  {isOther ? <PenLine className="h-3 w-3" /> : String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-muted-foreground">{option}</span>
              </div>
            );
          })}
          {showInteractiveChoices && !hasOtherOption && renderCustomInputCard(freeTextConfig.label, 'custom-answer')}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('mb-4 flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary' : 'bg-gradient-to-br from-emerald-500/20 to-teal-600/30 ring-1 ring-emerald-500/20',
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <GutBrainLogo className="h-4 w-4 rounded-sm" />
        )}
      </div>

      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start', !isUser && 'max-w-[90%]')}>
        {displayContent && (
          <div
            className={cn(
              'max-w-[88%] rounded-[1.35rem] px-4 py-3 shadow-sm backdrop-blur-sm',
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'border border-border/50 bg-card/78 text-foreground',
            )}
          >
            <p className="text-sm leading-6 whitespace-pre-wrap break-words">{displayContent}</p>
          </div>
        )}

        {showCoachActions && (
          <div className="mt-2 flex flex-wrap gap-2">
            {coachActionsForDisplay.map((action, index) => (
              <button
                key={`${action.type}-${action.label}-${index}`}
                type="button"
                onClick={() => onActionSelect?.(action)}
                className="rounded-full border border-primary/20 bg-primary/7 px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-primary/14"
              >
                {action.label || 'Open in app'}
              </button>
            ))}
          </div>
        )}

        {renderRecipeCards()}
        {renderShoppingCards()}
        {renderClarifier()}
        <span className="mt-1 text-xs text-muted-foreground">{time}</span>
      </div>
    </div>
  );
};
