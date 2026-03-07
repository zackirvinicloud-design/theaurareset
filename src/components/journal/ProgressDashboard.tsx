import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SymptomLog, UserProgress } from '@/hooks/useJournalStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ProgressDashboardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    progress: UserProgress;
    symptoms: SymptomLog[];
    checklistCompletionByDay: Record<number, number>; // day -> completion %
}

const SYMPTOM_COLORS: Record<string, string> = {
    bloating: '#f59e0b',
    fatigue: '#6366f1',
    brain_fog: '#8b5cf6',
    headache: '#ef4444',
    skin: '#ec4899',
    digestion: '#f97316',
    energy: '#10b981',
    sleep: '#3b82f6',
    mood: '#a855f7',
    other: '#6b7280',
};

const SYMPTOM_LABELS: Record<string, string> = {
    bloating: 'Bloating',
    fatigue: 'Fatigue',
    brain_fog: 'Brain Fog',
    headache: 'Headache',
    skin: 'Skin',
    digestion: 'Digestion',
    energy: 'Energy',
    sleep: 'Sleep',
    mood: 'Mood',
    other: 'Other',
};

export const ProgressDashboard = ({ open, onOpenChange, progress, symptoms, checklistCompletionByDay }: ProgressDashboardProps) => {
    // Build symptom chart data — group by day, average severity per symptom type
    const symptomsByDay: Record<number, { day: number;[key: string]: number }> = {};
    for (let d = 0; d <= progress.currentDay; d++) {
        symptomsByDay[d] = { day: d };
    }

    symptoms.forEach(s => {
        if (!symptomsByDay[s.dayNumber]) {
            symptomsByDay[s.dayNumber] = { day: s.dayNumber };
        }
        symptomsByDay[s.dayNumber][s.symptomType] = s.severity;
    });

    const symptomChartData = Object.values(symptomsByDay).sort((a, b) => a.day - b.day);

    // Unique symptom types that have been logged
    const loggedTypes = [...new Set(symptoms.map(s => s.symptomType))];

    // Mood chart data
    const moodLogs = symptoms.filter(s => s.symptomType === 'mood');
    const moodChartData = moodLogs.map(s => ({
        day: s.dayNumber,
        mood: s.severity,
    }));

    // Checklist completion chart data
    const checklistData = Object.entries(checklistCompletionByDay)
        .map(([day, pct]) => ({ day: parseInt(day), completion: pct }))
        .sort((a, b) => a.day - b.day);

    // Stats
    const totalSymptoms = symptoms.length;
    const avgSeverity = totalSymptoms > 0
        ? (symptoms.reduce((sum, s) => sum + s.severity, 0) / totalSymptoms).toFixed(1)
        : '—';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        📊 Progress Dashboard
                    </DialogTitle>
                    <DialogDescription>
                        Your healing journey at a glance — Day {progress.currentDay} of 21
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[65vh] pr-2">
                    <div className="space-y-6 pt-2">
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3">
                            <StatCard label="Current Day" value={`${progress.currentDay}/21`} emoji="📅" />
                            <StatCard label="Streak" value={`${progress.streakCount} days`} emoji="🔥" />
                            <StatCard label="Avg Severity" value={String(avgSeverity)} emoji="📈" />
                        </div>

                        {/* Symptom Trends */}
                        {loggedTypes.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-3">Symptom Trends</h4>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={symptomChartData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="day" tick={{ fontSize: 11 }} label={{ value: 'Day', position: 'bottom', fontSize: 11 }} />
                                            <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} ticks={[1, 2, 3, 4, 5]} />
                                            <Tooltip
                                                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                                labelFormatter={(label) => `Day ${label}`}
                                            />
                                            {loggedTypes.filter(t => t !== 'mood').map(type => (
                                                <Line
                                                    key={type}
                                                    type="monotone"
                                                    dataKey={type}
                                                    stroke={SYMPTOM_COLORS[type] || '#6b7280'}
                                                    strokeWidth={2}
                                                    dot={{ r: 3 }}
                                                    name={SYMPTOM_LABELS[type] || type}
                                                    connectNulls
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Mood History */}
                        {moodChartData.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-3">Mood History</h4>
                                <div className="h-36 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={moodChartData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} ticks={[1, 2, 3, 4, 5]} />
                                            <Tooltip
                                                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                                labelFormatter={(label) => `Day ${label}`}
                                                formatter={(value: number) => [['😫', '😕', '😐', '🙂', '😄'][value - 1] + ` (${value}/5)`, 'Mood']}
                                            />
                                            <Line type="monotone" dataKey="mood" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: '#a855f7' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Checklist Completion */}
                        {checklistData.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-3">Daily Completion</h4>
                                <div className="h-36 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={checklistData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                                            <Tooltip
                                                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                                labelFormatter={(label) => `Day ${label}`}
                                                formatter={(value: number) => [`${value}%`, 'Completion']}
                                            />
                                            <Bar dataKey="completion" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {loggedTypes.length === 0 && moodChartData.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">No data logged yet.</p>
                                <p className="text-xs mt-1">Start logging symptoms and mood to see your progress here.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
    return (
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50 text-center">
            <span className="text-lg">{emoji}</span>
            <p className="text-lg font-bold mt-1">{value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
    );
}
