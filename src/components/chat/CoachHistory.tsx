import { useState, useEffect } from 'react';
import { Calendar, User, Leaf, Loader2, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { ChatThread } from '@/hooks/useJournalStore';

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
  threads?: ChatThread[];
  activeThreadId?: string | null;
  onSelectThread?: (threadId: string) => Promise<void> | void;
  onRenameThread?: (threadId: string, title: string) => Promise<void> | void;
}

export const CoachHistory = ({
  userId,
  currentDay,
  compact = false,
  threads,
  activeThreadId,
  onSelectThread,
  onRenameThread,
}: CoachHistoryProps) => {
  const [open, setOpen] = useState(false);
  const [allEntries, setAllEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchIndex, setSearchIndex] = useState<Record<string, string>>({});
  const [isIndexingSearch, setIsIndexingSearch] = useState(false);

  const hasThreadControls = Boolean(threads && onSelectThread && onRenameThread);

  useEffect(() => {
    if (!open || !userId || hasThreadControls) return;

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
  }, [hasThreadControls, open, userId]);

  useEffect(() => {
    if (!open || !hasThreadControls) {
      return;
    }

    const buildLocalIndex = () => {
      try {
        const raw = localStorage.getItem('gbj-journal-entries');
        const parsed = raw ? JSON.parse(raw) : [];
        const index: Record<string, string> = {};

        if (Array.isArray(parsed)) {
          parsed.forEach((entry) => {
            if (!entry || typeof entry !== 'object') return;
            const threadId = 'threadId' in entry ? String(entry.threadId || '') : '';
            const content = 'content' in entry ? String(entry.content || '') : '';
            if (!threadId || !content) return;
            const normalized = content.toLowerCase();
            const current = index[threadId] || '';
            index[threadId] = `${current} ${normalized}`.trim().slice(-8000);
          });
        }

        return index;
      } catch {
        return {};
      }
    };

    const localIndex = buildLocalIndex();
    setSearchIndex(localIndex);

    if (!userId) {
      return;
    }

    const loadRemoteSearch = async () => {
      setIsIndexingSearch(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('thread_id, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const remoteIndex: Record<string, string> = {};
        data.forEach((row) => {
          const threadId = row.thread_id;
          if (!threadId || !row.content) return;
          const normalized = row.content.toLowerCase();
          const current = remoteIndex[threadId] || '';
          remoteIndex[threadId] = `${current} ${normalized}`.trim().slice(-8000);
        });
        setSearchIndex({ ...localIndex, ...remoteIndex });
      }

      setIsIndexingSearch(false);
    };

    void loadRemoteSearch();
  }, [hasThreadControls, open, userId]);

  const handleRename = async (threadId: string, currentTitle: string) => {
    if (!onRenameThread) {
      return;
    }

    const nextTitle = window.prompt('Rename chat', currentTitle)?.trim();
    if (!nextTitle || nextTitle === currentTitle) {
      return;
    }

    await onRenameThread(threadId, nextTitle);
  };

  // Legacy grouped-by-day fallback
  const grouped = allEntries.reduce((acc, entry) => {
    const key = entry.dayNumber;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<number, HistoryEntry[]>);

  const sortedDays = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredThreads = (threads || []).filter((thread) => {
    if (!normalizedSearch) return true;
    if (thread.title.toLowerCase().includes(normalizedSearch)) return true;
    return (searchIndex[thread.id] || '').includes(normalizedSearch);
  });

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
          <SheetTitle>{hasThreadControls ? 'Chats' : 'Coach history'}</SheetTitle>
          <SheetDescription>
            {hasThreadControls
              ? 'Search, rename, and reopen previous conversations.'
              : 'Your past conversations, organized by protocol day.'}
          </SheetDescription>
        </SheetHeader>

        {hasThreadControls ? (
          <div className="mt-4 pb-8">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search chats by title or message..."
                className="h-9 pl-9 text-sm"
              />
            </div>
            {isIndexingSearch && (
              <p className="mt-2 text-xs text-muted-foreground">Indexing chat content...</p>
            )}

            <div className="mt-3">
              {!threads?.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No chats yet. Start your first one.
                </p>
              ) : filteredThreads.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No matches for "{searchTerm.trim()}".
                </p>
              ) : (
                <ScrollArea className="h-[calc(100vh-11.5rem)] pr-1">
                  <div className="space-y-2">
                    {filteredThreads.map((thread) => (
                      <div
                        key={thread.id}
                        className={`rounded-lg border px-3 py-2.5 ${
                          thread.id === activeThreadId
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border/60 bg-card/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={async () => {
                              await onSelectThread?.(thread.id);
                              setOpen(false);
                            }}
                          >
                            <p className="truncate text-sm font-medium text-foreground">
                              {thread.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {new Date(thread.updatedAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                          </button>
                          <div className="flex items-center gap-1">
                            {thread.id === activeThreadId && (
                              <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                                Active
                              </Badge>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => void handleRename(thread.id, thread.title)}
                              title="Rename chat"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 pb-8">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading history...
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
                        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/50 bg-background/95 py-2 backdrop-blur-sm">
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
                              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/30">
                                {msg.role === 'user' ? (
                                  <User className="w-2.5 h-2.5 text-secondary-foreground" />
                                ) : (
                                  <Leaf className="w-2.5 h-2.5 text-emerald-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="mb-0.5 flex items-center gap-2">
                                  <span className="text-xs font-medium">
                                    {msg.role === 'user' ? 'You' : 'Coach'}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <p className="text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
                                  {msg.content.length > 300 ? `${msg.content.slice(0, 300)}...` : msg.content}
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
        )}
      </SheetContent>
    </Sheet>
  );
};
