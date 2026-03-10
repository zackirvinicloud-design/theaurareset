import { useState } from 'react';
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
}

type PhaseStatus = 'current' | 'next' | 'later' | 'reference';

const STATUS_STYLES: Record<PhaseStatus, string> = {
    current: 'bg-primary/10 text-primary border-primary/20',
    next: 'bg-sky-100 text-sky-700 border-sky-200',
    later: 'bg-muted text-muted-foreground border-border/60',
    reference: 'bg-muted text-muted-foreground border-border/60',
};

const STATUS_LABELS: Record<PhaseStatus, string> = {
    current: 'Shop now',
    next: 'Next up',
    later: 'Later',
    reference: 'Reference',
};

interface ShoppingReferenceContentProps {
    currentDay: number;
    checklist: ChecklistState;
    onToggle: (key: string) => void;
}

export function ShoppingListView({
    currentDay,
    checklist,
    onToggle,
    onBack,
    onAskAI,
}: ShoppingListViewProps) {
    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-shrink-0 border-b border-border/50 px-6 py-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            Full Shopping List
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            One list for the entire protocol. Buy from the sections marked shop now, and use the rest as reference until you get there.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={() => onAskAI(
                            "Help me simplify this full protocol shopping list. Tell me what I should buy now, what can wait until later phases, and where I can choose one product instead of buying everything."
                        )}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Simplify this list
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={() => onAskAI(
                            "Give me a budget-friendly shopping plan for this protocol. Keep the must-have items, point out optional ones, and flag any one-or-the-other choices so I do not overbuy."
                        )}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        Budget version
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="px-6 py-4">
                    <ShoppingReferenceContent
                        currentDay={currentDay}
                        checklist={checklist}
                        onToggle={onToggle}
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
}: ShoppingReferenceContentProps) {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    const allShopKeys = SHOPPING_LIST.flatMap((phase) =>
        phase.categories.flatMap((category) =>
            category.items.map((_, index) => buildShopKey(phase.phase, category.category, index))
        )
    );
    const checkedCount = allShopKeys.filter((key) => checklist[key]).length;
    const totalCount = allShopKeys.length;
    const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    const toggleCategory = (key: string) => {
        setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6">
            <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <p className="text-xs text-muted-foreground">
                {checkedCount} of {totalCount} items checked
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed">
                Use the phase badges to see what to buy now versus later.
            </p>

            <div className="space-y-6">
                {SHOPPING_LIST.map((phase) => (
                    <PhaseSection
                        key={phase.phase}
                        phase={phase}
                        phaseStatus={getPhaseStatus(currentDay, phase.phase)}
                        checklist={checklist}
                        onToggle={onToggle}
                        expandedCategories={expandedCategories}
                        onToggleCategory={toggleCategory}
                    />
                ))}
            </div>
        </div>
    );
}

function PhaseSection({
    phase,
    phaseStatus,
    checklist,
    onToggle,
    expandedCategories,
    onToggleCategory,
}: {
    phase: ShoppingPhase;
    phaseStatus: PhaseStatus;
    checklist: ChecklistState;
    onToggle: (key: string) => void;
    expandedCategories: Record<string, boolean>;
    onToggleCategory: (key: string) => void;
}) {
    const phaseKeys = phase.categories.flatMap((category) =>
        category.items.map((_, index) => buildShopKey(phase.phase, category.category, index))
    );
    const phaseChecked = phaseKeys.filter((key) => checklist[key]).length;

    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm">{phase.emoji}</span>
                <h3 className="text-sm font-bold text-foreground">{phase.phase}</h3>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    {phase.buyBefore}
                </span>
                <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full border',
                    STATUS_STYLES[phaseStatus]
                )}>
                    {STATUS_LABELS[phaseStatus]}
                </span>
                <span className={cn(
                    'text-[11px] font-mono ml-auto',
                    phaseChecked === phaseKeys.length ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}>
                    {phaseChecked}/{phaseKeys.length}
                </span>
            </div>

            <div className="space-y-2">
                {phase.categories.map((category) => {
                    const categoryKey = `${phase.phase}_${category.category}`;
                    const isExpanded = expandedCategories[categoryKey] ?? false;
                    const categoryItemKeys = category.items.map((_, index) => buildShopKey(phase.phase, category.category, index));
                    const categoryChecked = categoryItemKeys.filter((key) => checklist[key]).length;
                    const allDone = categoryChecked === category.items.length;

                    return (
                        <div
                            key={categoryKey}
                            className={cn(
                                'rounded-xl border transition-all',
                                allDone ? 'border-primary/20 bg-primary/5' : 'border-border/50 bg-card'
                            )}
                        >
                            <button
                                onClick={() => onToggleCategory(categoryKey)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-xl"
                            >
                                <span className="text-sm">{category.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-foreground">{category.category}</span>
                                        {hasChoiceLanguage(category) && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                                                choose carefully
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className={cn(
                                    'text-xs font-mono',
                                    allDone ? 'text-primary' : 'text-muted-foreground'
                                )}>
                                    {categoryChecked}/{category.items.length}
                                </span>
                                <ChevronDown className={cn(
                                    'w-4 h-4 text-muted-foreground transition-transform duration-200',
                                    isExpanded && 'rotate-180'
                                )} />
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        {category.guidance && (
                                            <div className="mx-3 mb-3 rounded-lg border border-sky-200/70 bg-sky-50 px-3 py-2 text-xs text-sky-800 leading-relaxed">
                                                {category.guidance}
                                            </div>
                                        )}

                                        <div className="px-3 pb-3 space-y-0.5">
                                            {category.items.map((item, index) => {
                                                const shopKey = buildShopKey(phase.phase, category.category, index);
                                                const checked = !!checklist[shopKey];
                                                const meta = getItemMeta(item);

                                                return (
                                                    <motion.button
                                                        key={shopKey}
                                                        onClick={() => onToggle(shopKey)}
                                                        className={cn(
                                                            'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all group',
                                                            checked ? 'bg-primary/5' : 'hover:bg-muted/40'
                                                        )}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        {checked ? (
                                                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0 mt-0.5 transition-colors" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className={cn(
                                                                    'text-sm',
                                                                    checked ? 'line-through text-muted-foreground' : 'text-foreground'
                                                                )}>
                                                                    {item.name}
                                                                </span>
                                                                <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex-shrink-0">
                                                                    {item.quantity}
                                                                </span>
                                                                {meta && (
                                                                    <span className={cn(
                                                                        'text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                                                                        meta.className
                                                                    )}>
                                                                        {meta.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {item.notes && (
                                                                <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">
                                                                    {item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </motion.button>
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
        </section>
    );
}

function buildShopKey(phase: string, category: string, index: number) {
    return `shop_${phase}_${category}_${index}`;
}

function hasChoiceLanguage(category: ShoppingCategory) {
    return category.category.toLowerCase().includes('pick') || Boolean(category.guidance);
}

function getItemMeta(item: ShoppingItem) {
    if (item.optional === 'alternative') {
        return {
            label: 'Alternative',
            className: 'bg-sky-100 text-sky-700',
        };
    }

    if (item.optional === 'optional') {
        return {
            label: 'Optional',
            className: 'bg-amber-100 text-amber-700',
        };
    }

    return null;
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
