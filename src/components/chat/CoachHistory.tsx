import { useState, useEffect } from 'react';
import { Calendar, User, Leaf, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { getDayLabel } from '@/hooks/useProtocolData';

interface HistoryEntry {
  id: string;
  dayNumber: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface CoachHistoryProps {
  userId: string | null;
  currentDay: number;
  compact?: boolean;
}

export const CoachHistory = ({ userId, currentDay, compact = false }: CoachHistoryProps) => {
  const [open, setOpen] = useState(false);
  const [allEntries, setAllEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;

    const load = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('journal_entries')
        .select('id, day_number, role, content, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      const mapped: HistoryEntry[] = (data || []).map((e) => ({
        id: e.id,
        dayNumber: e.day_number,
        role: e.role as 'user' | 'assistant',
        content: e.content,
        createdAt: e.created_at,
      }));

      setAllEntries(mapped);
      setIsLoading(false);
    };

    void load();
  }, [open, userId]);

  // Group entries by day number (descending)
  const grouped = allEntries.reduce((acc, entry) => {
    const key = entry.dayNumber;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<number, HistoryEntry[]>);

  const sortedDays = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Chat history">
            <Calendar className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" />
            History
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Coach history</SheetTitle>
          <SheetDescription>
            Your past conversations, organized by protocol day.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history…
            </div>
          ) : sortedDays.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No conversations yet. Start chatting with your Coach to build history.
            </p>
          ) : (
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <div className="space-y-6 pr-2">
                {sortedDays.map((dayNum) => {
                  const dayEntries = grouped[dayNum];
                  const userCount = dayEntries.filter((e) => e.role === 'user').length;
                  const isToday = dayNum === currentDay;

                  return (
                    <div key={dayNum} className="space-y-3">
                      <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-2 border-b border-border/50 z-10">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-semibold">{getDayLabel(dayNum)}</span>
                        {isToday && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            Current
                          </Badge>
                        )}
                        <Badge variant="secondary" className="ml-auto text-[10px]">
                          {userCount} message{userCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="space-y-3 pl-1">
                        {dayEntries.map((msg) => (
                          <div key={msg.id} className="flex gap-2.5 text-sm">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {msg.role === 'user' ? (
                                <User className="w-2.5 h-2.5 text-secondary-foreground" />
                              ) : (
                                <Leaf className="w-2.5 h-2.5 text-emerald-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-medium text-xs">
                                  {msg.role === 'user' ? 'You' : 'Coach'}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words text-[13px]">
                                {msg.content.length > 300
                                  ? `${msg.content.slice(0, 300)}…`
                                  : msg.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
