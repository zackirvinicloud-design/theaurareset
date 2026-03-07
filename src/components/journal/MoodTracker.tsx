import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MoodTrackerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLog: (severity: number, notes?: string) => void;
}

const MOODS = [
    { value: 1, emoji: '😫', label: 'Terrible' },
    { value: 2, emoji: '😕', label: 'Not great' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Amazing' },
];

export const MoodTracker = ({ open, onOpenChange, onLog }: MoodTrackerProps) => {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (selectedMood === null) return;
        onLog(selectedMood, notes || undefined);
        setSelectedMood(null);
        setNotes('');
        onOpenChange(false);
    };

    const handleClose = () => {
        setSelectedMood(null);
        setNotes('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>How are you feeling?</DialogTitle>
                    <DialogDescription>
                        Quick mood check — helps you track your healing journey
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    {/* Mood selector */}
                    <div className="flex justify-center gap-3">
                        {MOODS.map((mood) => (
                            <button
                                key={mood.value}
                                onClick={() => setSelectedMood(mood.value)}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                                    selectedMood === mood.value
                                        ? "bg-primary/10 border-2 border-primary shadow-sm scale-110"
                                        : "border-2 border-transparent hover:bg-muted/50 hover:scale-105"
                                )}
                            >
                                <span className="text-3xl">{mood.emoji}</span>
                                <span className="text-[10px] font-medium text-muted-foreground">{mood.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Note */}
                    {selectedMood !== null && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                        >
                            <Textarea
                                placeholder="What's on your mind? (optional)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="h-20 text-sm resize-none"
                            />
                        </motion.div>
                    )}

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedMood === null}
                        className="w-full"
                    >
                        {selectedMood !== null
                            ? `Log "${MOODS.find(m => m.value === selectedMood)?.label}" Mood`
                            : 'Select a mood'
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
