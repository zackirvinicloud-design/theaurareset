import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SymptomLoggerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLog: (symptomType: string, severity: number, notes?: string) => void;
}

const SYMPTOMS = [
    { key: 'bloating', label: 'Bloating', emoji: '🫄' },
    { key: 'fatigue', label: 'Fatigue', emoji: '😴' },
    { key: 'brain_fog', label: 'Brain Fog', emoji: '🌫️' },
    { key: 'headache', label: 'Headache', emoji: '🤕' },
    { key: 'skin', label: 'Skin Issues', emoji: '🔴' },
    { key: 'digestion', label: 'Digestion', emoji: '🫨' },
    { key: 'energy', label: 'Low Energy', emoji: '🔋' },
    { key: 'sleep', label: 'Sleep Issues', emoji: '🛌' },
    { key: 'other', label: 'Other', emoji: '📝' },
];

const SEVERITY_LABELS = [
    { value: 1, label: 'Mild', color: 'bg-emerald-500' },
    { value: 2, label: 'Light', color: 'bg-lime-500' },
    { value: 3, label: 'Moderate', color: 'bg-amber-500' },
    { value: 4, label: 'Strong', color: 'bg-orange-500' },
    { value: 5, label: 'Severe', color: 'bg-red-500' },
];

export const SymptomLogger = ({ open, onOpenChange, onLog }: SymptomLoggerProps) => {
    const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
    const [severity, setSeverity] = useState(3);
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (!selectedSymptom) return;
        onLog(selectedSymptom, severity, notes || undefined);
        // Reset
        setSelectedSymptom(null);
        setSeverity(3);
        setNotes('');
        onOpenChange(false);
    };

    const handleClose = () => {
        setSelectedSymptom(null);
        setSeverity(3);
        setNotes('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        📝 Log a Symptom
                    </DialogTitle>
                    <DialogDescription>
                        Track how you're feeling to spot patterns over time
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    {/* Symptom selector */}
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            What are you experiencing?
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {SYMPTOMS.map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setSelectedSymptom(s.key)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all text-center",
                                        selectedSymptom === s.key
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border/50 hover:border-border hover:bg-muted/50"
                                    )}
                                >
                                    <span className="text-lg">{s.emoji}</span>
                                    <span className="text-[10px] font-medium leading-tight">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Severity slider */}
                    {selectedSymptom && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                Severity: {SEVERITY_LABELS[severity - 1].label}
                            </label>
                            <div className="flex gap-2">
                                {SEVERITY_LABELS.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => setSeverity(s.value)}
                                        className={cn(
                                            "flex-1 h-10 rounded-lg border-2 transition-all flex items-center justify-center text-sm font-bold",
                                            severity === s.value
                                                ? cn(s.color, "text-white border-transparent shadow-md scale-105")
                                                : "border-border/50 text-muted-foreground hover:border-border"
                                        )}
                                    >
                                        {s.value}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Notes */}
                    {selectedSymptom && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                                Notes (optional)
                            </label>
                            <Textarea
                                placeholder="Any details about timing, triggers, etc."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="h-20 text-sm resize-none"
                            />
                        </motion.div>
                    )}

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedSymptom}
                        className="w-full"
                    >
                        Log Symptom
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
