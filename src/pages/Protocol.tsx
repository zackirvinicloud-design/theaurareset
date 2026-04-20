import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, ClipboardList, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { findShoppingCategoryMatch, getDayLabel, getShoppingPhaseForDay, SHOPPING_LIST } from "@/hooks/useProtocolData";
import { useGutBrainProfile } from "@/hooks/useGutBrainProfile";
import { useJournalStore } from "@/hooks/useJournalStore";
import { useNotificationSetup } from "@/hooks/useNotificationSetup";
import { useOnboardingProfile } from "@/hooks/useOnboardingProfile";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { useSmsSubscription } from "@/hooks/useSmsSubscription";
import { toast } from "@/hooks/use-toast";
import { getDefaultPostAuthDestination, isEmailVerified } from "@/lib/auth-routing";
import { SMS_REMINDERS_ENABLED, type ReminderDeliveryChannel } from "@/lib/sms";
import { cn } from "@/lib/utils";
import { parseLocalDateTime } from "@/lib/taskReminders";
import { buildRecipeChatContext } from "@/lib/recipes";
import type { CoachAction, GutBrainRecipeCard, GutBrainRecipeLibraryEntry, GutBrainShoppingAction } from "@/lib/gutbrain";

import { TopBar } from "@/components/journal/TopBar";
import { DailyChecklist, buildChecklistViewModel } from "@/components/journal/DailyChecklist";
import { JournalCenter } from "@/components/journal/JournalCenter";
import { MobileTodayView } from "@/components/journal/MobileTodayView";
import { ProfileSettingsView } from "@/components/journal/ProfileSettingsView";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProtocolRoadmapExplorer } from "@/components/journal/ProtocolRoadmapExplorer";
import { ShoppingListView } from "@/components/journal/ShoppingListView";
import { RecipesView } from "@/components/journal/RecipesView";
import { SymptomCenterView } from "@/components/journal/SymptomCenterView";
import { MobileProtocolReferenceContent, ProtocolReference } from "@/components/journal/ProtocolReference";
import { GutBrainLogo } from "@/components/brand/GutBrainLogo";

type ActiveView = 'today' | 'help' | 'shopping' | 'recipes' | 'guide' | 'roadmap' | 'settings' | 'symptoms';

const dedupeList = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

const Protocol = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [pendingDayNavigation, setPendingDayNavigation] = useState<{ targetDay: number } | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('today');
  const [settingsReturnView, setSettingsReturnView] = useState<Exclude<ActiveView, 'settings'>>('today');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isResettingCleanse, setIsResettingCleanse] = useState(false);
  const [focusedChecklistKey, setFocusedChecklistKey] = useState<string | null>(null);
  const [reminderComposerTargetKey, setReminderComposerTargetKey] = useState<string | null>(null);
  const [shoppingDefaultExpandedCategories, setShoppingDefaultExpandedCategories] = useState<string[]>([]);
  const [shoppingFocusRequest, setShoppingFocusRequest] = useState<{ itemKey: string | null; nonce: number } | null>(null);
  const [recipeFocusRequest, setRecipeFocusRequest] = useState<{ recipeKey: string | null; nonce: number } | null>(null);
  const appliedDeepLinkRef = useRef<string | null>(null);
  const backfillPromptShownRef = useRef(false);

  // Journal store (Supabase-backed)
  const store = useJournalStore();
  const currentDay = store.progress.currentDay;
  const currentPhase = store.progress.currentPhase;
  const storeIsLoading = store.isLoading;
  const setCurrentDay = store.setCurrentDay;
  const setTaskReminder = store.setTaskReminder;
  const taskReminders = store.taskReminders;
  const markTaskReminderDelivered = store.markTaskReminderDelivered;
  const gutBrain = useGutBrainProfile(store.userId);
  const onboarding = useOnboardingProfile(store.userId);
  const notifications = useNotificationSetup();
  const pushSubscription = usePushSubscription(store.userId);
  const smsSubscription = useSmsSubscription(store.userId);
  const pushReady = notifications.isEnabled && pushSubscription.pushReady;
  const smsReady = smsSubscription.smsReady;
  const checklistViewModel = useMemo(
    () => buildChecklistViewModel(currentDay, store.checklist, store.customItems),
    [currentDay, store.checklist, store.customItems],
  );
  const mergedCoachProfile = useMemo(() => {
    const supportPreferences = dedupeList([
      onboarding.profile.supportStyle,
      ...gutBrain.profile.supportPreferences,
      ...onboarding.profile.foodPreferences,
    ]);
    const barriers = dedupeList([
      onboarding.profile.primaryBlocker,
      ...gutBrain.profile.barriers,
    ]);
    const healthFocus = dedupeList(onboarding.profile.healthFlags);

    return {
      ...gutBrain.profile,
      preferredName: onboarding.profile.firstName ?? gutBrain.profile.preferredName,
      protocolGoal: onboarding.profile.protocolGoal ?? gutBrain.profile.protocolGoal,
      whyNow: onboarding.profile.whyNow ?? gutBrain.profile.whyNow,
      motivationStyle: onboarding.profile.supportStyle ?? gutBrain.profile.motivationStyle,
      barriers,
      supportPreferences,
      dietPattern: onboarding.profile.dietPattern,
      foodPreferences: onboarding.profile.foodPreferences,
      routineType: onboarding.profile.routineType,
      primaryBlocker: onboarding.profile.primaryBlocker,
      healthFocus,
    };
  }, [gutBrain.profile, onboarding.profile]);
  const recipeChatContext = useMemo(
    () => buildRecipeChatContext(store.recipes, store.progress.currentDay),
    [store.progress.currentDay, store.recipes],
  );
  const recipeLibrary = useMemo<GutBrainRecipeLibraryEntry[]>(
    () => store.recipes.map((recipe) => ({
      key: recipe.key,
      title: recipe.title,
      phase: recipe.phase,
      mealType: recipe.mealType,
    })),
    [store.recipes],
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

  const handleResetCleanse = useCallback(async () => {
    if (isResettingCleanse) {
      return;
    }

    setIsResettingCleanse(true);
    try {
      await store.resetCleanse();
      setActiveView('today');
      toast({
        title: "Cleanse reset",
        description: "Progress, check-ins, reminders, shopping, recipes, and chat history reset to Day 0.",
      });
    } catch (error) {
      console.error("Failed to reset cleanse", error);
      toast({
        title: "Reset failed",
        description: "Your reset request could not be completed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingCleanse(false);
    }
  }, [isResettingCleanse, store]);

  const handleDeleteAccount = useCallback(async () => {
    if (isDeletingAccount) {
      return;
    }

    const confirmed = window.confirm(
      "Delete your account permanently? This removes your profile, journal, check-ins, reminders, and saved progress.",
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) {
        throw error;
      }

      await supabase.auth.signOut();
      toast({
        title: "Account deleted",
        description: "Your Gut Brain Journal account and saved data were removed.",
      });
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to delete account", error);
      toast({
        title: "Delete failed",
        description: "We could not delete your account right now. Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  }, [isDeletingAccount, navigate]);

  const openSettingsView = useCallback(() => {
    if (activeView !== 'settings') {
      setSettingsReturnView(activeView);
    }
    setActiveView('settings');
  }, [activeView]);

  const handleCloseSettings = useCallback(() => {
    setActiveView(settingsReturnView);
  }, [settingsReturnView]);

  const openSymptomHelp = useCallback((prompt?: string) => {
    setActiveView('help');
    if (prompt) {
      setPendingPrompt(prompt);
    }
  }, []);

  const openSymptomHelpFromSymptoms = useCallback((prompt?: string) => {
    openSymptomHelp(prompt);
  }, [openSymptomHelp]);

  const resolveChecklistTargetKey = useCallback((preferredKey?: string | null) => {
    if (preferredKey && checklistViewModel.allItems.some((item) => item.key === preferredKey)) {
      return preferredKey;
    }

    return checklistViewModel.nextItem?.key ?? checklistViewModel.allItems[0]?.key ?? null;
  }, [checklistViewModel.allItems, checklistViewModel.nextItem]);

  const resolveShoppingCategoryKey = useCallback((phaseHint?: string | null, categoryHint?: string | null) => {
    if (categoryHint) {
      const categoryMatch = findShoppingCategoryMatch(categoryHint);
      if (categoryMatch) {
        return `${categoryMatch.phase}_${categoryMatch.category.category}`;
      }
    }

    const normalizedPhase = phaseHint?.toLowerCase().trim() ?? "";
    let phaseName: string | null = null;

    if (normalizedPhase.includes("week 1") || normalizedPhase.includes("fungal")) {
      phaseName = "Week 1 Reset";
    } else if (normalizedPhase.includes("week 2") || normalizedPhase.includes("parasite")) {
      phaseName = "Week 2 Support";
    } else if (normalizedPhase.includes("week 3") || normalizedPhase.includes("metal")) {
      phaseName = "Week 3 Finish";
    } else if (normalizedPhase.includes("prep") || normalizedPhase.includes("foundation")) {
      phaseName = "Foundation";
    } else if (phaseHint) {
      phaseName = SHOPPING_LIST.find((phase) => phase.phase.toLowerCase() === normalizedPhase)?.phase ?? null;
    }

    if (!phaseName) {
      const fallbackPhase = getShoppingPhaseForDay(currentDay);
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
  }, [currentDay]);

  const openShoppingWithFocus = useCallback((phaseHint?: string | null, categoryHint?: string | null, itemKey?: string | null) => {
    const focusedKey = resolveShoppingCategoryKey(phaseHint, categoryHint);
    setShoppingDefaultExpandedCategories(focusedKey ? [focusedKey] : []);
    if (itemKey) {
      setShoppingFocusRequest({ itemKey, nonce: Date.now() });
    }
    setActiveView("shopping");
  }, [resolveShoppingCategoryKey]);

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
      && reminderDayNumber !== currentDay
      && reminderDayNumber >= 0
      && reminderDayNumber <= 21
    ) {
      await setCurrentDay(reminderDayNumber);
    }

    focusChecklistItem(itemKey);
  }, [currentDay, focusChecklistItem, setCurrentDay]);

  const handleReminderComposerOpenChange = useCallback((itemKey: string, open: boolean) => {
    setReminderComposerTargetKey((current) => {
      if (open) {
        return itemKey;
      }
      return current === itemKey ? null : current;
    });
  }, []);

  const handleSetReminder = useCallback(async (input: {
    checklistKey: string;
    dayNumber: number;
    label: string;
    scheduledLocalTime: string;
    deliveryChannel?: ReminderDeliveryChannel;
    deepLinkTarget?: string;
  }) => {
    if (
      (input.deliveryChannel ?? 'local') === 'local'
      && typeof window !== 'undefined'
      && 'Notification' in window
      && Notification.permission === 'default'
    ) {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignore permission prompt failures and keep the in-app reminder.
      }
    }

    await setTaskReminder({
      ...input,
    });

    setReminderComposerTargetKey(null);

    toast({
      title: "Reminder set",
      description: (input.deliveryChannel ?? 'local') === 'sms'
        ? `${input.label} will text you with a direct link back to this step.`
        : (input.deliveryChannel ?? 'local') === 'push'
          ? `${input.label} will ping this phone even when the app is closed.`
          : SMS_REMINDERS_ENABLED
            ? `${input.label} is saved in-app. Turn on text reminders if you want closed-app nudges.`
            : `${input.label} is saved in-app. Add Gut Brain to your Home Screen and enable push reminders if you want closed-app nudges.`,
    });
  }, [setTaskReminder]);

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
    if (action.type === 'open_normal_today') {
      const targetKey = resolveChecklistTargetKey();
      if (targetKey) {
        focusChecklistItem(targetKey);
      } else if (isMobile) {
        setActiveView('today');
      }
      return;
    }

    if (action.type === 'open_shopping') {
      openShoppingWithFocus(action.phase, action.category);
      return;
    }

    if (action.type === 'open_view') {
      if (action.view === 'shopping') {
        openShoppingWithFocus(action.phase, action.category);
        return;
      }
      if (action.view === 'recipes') {
        setActiveView('recipes');
        return;
      }
      if (action.view === 'symptoms') {
        setActiveView('symptoms');
        return;
      }
      if (action.view === 'protocol') {
        setActiveView('guide');
        if (!isMobile) {
          setRefOpen(true);
        }
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
        if (/support|symptom|normal/i.test(action.label.toLowerCase())) {
          openSymptomHelp();
          return;
        }
        setActiveView('help');
        return;
      }
      if (action.view === 'today') {
        const targetKey = resolveChecklistTargetKey();
        if (targetKey) {
          focusChecklistItem(targetKey);
        }
        if (isMobile) {
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
  }, [focusChecklistItem, isMobile, openShoppingWithFocus, openSymptomHelp, resolveChecklistTargetKey]);

  const handlePreviousDay = async () => {
    const targetDay = Math.max(store.progress.currentDay - 1, 0);
    if (targetDay === store.progress.currentDay) return;
    setPendingDayNavigation({ targetDay });
  };

  const handleNextDay = async () => {
    const targetDay = Math.min(store.progress.currentDay + 1, 21);
    if (targetDay === store.progress.currentDay) return;
    setPendingDayNavigation({ targetDay });
  };

  const handleConfirmDayChange = useCallback(async () => {
    if (!pendingDayNavigation) {
      return;
    }

    const targetDay = pendingDayNavigation.targetDay;
    setPendingDayNavigation(null);
    await store.setCurrentDay(targetDay);
    toast({
      title: "Day updated",
      description: `Now on ${getDayLabel(targetDay)}`,
    });
  }, [pendingDayNavigation, store]);

  const handleCancelDayChange = useCallback(() => {
    setPendingDayNavigation(null);
  }, []);

  const pendingDayChangeLabel = pendingDayNavigation
    ? {
        sourceLabel: getDayLabel(store.progress.currentDay),
        targetLabel: getDayLabel(pendingDayNavigation.targetDay),
      }
    : null;

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

  const handleOpenRecipesFromGuide = () => {
    setActiveView('recipes');
  };

  const handleRecipeAskAI = (prompt: string) => {
    setActiveView('help');
    setPendingPrompt(prompt);
  };

  const handleOpenShoppingForPhase = useCallback((phaseName: string) => {
    const firstCategory = SHOPPING_LIST.find((phase) => phase.phase === phaseName)?.categories[0];
    setShoppingDefaultExpandedCategories(firstCategory ? [`${phaseName}_${firstCategory.category}`] : []);
    setActiveView('shopping');
  }, []);

  const handleOpenRoadmapFromGuide = () => {
    setActiveView('roadmap');
  };

  const handleOpenSymptomsFromGuide = () => {
    setActiveView('symptoms');
  };

  const handleSaveProfileSettings = useCallback(async (
    updates: Parameters<typeof onboarding.saveProfile>[0],
    options?: Parameters<typeof onboarding.saveProfile>[1],
  ) => {
    await onboarding.saveProfile(updates, options);
    toast({
      title: "Profile saved",
      description: "GutBrain will use this immediately in the next reply.",
    });
  }, [onboarding]);

  const handleOpenNotificationsSetup = useCallback(() => {
    const params = new URLSearchParams();
    params.set('redirect', '/protocol');
    params.set('source', 'settings');
    navigate(`/setup/notifications?${params.toString()}`);
  }, [navigate]);

  const handleAskCoachFromRoadmap = (prompt: string) => {
    setActiveView('help');
    setPendingPrompt(prompt);
  };

  const handleApplyShoppingActions = useCallback(async (actions: GutBrainShoppingAction[]) => {
    const added: string[] = [];
    const removed: string[] = [];
    let focusPhase: string | null = null;
    let focusCategory: string | null = null;
    let focusItemKey: string | null = null;

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
          focusPhase = result.phase;
          focusCategory = result.category;
          focusItemKey = result.key;
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
        focusPhase = result.phase;
        focusCategory = result.category;
      }
    }

    if (focusPhase && focusCategory) {
      openShoppingWithFocus(focusPhase, focusCategory, focusItemKey);
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
  }, [openShoppingWithFocus, store.addShoppingItem, store.progress.currentDay, store.removeShoppingItem]);

  const handleOpenRecipeFromChat = useCallback((recipe: GutBrainRecipeCard) => {
    setRecipeFocusRequest({
      recipeKey: recipe.existingRecipeKey ?? recipe.title,
      nonce: Date.now(),
    });
    setActiveView('recipes');
  }, []);

  const handleApplyRecipeActions = useCallback(async (actions: GutBrainRecipeCard[]) => {
    const savedRecipes: string[] = [];
    let focusRecipeKey: string | null = null;

    for (const action of actions) {
      if (action.type !== 'add' || action.status !== 'addable') {
        continue;
      }

      const result = await store.addRecipe({
        title: action.title,
        phase: action.phase,
        mealType: action.mealType,
        summary: action.summary,
        ingredients: action.ingredients,
        instructions: action.instructions,
        notes: action.notes,
        source: 'ai',
      });

      if (result) {
        savedRecipes.push(result.title);
        focusRecipeKey = result.key;
      }
    }

    if (focusRecipeKey) {
      setRecipeFocusRequest({
        recipeKey: focusRecipeKey,
        nonce: Date.now(),
      });
      setActiveView('recipes');
    }

    if (savedRecipes.length) {
      toast({
        title: "Recipe saved",
        description: savedRecipes.join(', '),
      });
    }
  }, [store.addRecipe]);

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
    if (typeof window === 'undefined' || !taskReminders.length) {
      return;
    }

    const fireDueReminders = () => {
      const now = Date.now();

      taskReminders
        .filter((reminder) => reminder.active && reminder.deliveryChannel === 'local')
        .forEach((reminder) => {
          const scheduled = reminder.scheduledAtUtc
            ? new Date(reminder.scheduledAtUtc)
            : parseLocalDateTime(reminder.scheduledLocalTime);
          if (!scheduled || scheduled.getTime() > now) {
            return;
          }

          void markTaskReminderDelivered(reminder.id);

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
  }, [markTaskReminderDelivered, openReminderTarget, taskReminders]);

  useEffect(() => {
    if (
      backfillPromptShownRef.current
      || !hasAccess
      || isAuthLoading
      || storeIsLoading
      || onboarding.isLoading
      || !store.userId
      || onboarding.hasCompletedOnboarding
    ) {
      return;
    }

    backfillPromptShownRef.current = true;
    toast({
      title: "Finish your profile",
      description: "Open Edit profile in settings so GutBrain can tailor meals, shopping, and support to you.",
    });
  }, [hasAccess, isAuthLoading, onboarding.hasCompletedOnboarding, onboarding.isLoading, store.userId, storeIsLoading]);

  useEffect(() => {
    if (isAuthLoading || storeIsLoading || !hasAccess) {
      return;
    }

    if (appliedDeepLinkRef.current === location.search) {
      return;
    }
    appliedDeepLinkRef.current = location.search;

    const params = new URLSearchParams(location.search);
    if (!params.toString()) {
      return;
    }

    const applyDeepLink = async () => {
      const rawDay = params.get('day');
      const targetDay = rawDay !== null ? Number.parseInt(rawDay, 10) : null;
      if (typeof targetDay === 'number' && Number.isFinite(targetDay) && targetDay >= 0 && targetDay <= 21 && targetDay !== currentDay) {
        await setCurrentDay(targetDay);
      }

      const view = params.get('view');
      const checklistKey = params.get('checklistKey');
      const phase = params.get('phase');
      const category = params.get('category');

      if (view === 'shopping') {
        openShoppingWithFocus(phase, category);
        return;
      }

      if (view === 'recipes') {
        setActiveView('recipes');
        return;
      }

      if (view === 'normal') {
        const targetKey = resolveChecklistTargetKey();
        if (targetKey) {
          focusChecklistItem(targetKey);
        }
        if (isMobile) {
          setActiveView('today');
        }
        return;
      }

      if (view === 'symptoms') {
        setActiveView('symptoms');
        return;
      }

      if (view === 'roadmap') {
        setActiveView('roadmap');
        return;
      }

      if (view === 'guide') {
        setActiveView('guide');
        if (!isMobile) {
          setRefOpen(true);
        }
        return;
      }

      if (view === 'help') {
        setActiveView('help');
        return;
      }

      if (checklistKey) {
        focusChecklistItem(checklistKey);
        return;
      }

      if (view === 'today') {
        const targetKey = resolveChecklistTargetKey();
        if (targetKey) {
          focusChecklistItem(targetKey);
        }
        if (isMobile) {
          setActiveView('today');
        }
      }
    };

    void applyDeepLink();
  }, [
    focusChecklistItem,
    hasAccess,
    isAuthLoading,
    isMobile,
    location.search,
    openShoppingWithFocus,
    openSymptomHelp,
    resolveChecklistTargetKey,
    setCurrentDay,
    storeIsLoading,
    currentDay,
  ]);

  // Loading states
  if (isAuthLoading || storeIsLoading) {
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
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
        <TopBar
          progress={store.progress}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onOpenSettings={openSettingsView}
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
            currentDay={currentDay}
            currentPhase={currentPhase}
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
            pushReady={pushReady}
            smsReady={smsReady}
          />
        </aside>

        <main
          className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${!isMobile && refOpen && activeView !== 'settings' ? 'lg:mr-80' : ''}`}
            style={isMobile ? { paddingBottom: "4.5rem" } : undefined}
          >
          {isMobile ? (
            activeView === 'settings' ? (
              <ProfileSettingsView
                profile={onboarding.profile}
                isProfileLoading={onboarding.isLoading}
                isProfileSaving={onboarding.isSaving}
                notificationPermission={notifications.permission}
                notificationNeedsInstall={notifications.needsIosInstall}
                pushReady={pushReady}
                onSaveProfile={handleSaveProfileSettings}
                onOpenNotificationsSetup={handleOpenNotificationsSetup}
                onDeleteAccount={handleDeleteAccount}
                isDeletingAccount={isDeletingAccount}
                onResetCleanse={handleResetCleanse}
                isResettingCleanse={isResettingCleanse}
                onBack={handleCloseSettings}
              />
            ) : activeView === 'shopping' ? (
              <ShoppingListView
                currentDay={currentDay}
                checklist={store.checklist}
                shoppingOverrides={store.shoppingOverrides}
                onToggle={store.toggleChecklistItem}
                onAddItem={store.addShoppingItem}
              onRemoveItem={store.removeShoppingItem}
              onBack={() => setActiveView('guide')}
              onAskAI={handleShoppingAskAI}
              defaultExpandedCategories={shoppingDefaultExpandedCategories}
              focusItemKey={shoppingFocusRequest?.itemKey ?? null}
              focusNonce={shoppingFocusRequest?.nonce ?? 0}
            />
          ) : activeView === 'recipes' ? (
            <RecipesView
              currentDay={currentDay}
              recipeOverrides={store.recipeOverrides}
                onAddRecipe={store.addRecipe}
              onRemoveRecipe={store.removeRecipe}
              onAskAI={handleRecipeAskAI}
              onBack={() => setActiveView('guide')}
              focusRecipeKey={recipeFocusRequest?.recipeKey ?? null}
              focusNonce={recipeFocusRequest?.nonce ?? 0}
            />
            ) : activeView === 'roadmap' ? (
              <ProtocolRoadmapExplorer
                currentDay={currentDay}
                currentPhase={currentPhase}
                onBack={() => setActiveView('guide')}
                onOpenShoppingView={handleOpenShoppingForPhase}
                onAskCoach={handleAskCoachFromRoadmap}
              />
            ) : activeView === 'symptoms' ? (
              <SymptomCenterView
                currentDay={currentDay}
                currentPhase={currentPhase}
                symptoms={store.symptoms}
                symptomCheckins={store.symptomCheckins}
                onBack={() => setActiveView('guide')}
                onAskCoachPrompt={openSymptomHelpFromSymptoms}
                onLogSymptomCheckin={store.logSymptomCheckin}
                onLoadSymptomRange={store.loadSymptomRange}
              />
            ) : activeView === 'guide' ? (
              <div className="flex h-full flex-col bg-background">
                <div className="flex-1 overflow-y-auto px-4 py-3.5 pb-6">
                  <div className="mb-2">
                    <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">Guide</h2>
                  </div>
                  <MobileProtocolReferenceContent
                    currentPhase={store.progress.currentPhase}
                    currentDay={currentDay}
                    onOpenShoppingView={handleOpenShoppingFromGuide}
                    onOpenRecipesView={handleOpenRecipesFromGuide}
                    onOpenRoadmapView={handleOpenRoadmapFromGuide}
                    onOpenSymptomsView={handleOpenSymptomsFromGuide}
                  />
                </div>
              </div>
            ) : activeView === 'today' ? (
              <MobileTodayView
                currentDay={currentDay}
                currentPhase={currentPhase}
                checklist={store.checklist}
                customItems={store.customItems}
                taskReminders={store.taskReminders}
                recoveryState={store.recoveryState}
                maintenanceHandoff={store.maintenanceHandoff}
                focusedItemKey={focusedChecklistKey}
                reminderComposerTargetKey={reminderComposerTargetKey}
                onToggle={store.toggleChecklistItem}
                onAddCustomItem={store.addCustomItem}
                onRemoveCustomItem={store.removeCustomItem}
                onAskAbout={handleAskAbout}
                onOpenShoppingView={handleOpenShoppingFromGuide}
                onResumeToday={handleResumeToday}
                onAskCoachAboutRecovery={handleAskCoachAboutRecovery}
                onAskCoachAboutMaintenance={handleAskCoachAboutMaintenance}
                onReminderComposerOpenChange={handleReminderComposerOpenChange}
                onSetReminder={handleSetReminder}
                onClearReminder={store.clearTaskReminder}
                pushReady={pushReady}
                smsReady={smsReady}
              />
            ) : (
              <JournalCenter
                userId={store.userId}
                progress={store.progress}
                entries={store.entries}
                brainProfile={mergedCoachProfile}
                brainSnapshot={gutBrain.snapshot}
                symptoms={store.symptoms}
                onRefreshBrain={gutBrain.refreshBrain}
                threads={store.threads}
                activeThreadId={store.activeThreadId}
                onStartNewChat={store.startNewChat}
                onSelectChatThread={store.selectChatThread}
                onRenameChatThread={store.renameChatThread}
                onAddEntry={store.addJournalEntry}
                onUpdateEntry={store.updateJournalEntry}
                onFinalizeEntry={store.finalizeJournalEntry}
                onApplyShoppingActions={handleApplyShoppingActions}
                onApplyRecipeActions={handleApplyRecipeActions}
                onOpenRecipeCard={handleOpenRecipeFromChat}
                onCoachAction={handleCoachAction}
                recipeContext={recipeChatContext}
                recipeLibrary={recipeLibrary}
                pendingPrompt={pendingPrompt}
                onPendingPromptConsumed={() => setPendingPrompt(null)}
                isMobile={true}
                mobileVariant="help"
              />
            )
          ) : activeView === 'settings' ? (
            <ProfileSettingsView
              profile={onboarding.profile}
              isProfileLoading={onboarding.isLoading}
              isProfileSaving={onboarding.isSaving}
              notificationPermission={notifications.permission}
              notificationNeedsInstall={notifications.needsIosInstall}
              pushReady={pushReady}
              onSaveProfile={handleSaveProfileSettings}
                onOpenNotificationsSetup={handleOpenNotificationsSetup}
                onDeleteAccount={handleDeleteAccount}
                isDeletingAccount={isDeletingAccount}
                onResetCleanse={handleResetCleanse}
                isResettingCleanse={isResettingCleanse}
                onBack={handleCloseSettings}
              />
            ) : activeView === 'shopping' ? (
            <ShoppingListView
              currentDay={currentDay}
              checklist={store.checklist}
              shoppingOverrides={store.shoppingOverrides}
              onToggle={store.toggleChecklistItem}
              onAddItem={store.addShoppingItem}
              onRemoveItem={store.removeShoppingItem}
              onBack={() => setActiveView('help')}
              onAskAI={handleShoppingAskAI}
              defaultExpandedCategories={shoppingDefaultExpandedCategories}
              focusItemKey={shoppingFocusRequest?.itemKey ?? null}
              focusNonce={shoppingFocusRequest?.nonce ?? 0}
            />
          ) : activeView === 'recipes' ? (
            <RecipesView
              currentDay={currentDay}
              recipeOverrides={store.recipeOverrides}
              onAddRecipe={store.addRecipe}
              onRemoveRecipe={store.removeRecipe}
              onAskAI={handleRecipeAskAI}
              onBack={() => setActiveView('help')}
              focusRecipeKey={recipeFocusRequest?.recipeKey ?? null}
              focusNonce={recipeFocusRequest?.nonce ?? 0}
            />
          ) : activeView === 'roadmap' ? (
            <ProtocolRoadmapExplorer
              currentDay={currentDay}
              currentPhase={currentPhase}
              onBack={() => setActiveView('help')}
              onOpenShoppingView={handleOpenShoppingForPhase}
              onAskCoach={handleAskCoachFromRoadmap}
            />
            ) : activeView === 'symptoms' ? (
              <SymptomCenterView
                currentDay={currentDay}
                currentPhase={currentPhase}
                symptoms={store.symptoms}
                symptomCheckins={store.symptomCheckins}
                onBack={() => setActiveView('help')}
                onAskCoachPrompt={openSymptomHelpFromSymptoms}
                onLogSymptomCheckin={store.logSymptomCheckin}
                onLoadSymptomRange={store.loadSymptomRange}
              />
            ) : (
            <JournalCenter
              userId={store.userId}
              progress={store.progress}
              entries={store.entries}
              brainProfile={mergedCoachProfile}
              brainSnapshot={gutBrain.snapshot}
              symptoms={store.symptoms}
              onRefreshBrain={gutBrain.refreshBrain}
              threads={store.threads}
              activeThreadId={store.activeThreadId}
              onStartNewChat={store.startNewChat}
              onSelectChatThread={store.selectChatThread}
              onRenameChatThread={store.renameChatThread}
              onAddEntry={store.addJournalEntry}
              onUpdateEntry={store.updateJournalEntry}
              onFinalizeEntry={store.finalizeJournalEntry}
              onApplyShoppingActions={handleApplyShoppingActions}
              onApplyRecipeActions={handleApplyRecipeActions}
              onOpenRecipeCard={handleOpenRecipeFromChat}
              onCoachAction={handleCoachAction}
              recipeContext={recipeChatContext}
              recipeLibrary={recipeLibrary}
              pendingPrompt={pendingPrompt}
              onPendingPromptConsumed={() => setPendingPrompt(null)}
              isMobile={false}
            />
          )}
        </main>

        {/* ── Right: Protocol Reference (desktop) ── */}
        {!isMobile && activeView !== 'settings' && (
          <ProtocolReference
            currentPhase={store.progress.currentPhase}
            currentDay={store.progress.currentDay}
            onOpenShoppingView={handleOpenShoppingFromGuide}
            onOpenRecipesView={handleOpenRecipesFromGuide}
            onOpenRoadmapView={handleOpenRoadmapFromGuide}
            onOpenSymptomsView={handleOpenSymptomsFromGuide}
            isOpen={refOpen}
            onToggle={() => setRefOpen(prev => !prev)}
          />
        )}
      </div>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 pb-2">
          <div data-tour="mobile-resource-nav" className="h-16 grid grid-cols-3 gap-1 px-2 pt-1">
            <button
              data-tour="mobile-plan-nav"
              onClick={() => setActiveView('today')}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-0.5 px-2 rounded-lg transition-colors",
                activeView === 'today' ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              )}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[11px] font-medium">Plan</span>
            </button>

            <button
              onClick={() => setActiveView('help')}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-0.5 px-2 rounded-lg transition-colors",
                activeView === 'help' ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
              )}
            >
              <GutBrainLogo className="h-5 w-5 rounded-sm" />
              <span className="text-[11px] font-medium">GutBrain</span>
            </button>

            <button
              onClick={() => setActiveView('guide')}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-0.5 px-2 rounded-lg transition-colors",
                activeView === 'guide' || activeView === 'shopping' || activeView === 'recipes' || activeView === 'roadmap' || activeView === 'symptoms'
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              )}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[11px] font-medium">Guide</span>
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={Boolean(pendingDayChangeLabel)} onOpenChange={(open) => {
        if (!open) {
          handleCancelDayChange();
        }
      }}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Move day?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDayChangeLabel
                ? `You're on ${pendingDayChangeLabel.sourceLabel}.`
                : 'Ready to move to the new day?'}
              {pendingDayChangeLabel ? ` Go to ${pendingDayChangeLabel.targetLabel}.` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDayChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDayChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Protocol;
