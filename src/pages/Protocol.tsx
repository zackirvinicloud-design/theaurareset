import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useJournalStore } from "@/hooks/useJournalStore";
import { getChecklistForDay, getPhaseInfo } from "@/hooks/useProtocolData";
import { toast } from "@/hooks/use-toast";

// New layout components
import { TopBar } from "@/components/journal/TopBar";
import { DailyChecklist } from "@/components/journal/DailyChecklist";
import { JournalCenter } from "@/components/journal/JournalCenter";
import { ShoppingListView } from "@/components/journal/ShoppingListView";
import { ProtocolReference } from "@/components/journal/ProtocolReference";
import { SymptomLogger } from "@/components/journal/SymptomLogger";
import { MoodTracker } from "@/components/journal/MoodTracker";
import { ProgressDashboard } from "@/components/journal/ProgressDashboard";
import { ProgressSettingsDialog } from "@/components/chat/ProgressSettingsDialog";

// Mobile-specific
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ClipboardList, BookOpen } from "lucide-react";

const Protocol = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Modals
  const [symptomOpen, setSymptomOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  // Active center view: 'chat' (default) or 'shopping'
  const [activeView, setActiveView] = useState<'chat' | 'shopping'>('chat');

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

  const handleAdvanceDay = async () => {
    await store.advanceDay();
    toast({
      title: "Day advanced! 🎉",
      description: `Now on ${store.progress.currentDay + 1 <= 21 ? `Day ${store.progress.currentDay + 1}` : 'Day 21 (Complete!)'}`,
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
    setPendingPrompt(`Tell me more about this checklist item: "${label}" — what exactly should I do, why is it important, and any tips?`);
  };

  const handleShoppingAskAI = (prompt: string) => {
    setActiveView('chat');
    setPendingPrompt(prompt);
  };

  const handleLogMood = async (severity: number, notes?: string) => {
    await store.logSymptom('mood', severity, notes);
    toast({ title: "Mood logged ✓" });
  };

  // Build checklist completion data for dashboard
  const checklistCompletionByDay: Record<number, number> = {};
  const currentItems = getChecklistForDay(store.progress.currentDay);
  const completedToday = currentItems.filter(i => store.checklist[i.key]).length;
  if (currentItems.length > 0) {
    checklistCompletionByDay[store.progress.currentDay] = Math.round((completedToday / currentItems.length) * 100);
  }

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
        onAdvanceDay={handleAdvanceDay}
        onSettings={() => setSettingsOpen(true)}
        onSignOut={handleSignOut}
        onDashboard={() => setDashboardOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left: Daily Checklist (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-muted/20 flex-shrink-0 overflow-hidden">
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
        <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${refOpen ? 'lg:mr-80' : ''}`}>
          {activeView === 'shopping' ? (
            <ShoppingListView
              currentDay={store.progress.currentDay}
              checklist={store.checklist}
              onToggle={store.toggleChecklistItem}
              onBack={() => setActiveView('chat')}
              onAskAI={handleShoppingAskAI}
            />
          ) : (
            <JournalCenter
              progress={store.progress}
              entries={store.entries}
              onAddEntry={store.addJournalEntry}
              onUpdateLastEntry={store.updateLastEntry}
              onFinalizeLastEntry={store.finalizeLastEntry}
              onClearEntries={store.clearEntries}
              onExportChat={store.exportChat}
              onOpenSymptomLogger={() => setSymptomOpen(true)}
              onOpenMoodTracker={() => setMoodOpen(true)}
              onExtractActions={store.extractActionsFromAI}
              onAddCustomItem={store.addCustomItem}
              pendingPrompt={pendingPrompt}
              onPendingPromptConsumed={() => setPendingPrompt(null)}
            />
          )}
        </main>

        {/* ── Right: Protocol Reference (desktop) ── */}
        <ProtocolReference
          currentPhase={store.progress.currentPhase}
          currentDay={store.progress.currentDay}
          isOpen={refOpen}
          onToggle={() => setRefOpen(prev => !prev)}
        />
      </div>

      {/* ── Mobile Bottom Nav ── */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 px-2 py-2 flex items-center gap-2 safe-area-bottom">
          <Sheet open={mobileChecklistOpen} onOpenChange={setMobileChecklistOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                <ClipboardList className="w-3.5 h-3.5" />
                Checklist
                <span className="text-muted-foreground">
                  {completedToday}/{currentItems.length}
                </span>
              </Button>
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
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                Protocol
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl pt-6">
              <div className="h-full overflow-y-auto">
                <MobileProtocolRef
                  currentPhase={store.progress.currentPhase}
                  currentDay={store.progress.currentDay}
                />
              </div>
            </SheetContent>
          </Sheet>
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

      <ProgressDashboard
        open={dashboardOpen}
        onOpenChange={setDashboardOpen}
        progress={store.progress}
        symptoms={store.symptoms}
        checklistCompletionByDay={checklistCompletionByDay}
      />

      <ProgressSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentDay={store.progress.currentDay}
        onSave={(day, phase) => {
          store.updateProgress({ currentDay: day, currentPhase: phase as 1 | 2 | 3 | 4 });
          setSettingsOpen(false);
          toast({
            title: "Progress updated",
            description: `Set to Day ${day}, Phase ${phase}`,
          });
        }}
      />
    </div>
  );
};

// Simple inline protocol reference for mobile (no animation needed)
function MobileProtocolRef({ currentPhase, currentDay }: { currentPhase: number; currentDay: number }) {
  const phase = getPhaseInfo(currentPhase);

  return (
    <div className="space-y-4 px-1">
      <div className={`p-3 rounded-lg border ${phase.bgColor} ${phase.borderColor}`}>
        <p className={`text-sm font-semibold mb-1 ${phase.color}`}>
          Phase {currentPhase}: {phase.name}
        </p>
        <p className="text-xs text-muted-foreground">{phase.description}</p>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-2">Today's Supplements</h4>
        {phase.supplements.map((s: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-sm py-1">
            <span className="text-primary">•</span>
            <span className="text-sm">{s}</span>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Binder Timing</p>
        <p className="text-xs text-amber-600 dark:text-amber-300/80">
          Take binders 2 hours away from food and other supplements.
        </p>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-2">Phase Tips</h4>
        {phase.tips.map((tip: string, i: number) => (
          <div key={i} className="text-xs p-2 mb-1 rounded bg-muted/50">{tip}</div>
        ))}
      </div>
    </div>
  );
}

export default Protocol;
