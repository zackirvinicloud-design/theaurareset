import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, BookOpen, Loader2, ShoppingCart, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDayLabel } from "@/hooks/useProtocolData";
import { useJournalStore } from "@/hooks/useJournalStore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// New layout components
import { TopBar } from "@/components/journal/TopBar";
import { DailyChecklist } from "@/components/journal/DailyChecklist";
import { JournalCenter } from "@/components/journal/JournalCenter";
import { ShoppingListView } from "@/components/journal/ShoppingListView";
import { FullProtocolView } from "@/components/journal/FullProtocolView";
import { MobileProtocolReferenceContent, ProtocolReference } from "@/components/journal/ProtocolReference";
import { InteractiveTour } from "@/components/onboarding/InteractiveTour";
import { SymptomLogger } from "@/components/journal/SymptomLogger";
import { MoodTracker } from "@/components/journal/MoodTracker";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Protocol = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Modals
  const [symptomOpen, setSymptomOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [refOpen, setRefOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return false;
    const saved = localStorage.getItem('protocol-ref-open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Mobile drawers
  const [mobileChecklistOpen, setMobileChecklistOpen] = useState(false);
  const [mobileRefOpen, setMobileRefOpen] = useState(false);

  // Pending prompt for auto-sending from checklist tap
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [tourStartToken, setTourStartToken] = useState(0);

  // Active center view
  const [activeView, setActiveView] = useState<'chat' | 'shopping' | 'protocol'>('chat');

  // Journal store (Supabase-backed)
  const store = useJournalStore();

  // Persist ref panel state
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('protocol-ref-open', JSON.stringify(refOpen));
    }
  }, [refOpen, isMobile]);

  // Auth + access check
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      const hasActiveSubscription = subscription?.is_active;

      const userCreatedAt = new Date(session.user.created_at);
      const now = new Date();
      const hoursSinceSignup = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
      const isWithinFreeTrial = hoursSinceSignup < 48;

      if (!hasActiveSubscription && !isWithinFreeTrial) {
        navigate("/payment-required");
        return;
      }

      setHasAccess(true);
      setIsAuthLoading(false);
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
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

  const handleLogSymptom = async (type: string, severity: number, notes?: string) => {
    await store.logSymptom(type, severity, notes);
    toast({ title: "Symptom logged ✓", description: `${type} (severity ${severity}/5)` });
  };

  const handleAskAbout = (label: string) => {
    // Shopping items → open shopping list view in center console
    if (label.toLowerCase().includes('shop')) {
      setActiveView('shopping');
      return;
    }
    setActiveView('chat');
    setPendingPrompt(`Can you walk me through this step for ${getDayLabel(store.progress.currentDay)}: "${label}"? Use the full protocol. If this is a supplement step, name the exact supplements and timing in plain English.`);
  };

  const handleShoppingAskAI = (prompt: string) => {
    setActiveView('chat');
    setPendingPrompt(prompt);
  };

  const handleOpenShoppingFromGuide = () => {
    setMobileChecklistOpen(false);
    setMobileRefOpen(false);
    setActiveView('shopping');
  };

  const handleOpenFullProtocolFromGuide = () => {
    setMobileChecklistOpen(false);
    setMobileRefOpen(false);
    setActiveView('protocol');
  };

  const handleStartTutorial = () => {
    setMobileChecklistOpen(false);
    setMobileRefOpen(false);
    setActiveView('chat');
    if (!isMobile) {
      setRefOpen(true);
    }
    setTourStartToken((value) => value + 1);
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

  const handleLogMood = async (severity: number, notes?: string) => {
    await store.logSymptom('mood', severity, notes);
    toast({ title: "Mood logged ✓" });
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
      <InteractiveTour
        completionKey={`gut-brain-journal-tour-v2-${store.userId ?? 'local'}`}
        startToken={tourStartToken}
      />

      {/* Top Bar */}
      <TopBar
        progress={store.progress}
        hasJournalEntries={store.entries.length > 0}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onExportJournal={handleExportJournal}
        onClearJournal={handleClearJournal}
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

        {/* ── Center: Journal ── */}
        <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${refOpen ? 'lg:mr-80' : ''} ${isMobile ? 'pb-14' : ''}`}>
          {activeView === 'shopping' ? (
            <ShoppingListView
              currentDay={store.progress.currentDay}
              checklist={store.checklist}
              onToggle={store.toggleChecklistItem}
              onBack={() => setActiveView('chat')}
              onAskAI={handleShoppingAskAI}
            />
          ) : activeView === 'protocol' ? (
            <FullProtocolView
              onBack={() => setActiveView('chat')}
            />
          ) : (
            <JournalCenter
              progress={store.progress}
              entries={store.entries}
              onAddEntry={store.addJournalEntry}
              onUpdateLastEntry={store.updateLastEntry}
              onFinalizeLastEntry={store.finalizeLastEntry}
              onOpenSymptomLogger={() => setSymptomOpen(true)}
              onOpenMoodTracker={() => setMoodOpen(true)}
              pendingPrompt={pendingPrompt}
              onPendingPromptConsumed={() => setPendingPrompt(null)}
              isMobile={isMobile}
            />
          )}
        </main>

        {/* ── Right: Protocol Reference (desktop) ── */}
        <ProtocolReference
          currentPhase={store.progress.currentPhase}
          currentDay={store.progress.currentDay}
          onOpenShoppingView={handleOpenShoppingFromGuide}
          onOpenFullProtocolView={handleOpenFullProtocolFromGuide}
          onStartTutorial={handleStartTutorial}
          isOpen={refOpen}
          onToggle={() => setRefOpen(prev => !prev)}
        />
      </div>

      {/* ── Mobile Bottom Nav ── */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
          <div data-tour="mobile-resource-nav" className="grid grid-cols-4 gap-1 px-2 py-1.5">
            <Sheet open={mobileChecklistOpen} onOpenChange={setMobileChecklistOpen}>
              <SheetTrigger asChild>
                <button
                  data-tour="mobile-plan-nav"
                  className={cn(
                    "flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                    mobileChecklistOpen ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  )}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Plan</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl pt-6">
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
              </SheetContent>
            </Sheet>

            <Sheet open={mobileRefOpen} onOpenChange={setMobileRefOpen}>
              <SheetTrigger asChild>
                <button
                  data-tour="mobile-guide-nav"
                  className={cn(
                    "flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                    mobileRefOpen ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                  )}
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Guide</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl pt-6">
                <div className="h-full overflow-y-auto">
                  <MobileProtocolReferenceContent
                    currentPhase={store.progress.currentPhase}
                    currentDay={store.progress.currentDay}
                    onOpenShoppingView={handleOpenShoppingFromGuide}
                    onOpenFullProtocolView={handleOpenFullProtocolFromGuide}
                    onStartTutorial={handleStartTutorial}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <button
              onClick={() => {
                setMobileChecklistOpen(false);
                setMobileRefOpen(false);
                setActiveView('shopping');
              }}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                activeView === 'shopping' ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-[10px] font-medium">Shop</span>
            </button>

            <button
              onClick={() => {
                setMobileChecklistOpen(false);
                setMobileRefOpen(false);
                setActiveView('protocol');
              }}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                activeView === 'protocol' ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              )}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] font-medium">Protocol</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <SymptomLogger
        open={symptomOpen}
        onOpenChange={setSymptomOpen}
        onLog={handleLogSymptom}
      />

      <MoodTracker
        open={moodOpen}
        onOpenChange={setMoodOpen}
        onLog={handleLogMood}
      />
    </div>
  );
};

export default Protocol;
