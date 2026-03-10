import { useState } from 'react';
import { ChecklistItem, getChecklistForDay } from '@/hooks/useProtocolData';
import { ChecklistState, CustomChecklistItem } from '@/hooks/useJournalStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, X, Sparkles, Info } from 'lucide-react';

interface DailyChecklistProps {
    currentDay: number;
    currentPhase: number;
    checklist: ChecklistState;
    customItems: CustomChecklistItem[];
    onToggle: (itemKey: string) => void;
    onAddCustomItem: (label: string, source?: 'ai' | 'manual') => void;
    onRemoveCustomItem: (key: string) => void;
    onAskAbout?: (label: string) => void;
}

export const DailyChecklist = ({
    currentDay, currentPhase, checklist, customItems,
    onToggle, onAddCustomItem, onRemoveCustomItem, onAskAbout
}: DailyChecklistProps) => {
    const [newItemText, setNewItemText] = useState('');
    const [showAddInput, setShowAddInput] = useState(false);

    const staticItems = getChecklistForDay(currentDay);
    const allItemKeys = [...staticItems.map(i => i.key), ...customItems.map(i => i.key)];
    const completedCount = allItemKeys.filter(k => checklist[k]).length;
    const totalCount = allItemKeys.length;
    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Group static items by time of day
    const grouped: Record<string, ChecklistItem[]> = {
        morning: [],
        afternoon: [],
        evening: [],
        anytime: [],
    };
    staticItems.forEach(item => { grouped[item.timeOfDay].push(item); });

    const timeLabels: Record<string, { label: string; emoji: string }> = {
        morning: { label: 'Morning', emoji: '🌅' },
        afternoon: { label: 'Afternoon', emoji: '☀️' },
        evening: { label: 'Evening', emoji: '🌙' },
        anytime: { label: 'Anytime', emoji: '📋' },
    };

    const handleAddItem = () => {
        const trimmed = newItemText.trim();
        if (trimmed.length >= 3) {
            onAddCustomItem(trimmed, 'manual');
            setNewItemText('');
            setShowAddInput(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="font-semibold text-sm">Today's Plan</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Tap a step for context, check it off when done.
                        </p>
                    </div>
                    <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full self-start",
                        completionPercent === 100
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                    )}>
                        {completedCount}/{totalCount}
                    </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Checklist items */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                    {/* Static protocol items grouped by time */}
                    {Object.entries(grouped).map(([timeKey, groupItems]) => {
                        if (groupItems.length === 0) return null;
                        const { label, emoji } = timeLabels[timeKey];
                        return (
                            <div key={timeKey}>
                                <div className="flex items-center gap-1.5 mb-2 px-1">
                                    <span className="text-xs">{emoji}</span>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                                </div>
                                <div className="space-y-1">
                                    {groupItems.map((item) => (
                                        <ChecklistRow
                                            key={item.key}
                                            itemKey={item.key}
                                            label={item.label}
                                            emoji={item.emoji}
                                            isChecked={!!checklist[item.key]}
                                            onToggle={onToggle}
                                            onAskAbout={onAskAbout}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Custom / AI-added items */}
                    {customItems.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2 px-1">
                                <Sparkles className="w-3 h-3 text-primary" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Follow-ups
                                </span>
                            </div>
                            <div className="space-y-1">
                                <AnimatePresence>
                                    {customItems.map((item) => (
                                        <motion.div
                                            key={item.key}
                                            initial={{ opacity: 0, y: -8, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -8, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="relative group"
                                        >
                                            <ChecklistRow
                                                itemKey={item.key}
                                                label={item.label}
                                                emoji={item.source === 'ai' ? '🤖' : '📌'}
                                                isChecked={!!checklist[item.key]}
                                                onToggle={onToggle}
                                                onAskAbout={onAskAbout}
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onRemoveCustomItem(item.key); }}
                                                className="absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                                                title="Remove item"
                                            >
                                                <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Add custom item */}
            <div className="p-3 border-t border-border/50">
                {showAddInput ? (
                    <div className="flex gap-1.5">
                        <Input
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            placeholder="Add a task..."
                            className="h-8 text-xs"
                            autoFocus
                        />
                        <Button size="sm" className="h-8 px-2" onClick={handleAddItem} disabled={newItemText.trim().length < 3}>
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => { setShowAddInput(false); setNewItemText(''); }}>
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                ) : completionPercent === 100 ? (
                    <div className="text-center py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-50 to-primary/5 dark:from-emerald-900/20 dark:to-primary/10 border border-emerald-200/50">
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                            ✨ Today's plan is complete.
                        </span>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground gap-1.5 h-8"
                        onClick={() => setShowAddInput(true)}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add follow-up
                    </Button>
                )}
            </div>
        </div>
    );
};

// Reusable checklist row
function ChecklistRow({ itemKey, label, emoji, isChecked, onToggle, onAskAbout }: {
    itemKey: string;
    label: string;
    emoji: string;
    isChecked: boolean;
    onToggle: (key: string) => void;
    onAskAbout?: (label: string) => void;
}) {
    return (
        <div
            className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200 group/row",
                isChecked
                    ? "bg-primary/5 border border-primary/10"
                    : "hover:bg-muted/50 border border-transparent"
            )}
        >
            {/* Checkbox area — toggles completion */}
            <motion.button
                onClick={(e) => { e.stopPropagation(); onToggle(itemKey); }}
                whileTap={{ scale: 0.85 }}
                className="flex-shrink-0"
            >
                {isChecked ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground" />
                )}
            </motion.button>

            {/* Label area — clicking asks the AI about this item */}
            <button
                onClick={() => onAskAbout?.(label)}
                className="flex-1 text-xs flex items-center gap-1.5 text-left min-w-0"
                title="Tap to learn more"
            >
                <span>{emoji}</span>
                <span className={cn(
                    "transition-all duration-200",
                    isChecked ? "line-through text-muted-foreground" : "text-foreground group-hover/row:text-primary"
                )}>
                    {label}
                </span>
            </button>

            {/* Info hint on hover */}
            {onAskAbout && !isChecked && (
                <Info className="w-3 h-3 text-muted-foreground/0 group-hover/row:text-muted-foreground/50 transition-all flex-shrink-0" />
            )}
        </div>
    );
}
