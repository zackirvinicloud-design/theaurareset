import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ClipboardList, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { findShoppingCategoryMatch, getDayLabel, getShoppingPhaseForDay, SHOPPING_LIST } from "@/hooks/useProtocolData";
import { useJournalStore } from "@/hooks/useJournalStore";
import { toast } from "@/hooks/use-toast";
import { getDefaultPostAuthDestination, isEmailVerified } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";
import { parseLocalDateTime } from "@/lib/taskReminders";
import type { CoachAction, GutBrainShoppingAction } from "@/lib/gutbrain";

import { TopBar } from "@/components/journal/TopBar";
import { DailyChecklist, buildChecklistViewModel } from "@/components/journal/DailyChecklist";
import { JournalCenter } from "@/components/journal/JournalCenter";
import { MobileTodayView } from "@/components/journal/MobileTodayView";
import { ShoppingListView } from "@/components/journal/ShoppingListView";
import { FullProtocolView } from "@/components/journal/FullProtocolView";
import { MobileProtocolReferenceContent, ProtocolReference } from "@/components/journal/ProtocolReference";

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
  const [activeView, setActiveView] = useState<ActiveView>('today');
  const [focusedChecklistKey, setFocusedChecklistKey] = useState<string | null>(null);
  const [reminderComposerTargetKey, setReminderComposerTargetKey] = useState<string | null>(null);
  const [normalTodayAutoOpenSignal, setNormalTodayAutoOpenSignal] = useState(0);
  const [shoppingDefaultExpandedCategories, setShoppingDefaultExpandedCategories] = useState<string[]>([]);

  // Journal store (Supabase-backed)
  const store = useJournalStore();
  const checklistViewModel = useMemo(
    () => buildChecklistViewModel(store.progress.currentDay, store.checklist, store.customItems),
    [store.checklist, store.customItems, store.progress.currentDay],
  );

  // Persist ref panel state
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('protocol-ref-open', JSON.stringify(refOpen));
    }
  }, [refOpen, isMobile]);

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

  const openNormalToday = useCallback(() => {
    setNormalTodayAutoOpenSignal((value) => value + 1);
    if (isMobile) {
      setActiveView('guide');
      return;
    }
    setRefOpen(true);
  }, [isMobile]);

  const resolveChecklistTargetKey = useCallback((preferredKey?: string | null) => {
    if (preferredKey && checklistViewModel.allItems.some((item) => item.key === preferredKey)) {
      return preferredKey;
    }

    return checklistViewModel.nextItem?.key ?? checklistViewModel.allItems[0]?.key ?? null;
  }, [checklistViewModel.allItems, checklistViewModel.nextItem]);

  const focusChecklistItem = useCallback((itemKey: string, options?: { openReminderComposer?: boolean }) => {
    setFocusedChecklistKey(itemKey);
    if (options?.openReminderComposer) {
      setReminderComposerTargetKey(itemKey);
    }
    if (isMobile) {
      setActiveView('today');
    }
  }, [isMobile]);

  const openReminderTarget = useCallback(async (itemKey: string, reminderDayNumber?: number | null) => {
    if (
      typeof reminderDayNumber === 'number'
      && reminderDayNumber !== store.progress.currentDay
      && reminderDayNumber >= 0
      && reminderDayNumber <= 21
    ) {
      await store.setCurrentDay(reminderDayNumber);
    }

    focusChecklistItem(itemKey);
  }, [focusChecklistItem, store.progress.currentDay, store.setCurrentDay]);

  const handleReminderComposerOpenChange = useCallback((itemKey: string, open: boolean) => {
    setReminderComposerTargetKey((current) => {
      if (open) {
        return itemKey;
      }
      return current === itemKey ? null : current;
    });
  }, []);

  const handleSetReminder = useCallback(async (input: { checklistKey: string; label: string; scheduledLocalTime: string }) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignore permission prompt failures and keep the in-app reminder.
      }
    }

    await store.setTaskReminder({
      ...input,
      dayNumber: store.progress.currentDay,
    });

    setReminderComposerTargetKey(null);

    toast({
      title: "Reminder set",
      description: `${input.label} will bring you back to the right step.`,
    });
  }, [store.progress.currentDay, store.setTaskReminder]);

  const handleResumeToday = useCallback(() => {
    const targetKey = resolveChecklistTargetKey();
    if (!targetKey) {
      return;
    }

    focusChecklistItem(targetKey);
  }, [focusChecklistItem, resolveChecklistTargetKey]);

  const handleAskCoachAboutRecovery = useCallback(() => {
    setActiveView('help');
    setPendingPrompt(
      store.progress.currentDay === 0
        ? 'I lost momentum on Prep Day. Tell me what to do first now and what I can ignore.'
        : 'I missed time in the protocol. Should I simply repeat this day or adjust anything? Keep it simple.',
    );
  }, [store.progress.currentDay]);

  const handleAskCoachAboutMaintenance = useCallback(() => {
    setActiveView('help');
    setPendingPrompt('I am finishing Day 21. Turn this into a simple 7-day maintenance plan.');
  }, []);

  const handleCoachAction = useCallback((action: CoachAction) => {
    const resolveShoppingCategoryKey = () => {
      if (action.category) {
        const categoryMatch = findShoppingCategoryMatch(action.category);
        if (categoryMatch) {
          return `${categoryMatch.phase}_${categoryMatch.category.category}`;
        }
      }

      const normalizedPhase = action.phase?.toLowerCase().trim() ?? "";
      let phaseName: string | null = null;

      if (normalizedPhase.includes("week 1") || normalizedPhase.includes("fungal")) {
        phaseName = "Fungal Elimination";
      } else if (normalizedPhase.includes("week 2") || normalizedPhase.includes("parasite")) {
        phaseName = "Parasite Elimination";
      } else if (normalizedPhase.includes("week 3") || normalizedPhase.includes("metal")) {
        phaseName = "Heavy Metal Detox";
      } else if (normalizedPhase.includes("prep") || normalizedPhase.includes("foundation")) {
        phaseName = "Foundation";
      } else if (action.phase) {
        phaseName = SHOPPING_LIST.find((phase) => phase.phase.toLowerCase() === normalizedPhase)?.phase ?? null;
      }

      if (!phaseName) {
        const fallbackPhase = getShoppingPhaseForDay(store.progress.currentDay);
        const fallbackCategory = SHOPPING_LIST.find((phase) => phase.phase === fallbackPhase)?.categories[0];
        if (!fallbackCategory) {
          return null;
        }
        return `${fallbackPhase}_${fallbackCategory.category}`;
      }

      const firstCategory = SHOPPING_LIST.find((phase) => phase.phase === phaseName)?.categories[0];
      if (!firstCategory) {
        return null;
      }

      return `${phaseName}_${firstCategory.category}`;
    };

    const openShoppingWithFocus = () => {
      const focusedKey = resolveShoppingCategoryKey();
      setShoppingDefaultExpandedCategories(focusedKey ? [focusedKey] : []);
      setActiveView("shopping");
    };

    if (action.type === 'open_normal_today') {
      openNormalToday();
      return;
    }

    if (action.type === 'open_shopping') {
      openShoppingWithFocus();
      return;
    }

    if (action.type === 'open_view') {
      if (action.view === 'shopping') {
        openShoppingWithFocus();
        return;
      }
      if (action.view === 'protocol') {
        setActiveView('protocol');
        return;
      }
      if (action.view === 'guide') {
        setActiveView('guide');
        if (!isMobile) {
          setRefOpen(true);
        }
        return;
      }
      if (action.view === 'help') {
        setActiveView('help');
        return;
      }
      if (action.view === 'today') {
        const targetKey = resolveChecklistTargetKey();
        if (targetKey) {
          focusChecklistItem(targetKey);
        } else if (isMobile) {
          setActiveView('today');
        }
      }
      return;
    }

    if (action.type === 'focus_checklist_item') {
      const targetKey = resolveChecklistTargetKey(action.checklistKey);
      if (targetKey) {
        focusChecklistItem(targetKey);
      }
      return;
    }

    if (action.type === 'set_reminder') {
      const targetKey = resolveChecklistTargetKey(action.checklistKey);
      if (targetKey) {
        focusChecklistItem(targetKey, { openReminderComposer: true });
      }
    }
  }, [focusChecklistItem, isMobile, openNormalToday, resolveChecklistTargetKey, store.progress.currentDay]);

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
    setShoppingDefaultExpandedCategories([]);
    setActiveView('shopping');
  };

  const handleOpenFullProtocolFromGuide = () => {
    setActiveView('protocol');
  };

  const handleApplyShoppingActions = async (actions: GutBrainShoppingAction[]) => {
    const added: string[] = [];
    const removed: string[] = [];

    for (const action of actions) {
      const categoryMatch = findShoppingCategoryMatch(action.category);
      const phase = categoryMatch?.phase ?? getShoppingPhaseForDay(store.progress.currentDay);
      const category = categoryMatch?.category.category ?? action.category;

      if (action.type === 'add') {
        const result = await store.addShoppingItem({
          phase,
          category,
          name: action.itemName,
          quantity: action.quantity,
          source: 'ai',
        });

        if (result) {
          added.push(result.name ?? action.itemName);
        }
        continue;
      }

      const result = await store.removeShoppingItem({
        phase,
        category,
        name: action.itemName,
      });

      if (result) {
        removed.push(result.name);
      }
    }

    if (added.length || removed.length) {
      const description = [
        added.length ? `Added: ${added.join(', ')}` : null,
        removed.length ? `Removed: ${removed.join(', ')}` : null,
      ].filter(Boolean).join(' ');

      toast({
        title: "Shopping list updated",
        description,
      });
    }
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
    if (!confirm('Clear the current chat? This cannot be undone.')) {
      return;
    }

    await store.clearEntries();
    toast({
      title: "Cleared",
      description: "Current chat messages have been removed.",
    });
  };

  useEffect(() => {
    if (!focusedChecklistKey) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFocusedChecklistKey((current) => (current === focusedChecklistKey ? null : current));
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [focusedChecklistKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || !store.taskReminders.length) {
      return;
    }

    const fireDueReminders = () => {
      const now = Date.now();

      store.taskReminders
        .filter((reminder) => reminder.active)
        .forEach((reminder) => {
          const scheduled = parseLocalDateTime(reminder.scheduledLocalTime);
          if (!scheduled || scheduled.getTime() > now) {
            return;
          }

          store.markTaskReminderDelivered(reminder.id);

          if (document.visibilityState === 'visible') {
            void openReminderTarget(reminder.checklistKey, reminder.dayNumber);
          }

          toast({
            title: "Time to act",
            description: reminder.label,
          });

          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Time for your next step', {
              body: reminder.label,
            });
            notification.onclick = () => {
              window.focus();
              void openReminderTarget(reminder.checklistKey, reminder.dayNumber);
              notification.close();
            };
          }
        });
    };

    fireDueReminders();
    const interval = window.setInterval(fireDueReminders, 30000);

    return () => window.clearInterval(interval);
  }, [openReminderTarget, store.markTaskReminderDelivered, store.taskReminders]);

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
            taskReminders={store.taskReminders}
            focusedItemKey={focusedChecklistKey}
            reminderComposerTargetKey={reminderComposerTargetKey}
            onReminderComposerOpenChange={handleReminderComposerOpenChange}
            onSetReminder={handleSetReminder}
            onClearReminder={store.clearTaskReminder}
          />
        </aside>

        <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${!isMobile && refOpen ? 'lg:mr-80' : ''} ${isMobile ? 'pb-14' : ''}`}>
          {isMobile ? (
            activeView === 'shopping' ? (
              <ShoppingListView
                currentDay={store.progress.currentDay}
                checklist={store.checklist}
                shoppingOverrides={store.shoppingOverrides}
                onToggle={store.toggleChecklistItem}
                onAddItem={store.addShoppingItem}
                onRemoveItem={store.removeShoppingItem}
                onBack={() => setActiveView('guide')}
                onAskAI={handleShoppingAskAI}
                defaultExpandedCategories={shoppingDefaultExpandedCategories}
              />
            ) : activeView === 'protocol' ? (
              <FullProtocolView
                onBack={() => setActiveView('guide')}
              />
            ) : activeView === 'guide' ? (
              <div className="flex h-full flex-col bg-background">
                <div className="flex-1 overflow-y-auto px-4 py-4 pb-6">
                  <div className="space-y-5">
                    <div className="border-b border-border/50 pb-4">
                      <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">Guide</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Open the shopping list, the full protocol guide, or the quick reference you actually need.
                      </p>
                    </div>
                    <MobileProtocolReferenceContent
                      currentPhase={store.progress.currentPhase}
                      currentDay={store.progress.currentDay}
                      onOpenShoppingView={handleOpenShoppingFromGuide}
                      onOpenFullProtocolView={handleOpenFullProtocolFromGuide}
                      normalTodayAutoOpenSignal={normalTodayAutoOpenSignal}
                    />
                  </div>
                </div>
              </div>
            ) : activeView === 'today' ? (
              <MobileTodayView
                currentDay={store.progress.currentDay}
                currentPhase={store.progress.currentPhase}
                checklist={store.checklist}
                customItems={store.customItems}
                taskReminders={store.taskReminders}
                recoveryState={store.recoveryState}
                maintenanceHandoff={store.maintenanceHandoff}
                focusedItemKey={focusedChecklistKey}
                reminderComposerTargetKey={reminderComposerTargetKey}
                onToggle={store.toggleChecklistItem}
                onRemoveCustomItem={store.removeCustomItem}
                onAskAbout={handleAskAbout}
                onOpenShoppingView={handleOpenShoppingFromGuide}
                onResumeToday={handleResumeToday}
                onAskCoachAboutRecovery={handleAskCoachAboutRecovery}
                onAskCoachAboutMaintenance={handleAskCoachAboutMaintenance}
                onReminderComposerOpenChange={handleReminderComposerOpenChange}
                onSetReminder={handleSetReminder}
                onClearReminder={store.clearTaskReminder}
              />
            ) : (
              <JournalCenter
                userId={store.userId}
                progress={store.progress}
                entries={store.entries}
                threads={store.threads}
                activeThreadId={store.activeThreadId}
                onStartNewChat={store.startNewChat}
                onSelectChatThread={store.selectChatThread}
                onRenameChatThread={store.renameChatThread}
                onAddEntry={store.addJournalEntry}
                onUpdateEntry={store.updateJournalEntry}
                onFinalizeEntry={store.finalizeJournalEntry}
                onApplyShoppingActions={handleApplyShoppingActions}
                onCoachAction={handleCoachAction}
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
              shoppingOverrides={store.shoppingOverrides}
              onToggle={store.toggleChecklistItem}
              onAddItem={store.addShoppingItem}
              onRemoveItem={store.removeShoppingItem}
              onBack={() => setActiveView('help')}
              onAskAI={handleShoppingAskAI}
              defaultExpandedCategories={shoppingDefaultExpandedCategories}
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
              threads={store.threads}
              activeThreadId={store.activeThreadId}
              onStartNewChat={store.startNewChat}
              onSelectChatThread={store.selectChatThread}
              onRenameChatThread={store.renameChatThread}
              onAddEntry={store.addJournalEntry}
              onUpdateEntry={store.updateJournalEntry}
              onFinalizeEntry={store.finalizeJournalEntry}
              onApplyShoppingActions={handleApplyShoppingActions}
              onCoachAction={handleCoachAction}
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
            normalTodayAutoOpenSignal={normalTodayAutoOpenSignal}
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
                activeView === 'today' ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
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
              onClick={() => setActiveView('guide')}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                activeView === 'guide' || activeView === 'shopping' || activeView === 'protocol'
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              )}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] font-medium">Guide</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Protocol;
