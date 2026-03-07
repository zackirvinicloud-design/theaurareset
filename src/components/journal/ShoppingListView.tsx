import { useState } from 'react';
import { SHOPPING_LIST, ShoppingPhase } from '@/hooks/useProtocolData';
import { ChecklistState } from '@/hooks/useJournalStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Circle, ChevronDown, ShoppingCart,
    ArrowLeft, Sparkles, DollarSign
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

// Phase shopping windows — only show the phase(s) you need to buy RIGHT NOW
// Day 0-4: Foundation + Fungal (initial setup)
// Day 5-11: Parasite Elimination only (new purchases)
// Day 12+: Heavy Metal Detox only (new purchases)
const PHASE_WINDOWS: { phases: string[]; minDay: number; maxDay: number }[] = [
    { phases: ['Foundation', 'Fungal Elimination'], minDay: 0, maxDay: 4 },
    { phases: ['Parasite Elimination'], minDay: 5, maxDay: 11 },
    { phases: ['Heavy Metal Detox'], minDay: 12, maxDay: 999 },
];

export function ShoppingListView({
    currentDay,
    checklist,
    onToggle,
    onBack,
    onAskAI,
}: ShoppingListViewProps) {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    // Find which shopping window we're in
    const currentWindow = PHASE_WINDOWS.find(w => currentDay >= w.minDay && currentDay <= w.maxDay)
        ?? PHASE_WINDOWS[0];
    const visiblePhases = SHOPPING_LIST.filter(p => currentWindow.phases.includes(p.phase));

    // Count totals
    const allShopKeys = visiblePhases.flatMap(p =>
        p.categories.flatMap(c =>
            c.items.map((_, i) => `shop_${p.phase}_${c.category}_${i}`)
        )
    );
    const checkedCount = allShopKeys.filter(k => checklist[k]).length;
    const totalCount = allShopKeys.length;
    const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    const toggleCategory = (key: string) => {
        setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
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
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            Shopping List
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {checkedCount} of {totalCount} items checked · {progress}% complete
                        </p>
                        <p className="text-xs text-primary/80 mt-1 font-medium">
                            {currentDay <= 4
                                ? "🗓️ Buy anytime before Day 1 · These will be needed starting Day 1"
                                : currentDay <= 11
                                    ? `🗓️ Buy anytime between Day ${currentDay}–7 · These will be needed starting Day 8`
                                    : `🗓️ Buy anytime between Day ${currentDay}–14 · These will be needed starting Day 15`
                            }
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* AI assistance buttons */}
                <div className="flex gap-2 mt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={() => onAskAI(
                            "Help me create a budget-friendly version of my shopping list. What items are absolutely essential vs. nice-to-have? I want to prioritize what gives me the most impact for my money."
                        )}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        Budget-friendly version
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={() => onAskAI(
                            "What are the absolute must-buy items from my shopping list that I cannot skip? And which items are optional or have cheaper alternatives?"
                        )}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        What's essential?
                    </Button>
                </div>
            </div>

            {/* Shopping list body */}
            <ScrollArea className="flex-1">
                <div className="px-6 py-4 space-y-6">
                    {visiblePhases.map((phase) => (
                        <PhaseSection
                            key={phase.phase}
                            phase={phase}
                            checklist={checklist}
                            onToggle={onToggle}
                            expandedCategories={expandedCategories}
                            onToggleCategory={toggleCategory}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}

function PhaseSection({
    phase,
    checklist,
    onToggle,
    expandedCategories,
    onToggleCategory,
}: {
    phase: ShoppingPhase;
    checklist: ChecklistState;
    onToggle: (key: string) => void;
    expandedCategories: Record<string, boolean>;
    onToggleCategory: (key: string) => void;
}) {
    // Phase totals
    const phaseKeys = phase.categories.flatMap(c =>
        c.items.map((_, i) => `shop_${phase.phase}_${c.category}_${i}`)
    );
    const phaseChecked = phaseKeys.filter(k => checklist[k]).length;

    return (
        <div>
            {/* Phase header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">{phase.emoji}</span>
                <h3 className="text-sm font-bold text-foreground">{phase.phase}</h3>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    {phase.buyBefore}
                </span>
                <span className={cn(
                    "text-[11px] font-mono ml-auto",
                    phaseChecked === phaseKeys.length ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                    {phaseChecked}/{phaseKeys.length}
                </span>
            </div>

            {/* Categories */}
            <div className="space-y-2">
                {phase.categories.map((cat) => {
                    const catKey = `${phase.phase}_${cat.category}`;
                    const isExpanded = expandedCategories[catKey] ?? true; // default open
                    const catItemKeys = cat.items.map((_, i) => `shop_${phase.phase}_${cat.category}_${i}`);
                    const catChecked = catItemKeys.filter(k => checklist[k]).length;
                    const allDone = catChecked === cat.items.length;

                    return (
                        <div key={catKey} className={cn(
                            "rounded-xl border transition-all",
                            allDone ? "border-primary/20 bg-primary/5" : "border-border/50 bg-card"
                        )}>
                            {/* Category header */}
                            <button
                                onClick={() => onToggleCategory(catKey)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/30 transition-colors rounded-xl"
                            >
                                <span className="text-sm">{cat.emoji}</span>
                                <span className="text-sm font-semibold text-foreground flex-1">{cat.category}</span>
                                <span className={cn(
                                    "text-xs font-mono",
                                    allDone ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {catChecked}/{cat.items.length}
                                </span>
                                <ChevronDown className={cn(
                                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                                    isExpanded && "rotate-180"
                                )} />
                            </button>

                            {/* Items */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-3 pb-3 space-y-0.5">
                                            {cat.items.map((item, i) => {
                                                const shopKey = `shop_${phase.phase}_${cat.category}_${i}`;
                                                const checked = !!checklist[shopKey];
                                                return (
                                                    <motion.button
                                                        key={shopKey}
                                                        onClick={() => onToggle(shopKey)}
                                                        className={cn(
                                                            "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all group",
                                                            checked ? "bg-primary/5" : "hover:bg-muted/40"
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
                                                                    "text-sm",
                                                                    checked ? "line-through text-muted-foreground" : "text-foreground"
                                                                )}>
                                                                    {item.name}
                                                                </span>
                                                                <span className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex-shrink-0">
                                                                    {item.quantity}
                                                                </span>
                                                                {item.optional && (
                                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                                                        {item.optional}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {item.notes && (
                                                                <p className="text-xs text-muted-foreground/60 mt-0.5">{item.notes}</p>
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
        </div>
    );
}
