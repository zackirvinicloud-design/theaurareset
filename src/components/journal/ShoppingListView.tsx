import { useState, useMemo } from 'react';
import { SHOPPING_LIST, ShoppingCategory, ShoppingItem, ShoppingPhase } from '@/hooks/useProtocolData';
import { ChecklistState } from '@/hooks/useJournalStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    Circle,
    DollarSign,
    ShoppingCart,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShoppingListViewProps {
    currentDay: number;
    checklist: ChecklistState;
    onToggle: (key: string) => void;
    onBack: () => void;
    onAskAI: (prompt: string) => void;
    defaultExpandedCategories?: string[];
}

type PhaseStatus = 'current' | 'next' | 'later' | 'reference';

interface ShoppingReferenceContentProps {
    currentDay: number;
    checklist: ChecklistState;
    onToggle: (key: string) => void;
    defaultExpandedCategories?: string[];
}

export function ShoppingListView({
    currentDay,
    checklist,
    onToggle,
    onBack,
    onAskAI,
    defaultExpandedCategories,
}: ShoppingListViewProps) {
    const allShopKeys = useMemo(() => SHOPPING_LIST.flatMap((phase) =>
        phase.categories.flatMap((category) =>
            category.items.map((_, index) => buildShopKey(phase.phase, category.category, index))
        )
    ), []);
    const checkedCount = allShopKeys.filter((key) => checklist[key]).length;
    const totalCount = allShopKeys.length;
    const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Clean header */}
            <div className="flex-shrink-0 border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-8 w-8 flex-shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold">Shopping List</h2>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {checkedCount}/{totalCount}
                    </span>
                </div>

                {/* Slim progress bar */}
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* AI shortcuts — compact pills */}
                <div className="flex gap-2 mt-2.5">
                    <button
                        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => onAskAI(
                            "Help me simplify this full protocol shopping list. Tell me what I should buy now, what can wait until later phases, and where I can choose one product instead of buying everything."
                        )}
                    >
                        <Sparkles className="w-3 h-3" />
                        Simplify
                    </button>
                    <span className="text-border">·</span>
                    <button
                        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => onAskAI(
                            "Give me a budget-friendly shopping plan for this protocol. Keep the must-have items, point out optional ones, and flag any one-or-the-other choices so I do not overbuy."
                        )}
                    >
                        <DollarSign className="w-3 h-3" />
                        Budget mode
                    </button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="px-4 py-4">
                    <ShoppingReferenceContent
                        currentDay={currentDay}
                        checklist={checklist}
                        onToggle={onToggle}
                        defaultExpandedCategories={defaultExpandedCategories}
                    />
                </div>
            </ScrollArea>
        </div>
    );
}

export function ShoppingReferenceContent({
    currentDay,
    checklist,
    onToggle,
    defaultExpandedCategories = [],
}: ShoppingReferenceContentProps) {
    // Auto-expand: "Shop now" phase categories are open by default
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
        const defaults: Record<string, boolean> = {};
        defaultExpandedCategories.forEach((key) => { defaults[key] = true; });

        // Auto-expand "Shop now" categories
        SHOPPING_LIST.forEach((phase) => {
            const status = getPhaseStatus(currentDay, phase.phase);
            if (status === 'current') {
                phase.categories.forEach((cat) => {
                    defaults[`${phase.phase}_${cat.category}`] = true;
                });
            }
        });

        return defaults;
    });

    // Track which phases are expanded (later/reference phases start collapsed)
    const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(() => {
        const defaults: Record<string, boolean> = {};
        SHOPPING_LIST.forEach((phase) => {
            const status = getPhaseStatus(currentDay, phase.phase);
            defaults[phase.phase] = status === 'current' || status === 'next';
        });
        return defaults;
    });

    const toggleCategory = (key: string) => {
        setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const togglePhase = (phaseName: string) => {
        setExpandedPhases((prev) => ({ ...prev, [phaseName]: !prev[phaseName] }));
    };

    return (
        <div className="space-y-4">
            {SHOPPING_LIST.map((phase) => {
                const phaseStatus = getPhaseStatus(currentDay, phase.phase);
                const isPhaseExpanded = expandedPhases[phase.phase] ?? false;
                const phaseKeys = phase.categories.flatMap((category) =>
                    category.items.map((_, index) => buildShopKey(phase.phase, category.category, index))
                );
                const phaseChecked = phaseKeys.filter((key) => checklist[key]).length;

                return (
                    <section key={phase.phase} className="space-y-2">
                        {/* Phase header — cleaner, clickable to expand/collapse */}
                        <button
                            onClick={() => togglePhase(phase.phase)}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all',
                                phaseStatus === 'current' && 'bg-primary/8 border border-primary/20',
                                phaseStatus === 'next' && 'bg-muted/50 border border-border/50',
                                (phaseStatus === 'later' || phaseStatus === 'reference') && 'bg-muted/30 border border-border/30',
                            )}
                        >
                            <span className="text-base">{phase.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">{phase.phase}</span>
                                    {phaseStatus === 'current' && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                                            Buy now
                                        </span>
                                    )}
                                    {phaseStatus === 'next' && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                            Up next
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className={cn(
                                'text-[11px] tabular-nums',
                                phaseChecked === phaseKeys.length && phaseKeys.length > 0
                                    ? 'text-primary font-semibold'
                                    : 'text-muted-foreground'
                            )}>
                                {phaseChecked}/{phaseKeys.length}
                            </span>
                            <ChevronDown className={cn(
                                'w-3.5 h-3.5 text-muted-foreground transition-transform',
                                isPhaseExpanded && 'rotate-180'
                            )} />
                        </button>

                        {/* Phase content */}
                        <AnimatePresence>
                            {isPhaseExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2 pl-1">
                                        {phase.categories.map((category) => {
                                            const categoryKey = `${phase.phase}_${category.category}`;
                                            const isExpanded = expandedCategories[categoryKey] ?? false;
                                            const categoryItemKeys = category.items.map((_, index) =>
                                                buildShopKey(phase.phase, category.category, index)
                                            );
                                            const categoryChecked = categoryItemKeys.filter((key) => checklist[key]).length;
                                            const allDone = categoryChecked === category.items.length;

                                            return (
                                                <div
                                                    key={categoryKey}
                                                    className={cn(
                                                        'rounded-lg border transition-all',
                                                        allDone
                                                            ? 'border-primary/20 bg-primary/5'
                                                            : 'border-border/40 bg-card/50'
                                                    )}
                                                >
                                                    <button
                                                        onClick={() => toggleCategory(categoryKey)}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/20 transition-colors rounded-lg"
                                                    >
                                                        <span className="text-sm">{category.emoji}</span>
                                                        <span className="flex-1 text-[13px] font-medium text-foreground">{category.category}</span>
                                                        <span className={cn(
                                                            'text-[11px] tabular-nums',
                                                            allDone ? 'text-primary' : 'text-muted-foreground'
                                                        )}>
                                                            {categoryChecked}/{category.items.length}
                                                        </span>
                                                        <ChevronDown className={cn(
                                                            'w-3.5 h-3.5 text-muted-foreground transition-transform',
                                                            isExpanded && 'rotate-180'
                                                        )} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.15 }}
                                                                className="overflow-hidden"
                                                            >
                                                                {/* Guidance — subtle inline hint */}
                                                                {category.guidance && (
                                                                    <p className="mx-3 mb-2 text-[11px] text-muted-foreground leading-relaxed italic">
                                                                        💡 {category.guidance}
                                                                    </p>
                                                                )}

                                                                <div className="px-2 pb-2 space-y-px">
                                                                    {category.items.map((item, index) => {
                                                                        const shopKey = buildShopKey(phase.phase, category.category, index);
                                                                        const checked = !!checklist[shopKey];

                                                                        return (
                                                                            <button
                                                                                key={shopKey}
                                                                                onClick={() => onToggle(shopKey)}
                                                                                className={cn(
                                                                                    'w-full flex items-start gap-2.5 px-2 py-2 rounded-md text-left transition-all group',
                                                                                    checked ? 'opacity-50' : 'hover:bg-muted/30'
                                                                                )}
                                                                            >
                                                                                {checked ? (
                                                                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                                                                ) : (
                                                                                    <Circle className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0 mt-0.5 transition-colors" />
                                                                                )}
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-baseline gap-2 flex-wrap">
                                                                                        <span className={cn(
                                                                                            'text-[13px]',
                                                                                            checked ? 'line-through text-muted-foreground' : 'text-foreground'
                                                                                        )}>
                                                                                            {item.name}
                                                                                        </span>
                                                                                        <span className="text-[10px] text-muted-foreground">{item.quantity}</span>
                                                                                        {item.optional && (
                                                                                            <span className={cn(
                                                                                                'text-[9px] px-1.5 py-0 rounded-full font-medium',
                                                                                                item.optional === 'alternative'
                                                                                                    ? 'bg-muted text-muted-foreground'
                                                                                                    : 'bg-muted text-muted-foreground'
                                                                                            )}>
                                                                                                {item.optional === 'alternative' ? 'or' : 'optional'}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {item.notes && !checked && (
                                                                                        <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-relaxed">
                                                                                            {item.notes}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                );
            })}
        </div>
    );
}

function buildShopKey(phase: string, category: string, index: number) {
    return `shop_${phase}_${category}_${index}`;
}

function getPhaseStatus(currentDay: number, phaseName: string): PhaseStatus {
    if (phaseName === 'Foundation' || phaseName === 'Fungal Elimination') {
        return currentDay <= 4 ? 'current' : 'reference';
    }

    if (phaseName === 'Parasite Elimination') {
        if (currentDay <= 4) return 'next';
        if (currentDay <= 11) return 'current';
        return 'reference';
    }

    if (currentDay <= 4) return 'later';
    if (currentDay <= 11) return 'next';
    return 'current';
}
