import { useEffect, useMemo, useRef, useState } from 'react';
import {
    buildShopKey,
    getShoppingPhaseForDay,
    SHOPPING_LIST,
    type ShoppingCategory,
    type ShoppingItem,
    type ShoppingPhase,
} from '@/hooks/useProtocolData';
import type {
    ChecklistState,
    ShoppingListItemInput,
    ShoppingListItemSource,
    ShoppingListOverride,
} from '@/hooks/useJournalStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    Circle,
    GitBranch,
    Plus,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShoppingListViewProps {
    currentDay: number;
    checklist: ChecklistState;
    shoppingOverrides?: ShoppingListOverride[];
    onToggle: (key: string) => void;
    onBack: () => void;
    onAskAI: (prompt: string) => void;
    onAddItem?: (item: ShoppingListItemInput) => Promise<unknown> | unknown;
    onRemoveItem?: (item: ResolvedShoppingItem) => Promise<unknown> | unknown;
    defaultExpandedCategories?: string[];
    focusItemKey?: string | null;
    focusNonce?: number;
}

type PhaseStatus = 'current' | 'next' | 'later' | 'reference';

interface ShoppingReferenceContentProps {
    currentDay: number;
    checklist: ChecklistState;
    shoppingOverrides?: ShoppingListOverride[];
    onToggle: (key: string) => void;
    onAddItem?: (item: ShoppingListItemInput) => Promise<unknown> | unknown;
    onRemoveItem?: (item: ResolvedShoppingItem) => Promise<unknown> | unknown;
    defaultExpandedCategories?: string[];
    focusItemKey?: string | null;
    focusNonce?: number;
}

interface ResolvedShoppingItem extends ShoppingItem {
    key: string;
    phase: string;
    category: string;
    source: ShoppingListItemSource;
    isCustom: boolean;
}

interface ResolvedShoppingCategory extends Omit<ShoppingCategory, 'items'> {
    items: ResolvedShoppingItem[];
}

interface ResolvedShoppingPhase extends Omit<ShoppingPhase, 'categories'> {
    categories: ResolvedShoppingCategory[];
}

type PhaseBucket = 'foundation' | 'week1' | 'week2' | 'week3' | 'custom';

const getPhaseBucket = (phaseName: string): PhaseBucket => {
    const normalized = phaseName.trim().toLowerCase();
    if (normalized.includes('foundation') || normalized.includes('prep')) return 'foundation';
    if (normalized.includes('week 1') || normalized.includes('fungal')) return 'week1';
    if (normalized.includes('week 2') || normalized.includes('parasite')) return 'week2';
    if (normalized.includes('week 3') || normalized.includes('heavy') || normalized.includes('metal')) return 'week3';
    return 'custom';
};

const getPhaseDisplayName = (
    phaseName: string,
    hasAiItems: boolean,
    hasManualItems: boolean,
) => {
    const bucket = getPhaseBucket(phaseName);
    if (bucket === 'foundation') return 'Prep + Foundation';
    if (bucket === 'week1') return 'Week 1 - Fungal Flush';
    if (bucket === 'week2') return 'Week 2 - Parasite Purge';
    if (bucket === 'week3') return 'Week 3 - Metal Detox';
    if (hasAiItems) return 'Added by GutBrain';
    if (hasManualItems) return 'Added by you';
    return phaseName;
};

const canonicalPhaseFromBucket = (bucket: PhaseBucket) => {
    if (bucket === 'foundation') return 'Foundation';
    if (bucket === 'week1') return 'Week 1 Reset';
    if (bucket === 'week2') return 'Week 2 Support';
    if (bucket === 'week3') return 'Week 3 Finish';
    return null;
};

const canonicalizeShoppingPhaseName = (phaseName: string) => {
    const canonical = canonicalPhaseFromBucket(getPhaseBucket(phaseName));
    return canonical ?? phaseName.trim();
};

const canonicalizeShoppingCategoryName = (phaseName: string, categoryName: string) => {
    const bucket = getPhaseBucket(phaseName);
    const normalizedCategory = categoryName.trim().toLowerCase();

    if (bucket === 'week1' && normalizedCategory === 'fungal support supplements') {
        return 'Week 1 protocol supplements';
    }
    if (bucket === 'week2' && normalizedCategory === 'parasite-fighting foods') {
        return 'Week 2 produce';
    }
    if (bucket === 'week2' && normalizedCategory === 'parasite formula supplements') {
        return 'Week 2 protocol supplements';
    }
    if (bucket === 'week3' && normalizedCategory === 'metal-chelating foods') {
        return 'Week 3 produce';
    }
    if (bucket === 'week3' && normalizedCategory === 'chelation supplements') {
        return 'Week 3 protocol supplements';
    }

    return categoryName.trim();
};

function getCategoryEmoji(phaseName: string, categoryName: string) {
    const match = SHOPPING_LIST
        .find((phase) => phase.phase === phaseName)
        ?.categories.find((category) => category.category === categoryName);

    return match?.emoji ?? '📝';
}

function getShoppingPhaseMeta(
    phaseName: string,
    hasAiItems: boolean,
    hasManualItems: boolean,
) {
    const bucket = getPhaseBucket(phaseName);

    if (bucket === 'foundation') {
        return {
            eyebrow: 'Prep',
            title: 'Foundation buys',
            summary: 'Set up the staples that make Day 1 feel easy instead of chaotic.',
        };
    }

    if (bucket === 'week1') {
        return {
            eyebrow: 'Week 1',
            title: 'Fungal Flush',
            summary: 'The first active week. Keep this cart clean, repeatable, and realistic.',
        };
    }

    if (bucket === 'week2') {
        return {
            eyebrow: 'Week 2',
            title: 'Parasite Purge',
            summary: 'Refill before Day 8 so the middle of the protocol stays smooth.',
        };
    }

    if (bucket === 'week3') {
        return {
            eyebrow: 'Week 3',
            title: 'Metal Detox',
            summary: 'The final stretch. Buy what keeps momentum high and friction low.',
        };
    }

    if (hasAiItems) {
        return {
            eyebrow: 'Added by GutBrain',
            title: 'GutBrain additions',
            summary: 'Extra items GutBrain suggested to support your current plan.',
        };
    }

    if (hasManualItems) {
        return {
            eyebrow: 'Added by you',
            title: 'Your custom items',
            summary: 'Items you added manually to fit your routine and preferences.',
        };
    }

    return {
        eyebrow: 'Custom',
        title: 'Extra list',
        summary: 'Additional shopping items for your plan.',
    };
}

function buildInitialExpandedPhases(
    shoppingPhases: ResolvedShoppingPhase[],
    currentDay: number,
    defaultExpandedCategories: string[],
) {
    if (defaultExpandedCategories.length) {
        const defaults: Record<string, boolean> = {};
        shoppingPhases.forEach((phase) => {
            defaults[phase.phase] = defaultExpandedCategories.some((key) => key.startsWith(`${phase.phase}_`));
        });
        return defaults;
    }

    const targetPhase = getShoppingPhaseForDay(currentDay);
    const fallbackPhase = shoppingPhases.find((phase) => phase.phase === targetPhase)?.phase ?? shoppingPhases[0]?.phase;
    return fallbackPhase ? { [fallbackPhase]: true } : {};
}

function buildInitialExpandedCategories(
    shoppingPhases: ResolvedShoppingPhase[],
    currentDay: number,
    defaultExpandedCategories: string[],
) {
    if (defaultExpandedCategories.length) {
        return defaultExpandedCategories.reduce<Record<string, boolean>>((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
    }

    const targetPhase = getShoppingPhaseForDay(currentDay);
    const phase = shoppingPhases.find((entry) => entry.phase === targetPhase) ?? shoppingPhases[0];
    const firstCategory = phase?.categories[0];
    if (!phase || !firstCategory) {
        return {};
    }

    return { [`${phase.phase}_${firstCategory.category}`]: true };
}

function buildResolvedShoppingPhases(overrides: ShoppingListOverride[] = []): ResolvedShoppingPhase[] {
    const hiddenKeys = new Set(
        overrides
            .filter((item) => item.isHidden)
            .map((item) => item.key),
    );

    const phases = SHOPPING_LIST.map((phase) => ({
        ...phase,
        categories: phase.categories.map((category) => ({
            ...category,
            items: category.items
                .map((item, index) => ({
                    ...item,
                    key: buildShopKey(phase.phase, category.category, index),
                    phase: phase.phase,
                    category: category.category,
                    source: 'protocol' as const,
                    isCustom: false,
                }))
                .filter((item) => !hiddenKeys.has(item.key)),
        })),
    }));

    for (const override of overrides.filter((item) => !item.isHidden)) {
        const canonicalPhase = canonicalizeShoppingPhaseName(override.phase);
        const canonicalCategory = canonicalizeShoppingCategoryName(canonicalPhase, override.category);
        const phase = phases.find((entry) => entry.phase === canonicalPhase);
        const existingProtocolItem = phase?.categories
            .flatMap((category) => category.items)
            .find((item) => item.key === override.key || (
                item.name.trim().toLowerCase() === override.name.trim().toLowerCase()
                && item.category.trim().toLowerCase() === canonicalCategory.trim().toLowerCase()
            ));

        if (existingProtocolItem) {
            continue;
        }

        const nextPhase = phase ?? {
            phase: canonicalPhase,
            emoji: '📝',
            buyBefore: 'Any time',
            categories: [],
        };

        if (!phase) {
            phases.push(nextPhase);
        }

        let category = nextPhase.categories.find((entry) => entry.category === canonicalCategory);
        if (!category) {
            category = {
                category: canonicalCategory,
                emoji: getCategoryEmoji(nextPhase.phase, canonicalCategory),
                guidance: undefined,
                items: [],
            };
            nextPhase.categories.push(category);
        }

        category.items.push({
            key: override.key,
            phase: nextPhase.phase,
            category: category.category,
            name: override.name,
            quantity: override.quantity ?? 'Custom',
            notes: override.notes,
            optional: override.optional,
            source: override.source,
            isCustom: override.source !== 'protocol',
        });
    }

    return phases;
}

export function ShoppingListView({
    currentDay,
    checklist,
    shoppingOverrides = [],
    onToggle,
    onBack,
    onAskAI: _onAskAI,
    onAddItem,
    onRemoveItem,
    defaultExpandedCategories,
    focusItemKey,
    focusNonce,
}: ShoppingListViewProps) {
    const shoppingPhases = useMemo(
        () => buildResolvedShoppingPhases(shoppingOverrides),
        [shoppingOverrides],
    );

    const allShopKeys = useMemo(
        () => shoppingPhases.flatMap((phase) =>
            phase.categories.flatMap((category) => category.items.map((item) => item.key)),
        ),
        [shoppingPhases],
    );
    const checkedCount = allShopKeys.filter((key) => checklist[key]).length;
    const totalCount = allShopKeys.length;
    const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-shrink-0 border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        data-shopping-back="true"
                        className="h-8 w-8 flex-shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold">Shopping List</h2>
                        <p className="text-[11px] text-muted-foreground">
                            Defaults you can edit. Add your staples and remove anything you will not buy.
                        </p>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {checkedCount}/{totalCount}
                    </span>
                </div>

                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="px-4 py-4">
                    <ShoppingReferenceContent
                        currentDay={currentDay}
                        checklist={checklist}
                        shoppingOverrides={shoppingOverrides}
                        onToggle={onToggle}
                        onAddItem={onAddItem}
                        onRemoveItem={onRemoveItem}
                        defaultExpandedCategories={defaultExpandedCategories}
                        focusItemKey={focusItemKey}
                        focusNonce={focusNonce}
                    />
                </div>
            </ScrollArea>
        </div>
    );
}

export function ShoppingReferenceContent({
    currentDay,
    checklist,
    shoppingOverrides = [],
    onToggle,
    onAddItem,
    onRemoveItem,
    defaultExpandedCategories = [],
    focusItemKey = null,
    focusNonce = 0,
}: ShoppingReferenceContentProps) {
    const shoppingPhases = useMemo(
        () => buildResolvedShoppingPhases(shoppingOverrides),
        [shoppingOverrides],
    );

    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => (
        buildInitialExpandedCategories(shoppingPhases, currentDay, defaultExpandedCategories)
    ));
    const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(() => (
        buildInitialExpandedPhases(shoppingPhases, currentDay, defaultExpandedCategories)
    ));
    const [draftCategoryKey, setDraftCategoryKey] = useState<string | null>(null);
    const [draftName, setDraftName] = useState('');
    const [draftQuantity, setDraftQuantity] = useState('');
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!defaultExpandedCategories.length) {
            return;
        }

        setExpandedCategories((prev) => {
            const next = { ...prev };
            defaultExpandedCategories.forEach((key) => {
                next[key] = true;
            });
            return next;
        });

        setExpandedPhases((prev) => {
            const next = { ...prev };
            shoppingPhases.forEach((phase) => {
                if (defaultExpandedCategories.some((key) => key.startsWith(`${phase.phase}_`))) {
                    next[phase.phase] = true;
                }
            });
            return next;
        });
    }, [defaultExpandedCategories, shoppingPhases]);

    useEffect(() => {
        if (!focusItemKey) {
            return;
        }

        const targetCategoryKey = shoppingPhases
            .flatMap((phase) => phase.categories.map((category) => ({
                key: `${phase.phase}_${category.category}`,
                itemKeys: category.items.map((item) => item.key),
                phase: phase.phase,
            })))
            .find((category) => category.itemKeys.includes(focusItemKey));

        if (!targetCategoryKey) {
            return;
        }

        setExpandedPhases((prev) => ({ ...prev, [targetCategoryKey.phase]: true }));
        setExpandedCategories((prev) => ({ ...prev, [targetCategoryKey.key]: true }));

        window.requestAnimationFrame(() => {
            const target = containerRef.current?.querySelector<HTMLElement>(`[data-shopping-item="${focusItemKey}"]`);
            target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }, [focusItemKey, focusNonce, shoppingPhases]);

    const toggleCategory = (key: string) => {
        setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const togglePhase = (phaseName: string) => {
        setExpandedPhases((prev) => ({ ...prev, [phaseName]: !prev[phaseName] }));
    };

    const resetDraft = () => {
        setDraftCategoryKey(null);
        setDraftName('');
        setDraftQuantity('');
        setIsSavingDraft(false);
    };

    const handleSaveDraft = async (phase: string, category: string) => {
        if (!onAddItem || draftName.trim().length < 2 || isSavingDraft) {
            return;
        }

        setIsSavingDraft(true);
        try {
            await onAddItem({
                phase,
                category,
                name: draftName,
                quantity: draftQuantity,
                source: 'manual',
            });
            resetDraft();
        } finally {
            setIsSavingDraft(false);
        }
    };

    return (
        <div ref={containerRef} className="space-y-4">
            {shoppingPhases.map((phase) => {
                const hasAiItems = phase.categories.some((category) => (
                    category.items.some((item) => item.source === 'ai')
                ));
                const hasManualItems = phase.categories.some((category) => (
                    category.items.some((item) => item.source === 'manual')
                ));
                const phaseStatus = getPhaseStatus(currentDay, phase.phase);
                const isPhaseExpanded = expandedPhases[phase.phase] ?? false;
                const phaseKeys = phase.categories.flatMap((category) => category.items.map((item) => item.key));
                const phaseChecked = phaseKeys.filter((key) => checklist[key]).length;
                const phaseMeta = getShoppingPhaseMeta(phase.phase, hasAiItems, hasManualItems);
                const phaseDisplayName = getPhaseDisplayName(phase.phase, hasAiItems, hasManualItems);

                return (
                    <section key={phase.phase} className="space-y-2">
                        <button
                            type="button"
                            onClick={() => togglePhase(phase.phase)}
                            data-shopping-phase={phase.phase}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all',
                                phaseStatus === 'current' && 'bg-primary/8 border border-primary/20',
                                phaseStatus === 'next' && 'bg-muted/50 border border-border/50',
                                (phaseStatus === 'later' || phaseStatus === 'reference') && 'bg-muted/30 border border-border/30',
                            )}
                        >
                            <span className="text-base">{phase.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2">
                                    <GitBranch className="mt-0.5 h-3.5 w-3.5 text-muted-foreground/70" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                            {phaseMeta.eyebrow}
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {phaseMeta.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {phaseDisplayName} · Buy {phase.buyBefore.toLowerCase()}
                                        </p>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground/80">
                                            {phaseMeta.summary}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-1.5 flex items-center gap-2">
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
                                    : 'text-muted-foreground',
                            )}>
                                {phaseChecked}/{phaseKeys.length}
                            </span>
                            <ChevronDown className={cn(
                                'w-3.5 h-3.5 text-muted-foreground transition-transform',
                                isPhaseExpanded && 'rotate-180',
                            )} />
                        </button>

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
                                            const categoryItemKeys = category.items.map((item) => item.key);
                                            const categoryChecked = categoryItemKeys.filter((key) => checklist[key]).length;
                                            const allDone = categoryItemKeys.length > 0 && categoryChecked === category.items.length;
                                            const isDraftOpen = draftCategoryKey === categoryKey;

                                            return (
                                                <div
                                                    key={categoryKey}
                                                    className={cn(
                                                        'rounded-lg border transition-all',
                                                        allDone
                                                            ? 'border-primary/20 bg-primary/5'
                                                            : 'border-border/40 bg-card/50',
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/20 transition-colors">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCategory(categoryKey)}
                                                            data-shopping-category={categoryKey}
                                                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                                        >
                                                            <span className="text-sm">{category.emoji}</span>
                                                            <span className="flex-1 text-[13px] font-medium text-foreground">{category.category}</span>
                                                            <span className={cn(
                                                                'text-[11px] tabular-nums',
                                                                allDone ? 'text-primary' : 'text-muted-foreground',
                                                            )}>
                                                                {categoryChecked}/{category.items.length}
                                                            </span>
                                                            <ChevronDown className={cn(
                                                                'w-3.5 h-3.5 text-muted-foreground transition-transform',
                                                                isExpanded && 'rotate-180',
                                                            )} />
                                                        </button>
                                                        {onAddItem && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 min-w-[56px] justify-center rounded-full px-2.5 text-[10px] text-muted-foreground"
                                                                onClick={() => {
                                                                    setExpandedPhases((prev) => ({ ...prev, [phase.phase]: true }));
                                                                    setExpandedCategories((prev) => ({ ...prev, [categoryKey]: true }));
                                                                    setDraftCategoryKey(categoryKey);
                                                                }}
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" />
                                                                Add
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.15 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-2 pb-2 space-y-2">
                                                                    {isDraftOpen && (
                                                                        <div className="rounded-xl border border-dashed border-border/60 bg-background/80 px-3 py-3">
                                                                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
                                                                                <Input
                                                                                    value={draftName}
                                                                                    onChange={(event) => setDraftName(event.target.value)}
                                                                                    placeholder="Add something you actually want to buy"
                                                                                    className="h-9 text-sm"
                                                                                    autoFocus
                                                                                />
                                                                                <Input
                                                                                    value={draftQuantity}
                                                                                    onChange={(event) => setDraftQuantity(event.target.value)}
                                                                                    placeholder="Quantity"
                                                                                    className="h-9 text-sm"
                                                                                />
                                                                            </div>
                                                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                                                <p className="text-[11px] text-muted-foreground">
                                                                                    Add your version right here. Keep the list realistic.
                                                                                </p>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="h-8 px-3"
                                                                                        onClick={resetDraft}
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>
                                                                                    <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        className="h-8 px-3"
                                                                                        disabled={draftName.trim().length < 2 || isSavingDraft}
                                                                                        onClick={() => void handleSaveDraft(phase.phase, category.category)}
                                                                                    >
                                                                                        Save
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {category.guidance && (
                                                                        <p className="px-1 text-[11px] text-muted-foreground leading-relaxed italic">
                                                                            {category.guidance}
                                                                        </p>
                                                                    )}

                                                                    {category.items.map((item) => {
                                                                        const checked = !!checklist[item.key];

                                                                        return (
                                                                            <div
                                                                                key={item.key}
                                                                                data-shopping-item={item.key}
                                                                                className={cn(
                                                                                    'w-full flex items-start gap-2.5 px-2 py-2 rounded-md text-left transition-all group scroll-mt-24',
                                                                                    checked ? 'opacity-50' : 'hover:bg-muted/30',
                                                                                    focusItemKey === item.key && 'bg-primary/10 ring-1 ring-primary/25 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]',
                                                                                )}
                                                                            >
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => onToggle(item.key)}
                                                                                    className="mt-0.5"
                                                                                >
                                                                                    {checked ? (
                                                                                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                                                                    ) : (
                                                                                        <Circle className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0 transition-colors" />
                                                                                    )}
                                                                                </button>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-baseline gap-2 flex-wrap">
                                                                                        <span className={cn(
                                                                                            'text-[13px]',
                                                                                            checked ? 'line-through text-muted-foreground' : 'text-foreground',
                                                                                        )}>
                                                                                            {item.name}
                                                                                        </span>
                                                                                        <span className="text-[10px] text-muted-foreground">{item.quantity}</span>
                                                                                        {item.source === 'ai' && (
                                                                                            <span className="text-[9px] px-1.5 py-0 rounded-full bg-primary/10 text-primary font-medium">
                                                                                                Added by GutBrain
                                                                                            </span>
                                                                                        )}
                                                                                        {item.source === 'manual' && (
                                                                                            <span className="text-[9px] px-1.5 py-0 rounded-full bg-muted text-muted-foreground font-medium">
                                                                                                Added by you
                                                                                            </span>
                                                                                        )}
                                                                                        {item.optional && (
                                                                                            <span className="text-[9px] px-1.5 py-0 rounded-full bg-muted text-muted-foreground font-medium">
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
                                                                                {onRemoveItem && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            void onRemoveItem(item);
                                                                                        }}
                                                                                        className="mt-0.5 rounded-full p-1 text-muted-foreground/50 hover:bg-muted hover:text-foreground"
                                                                                        aria-label={`Remove ${item.name}`}
                                                                                    >
                                                                                        <X className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
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

function getPhaseStatus(currentDay: number, phaseName: string): PhaseStatus {
    const bucket = getPhaseBucket(phaseName);

    if (bucket === 'foundation') {
        return currentDay <= 4 ? 'current' : 'reference';
    }

    if (bucket === 'week1') {
        if (currentDay <= 0) return 'next';
        if (currentDay <= 7) return 'current';
        return 'reference';
    }

    if (bucket === 'week2') {
        if (currentDay <= 4) return 'next';
        if (currentDay <= 11) return 'current';
        return 'reference';
    }

    if (bucket === 'week3') {
        if (currentDay <= 11) return 'later';
        if (currentDay <= 14) return 'next';
        return 'current';
    }

    return 'reference';
}
