import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PHASE_INFO, getPhaseInfo } from '@/hooks/useProtocolData';
import { BookOpen, ChevronRight, ChevronLeft, Pill, Lightbulb, ShoppingCart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProtocolReferenceProps {
    currentPhase: number;
    currentDay: number;
    isOpen: boolean;
    onToggle: () => void;
}

export const ProtocolReference = ({ currentPhase, currentDay, isOpen, onToggle }: ProtocolReferenceProps) => {
    const [activeTab, setActiveTab] = useState<'today' | 'phases' | 'tips'>('today');
    const phase = getPhaseInfo(currentPhase);

    const tabs = [
        { key: 'today', label: 'Today', icon: Pill },
        { key: 'phases', label: 'Phases', icon: BookOpen },
        { key: 'tips', label: 'Tips', icon: Lightbulb },
    ] as const;

    return (
        <>
            {/* Toggle button when closed */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden lg:flex items-center gap-1 px-1.5 py-3 bg-background border border-r-0 border-border rounded-l-lg shadow-sm hover:bg-muted transition-colors"
                    title="Open protocol reference"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <BookOpen className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="hidden lg:flex flex-col fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-80 bg-background border-l border-border z-30"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <h3 className="font-semibold text-sm">Protocol Reference</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={onToggle}
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border/50">
                            {tabs.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2",
                                        activeTab === key
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <ScrollArea className="flex-1">
                            <div className="p-4">
                                {activeTab === 'today' && <TodayTab phase={phase} currentPhase={currentPhase} currentDay={currentDay} />}
                                {activeTab === 'phases' && <PhasesTab currentPhase={currentPhase} />}
                                {activeTab === 'tips' && <TipsTab phase={phase} currentPhase={currentPhase} />}
                            </div>
                        </ScrollArea>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};

// ── Tab Components ────────────────────────────────────

function TodayTab({ phase, currentPhase, currentDay }: { phase: ReturnType<typeof getPhaseInfo>; currentPhase: number; currentDay: number }) {
    return (
        <div className="space-y-5">
            {/* Phase badge */}
            <div className={cn("p-3 rounded-lg border", phase.bgColor, phase.borderColor)}>
                <p className={cn("text-sm font-semibold mb-1", phase.color)}>
                    Phase {currentPhase}: {phase.name}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {phase.description}
                </p>
            </div>

            {/* Supplements for this phase */}
            <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5" />
                    Today's Supplements
                </h4>
                <div className="space-y-2">
                    {phase.supplements.map((supp, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{supp}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Binder timing reminder */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Binder Timing</p>
                <p className="text-xs text-amber-600 dark:text-amber-300/80">
                    Take binders 2 hours away from food and other supplements. This is critical for effectiveness.
                </p>
            </div>
        </div>
    );
}

function PhasesTab({ currentPhase }: { currentPhase: number }) {
    return (
        <div className="space-y-3">
            {Object.entries(PHASE_INFO).map(([key, info]) => {
                const phaseNum = parseInt(key);
                const isCurrent = phaseNum === currentPhase;
                return (
                    <div
                        key={key}
                        className={cn(
                            "p-3 rounded-lg border transition-all",
                            isCurrent
                                ? cn(info.bgColor, info.borderColor, "shadow-sm")
                                : "border-border/50 hover:border-border"
                        )}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <p className={cn("text-sm font-semibold", isCurrent ? info.color : "text-foreground")}>
                                Phase {phaseNum}: {info.shortName}
                            </p>
                            {isCurrent && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    Current
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {info.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

function TipsTab({ phase, currentPhase }: { phase: ReturnType<typeof getPhaseInfo>; currentPhase: number }) {
    return (
        <div className="space-y-5">
            <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Phase {currentPhase} Tips
                </h4>
                <div className="space-y-2">
                    {phase.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/50">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs leading-relaxed">{tip}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* General Tips */}
            <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    General Guidelines
                </h4>
                <div className="space-y-2">
                    {[
                        'Drink at least 64oz of water daily — hydration helps flush toxins',
                        'Avoid sugar, gluten, dairy, and processed foods throughout the protocol',
                        'Get 7-9 hours of sleep — your body heals during rest',
                        'Die-off symptoms (headache, fatigue, brain fog) are normal and temporary',
                        'Listen to your body — slow down if symptoms are too intense',
                    ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/50">
                            <span className="text-xs text-primary mt-0.5">✓</span>
                            <span className="text-xs leading-relaxed">{tip}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
