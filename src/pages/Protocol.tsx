import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Loader2, MessageSquare, ShoppingCart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDayLabel } from "@/hooks/useProtocolData";
import { useJournalStore } from "@/hooks/useJournalStore";
import { toast } from "@/hooks/use-toast";
import { getDefaultPostAuthDestination, isEmailVerified } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

import { TopBar } from "@/components/journal/TopBar";
import { DailyChecklist } from "@/components/journal/DailyChecklist";
import { JournalCenter } from "@/components/journal/JournalCenter";
import { MobileTodayView } from "@/components/journal/MobileTodayView";
import { ShoppingListView } from "@/components/journal/ShoppingListView";
import { FullProtocolView } from "@/components/journal/FullProtocolView";
import { ProtocolReference } from "@/components/journal/ProtocolReference";

type ActiveView = 'today' | 'help' | 'shopping' | 'guide' | 'protocol';

const Protocol = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [refOpen, setRefOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return false;
    const saved = localStorage.getItem('protocol-ref-open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Pending prompt for auto-sending from checklist tap
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'today';
    }
    return 'help';
  });

  // Journal store (Supabase-backed)
  const store = useJournalStore();

  // Persist ref panel state
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('protocol-ref-open', JSON.stringify(refOpen));
    }
  }, [refOpen, isMobile]);

  useEffect(() => {
    setActiveView((current) => {
      if (isMobile) {
        return current;
      }

      if (current === 'today') {
        return 'help';
      }

      return current;
    });
  }, [isMobile]);

  // Auth + access check
  useEffect(() => {
    let cancelled = false;

    const handleSession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (cancelled) return;
      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }

      if (!isEmailVerified(session.user)) {
        navigate("/signup", { replace: true });
        return;
      }

      const destination = await getDefaultPostAuthDestination(session.user.id);
      if (cancelled) return;

      if (destination !== "/protocol") {
        navigate(destination, { replace: true });
        return;
      }

      setHasAccess(true);
      setIsAuthLoading(false);
    };

    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleSession(session);
    };

    void checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      window.setTimeout(() => {
        void handleSession(session);
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handlePreviousDay = async () => {
    const targetDay = Math.max(store.progress.currentDay - 1, 0);
    if (targetDay === store.progress.currentDay) return;

    await store.setCurrentDay(targetDay);
    toast({
      title: "Day updated",
      description: `Now on ${getDayLabel(targetDay)}`,
    });
  };

  const handleNextDay = async () => {
    const targetDay = Math.min(store.progress.currentDay + 1, 21);
    if (targetDay === store.progress.currentDay) return;

    await store.setCurrentDay(targetDay);
    toast({
      title: "Day updated",
      description: `Now on ${getDayLabel(targetDay)}`,
    });
  };

  const handleAskAbout = (label: string) => {
    setActiveView('help');
    const starters = [
      `What exactly should I do for "${label}"?`,
      `Break down "${label}" for me -- what do I actually need to do?`,
      `How do I handle "${label}" today?`,
      `Tell me about "${label}" -- what's the move?`,
    ];
    setPendingPrompt(starters[Math.floor(Math.random() * starters.length)]);
  };

  const handleShoppingAskAI = (prompt: string) => {
    setActiveView('help');
    setPendingPrompt(prompt);
  };

  const handleOpenShoppingFromGuide = () => {
    setActiveView('shopping');
  };

  const handleOpenFullProtocolFromGuide = () => {
    setActiveView('protocol');
  };

  const handleStartTutorial = () => {
    setActiveView(isMobile ? 'today' : 'help');
    if (!isMobile) {
      setRefOpen(true);
    }
  };

  const handleExportJournal = () => {
    store.exportChat();
  };

  const handleClearJournal = async () => {
    if (!confirm("Clear today's journal entries? This cannot be undone.")) {
      return;
    }

    await store.clearEntries();
    toast({
      title: "Cleared",
      description: "Today's entries have been removed.",
    });
  };

  // Loading states
  if (isAuthLoading || store.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading your journal...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) return null;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar
        progress={store.progress}
        hasJournalEntries={store.entries.length > 0}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onExportJournal={handleExportJournal}
        onClearJournal={handleClearJournal}
        onRunTutorialAgain={handleStartTutorial}
        onReadFullProtocol={handleOpenFullProtocolFromGuide}
        showReadFullProtocol={isMobile}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left: Daily Checklist (desktop) ── */}
        <aside
          data-tour="today-plan"
          className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-muted/20 flex-shrink-0 overflow-hidden"
        >
          <DailyChecklist
            currentDay={store.progress.currentDay}
            currentPhase={store.progress.currentPhase}
            checklist={store.checklist}
            customItems={store.customItems}
            onToggle={store.toggleChecklistItem}
            onAddCustomItem={store.addCustomItem}
            onRemoveCustomItem={store.removeCustomItem}
            onAskAbout={handleAskAbout}
          />
        </aside>

        <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${!isMobile && refOpen ? 'lg:mr-80' : ''} ${isMobile ? 'pb-14' : ''}`}>
          {isMobile ? (
            activeView === 'shopping' ? (
              <ShoppingListView
                currentDay={store.progress.currentDay}
                checklist={store.checklist}
                onToggle={store.toggleChecklistItem}
                onBack={() => setActiveView('today')}
                onAskAI={handleShoppingAskAI}
              />
            ) : activeView === 'protocol' ? (
              <FullProtocolView
                onBack={() => setActiveView('today')}
              />
            ) : activeView === 'today' ? (
              <MobileTodayView
                currentDay={store.progress.currentDay}
                currentPhase={store.progress.currentPhase}
                checklist={store.checklist}
                customItems={store.customItems}
                onToggle={store.toggleChecklistItem}
                onRemoveCustomItem={store.removeCustomItem}
                onAskAbout={handleAskAbout}
                onOpenShoppingView={handleOpenShoppingFromGuide}
              />
            ) : (
              <JournalCenter
                userId={store.userId}
                progress={store.progress}
                entries={store.entries}
                onAddEntry={store.addJournalEntry}
                onUpdateLastEntry={store.updateLastEntry}
                onFinalizeLastEntry={store.finalizeLastEntry}
                pendingPrompt={pendingPrompt}
                onPendingPromptConsumed={() => setPendingPrompt(null)}
                isMobile={true}
                mobileVariant="help"
              />
            )
          ) : activeView === 'shopping' ? (
            <ShoppingListView
              currentDay={store.progress.currentDay}
              checklist={store.checklist}
              onToggle={store.toggleChecklistItem}
              onBack={() => setActiveView('help')}
              onAskAI={handleShoppingAskAI}
            />
          ) : activeView === 'protocol' ? (
            <FullProtocolView
              onBack={() => setActiveView('help')}
            />
          ) : (
            <JournalCenter
              userId={store.userId}
              progress={store.progress}
              entries={store.entries}
              onAddEntry={store.addJournalEntry}
              onUpdateLastEntry={store.updateLastEntry}
              onFinalizeLastEntry={store.finalizeLastEntry}
              pendingPrompt={pendingPrompt}
              onPendingPromptConsumed={() => setPendingPrompt(null)}
              isMobile={false}
            />
          )}
        </main>

        {/* ── Right: Protocol Reference (desktop) ── */}
        {!isMobile && (
          <ProtocolReference
            currentPhase={store.progress.currentPhase}
            currentDay={store.progress.currentDay}
            onOpenShoppingView={handleOpenShoppingFromGuide}
            onOpenFullProtocolView={handleOpenFullProtocolFromGuide}
            isOpen={refOpen}
            onToggle={() => setRefOpen(prev => !prev)}
          />
        )}
      </div>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
          <div data-tour="mobile-resource-nav" className="grid grid-cols-3 gap-1 px-2 py-1.5">
            <button
              data-tour="mobile-plan-nav"
              onClick={() => setActiveView('today')}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                activeView === 'today' || activeView === 'protocol' ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              )}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] font-medium">Plan</span>
            </button>

            <button
              onClick={() => setActiveView('help')}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                activeView === 'help' ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              )}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px] font-medium">Coach</span>
            </button>

            <button
              onClick={() => setActiveView('shopping')}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                activeView === 'shopping' ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-[10px] font-medium">Shop</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Protocol;
