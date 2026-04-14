import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, ClipboardList, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JournalCenter } from '@/components/journal/JournalCenter';
import { MobileTodayView } from '@/components/journal/MobileTodayView';
import { NormalTodayView } from '@/components/journal/NormalTodayView';
import { ProtocolRoadmapExplorer } from '@/components/journal/ProtocolRoadmapExplorer';
import { ShoppingListView } from '@/components/journal/ShoppingListView';
import { MobileProtocolReferenceContent } from '@/components/journal/ProtocolReference';
import { TopBar } from '@/components/journal/TopBar';
import { calculatePhase } from '@/hooks/useProtocolData';
import type {
    ChecklistState,
    CustomChecklistItem,
    JournalEntry,
    TaskReminder,
    ShoppingListOverride,
    UserProgress,
} from '@/hooks/useJournalStore';

function makeEntry(day: number, role: 'user' | 'assistant', content: string, minuteOffset: number) {
  return {
    id: `${day}-${role}-${minuteOffset}`,
    dayNumber: day,
    role,
    content,
    createdAt: new Date(Date.UTC(2026, 2, 12, 15, minuteOffset, 0)).toISOString(),
  } satisfies JournalEntry;
}

type CaptureScene = 'prep' | 'today' | 'help' | 'guide';
type ActiveView = 'today' | 'help' | 'shopping' | 'guide' | 'roadmap' | 'normal';

const PREP_EXPANDED_CATEGORIES = [
  'Foundation_Morning Ritual Essentials',
  'Foundation_Liver Support Supplements',
  'Fungal Elimination_Fungal Support Supplements',
];

function normalizeScene(value?: string): CaptureScene {
  if (value === 'prep' || value === 'today' || value === 'help' || value === 'guide') return value;
  if (value === 'chat') return 'help';
  return 'today';
}

function getInitialView(scene: CaptureScene): ActiveView {
  if (scene === 'help') return 'help';
  if (scene === 'guide') return 'guide';
  return 'today';
}

function buildProgress(day: number): UserProgress {
  return {
    currentDay: day,
    currentPhase: calculatePhase(day),
    streakCount: day === 0 ? 0 : Math.max(3, Math.min(day, 9)),
    lastActiveDate: '2026-03-12',
    startDate: '2026-03-01T08:00:00.000Z',
  };
}

function buildChecklist(scene: CaptureScene): ChecklistState {
  if (scene === 'prep') {
    return {
      shopping: true,
      remove_foods: true,
      prep_meals: false,
      organize_supps: true,
      set_intention: false,
    };
  }

  return {
    lemon_salt_water: true,
    breakfast_compliant: true,
    supplements_am: true,
    oregano_oil: true,
    caprylic_acid: true,
    hydration_goal: false,
    lunch_compliant: true,
    supplements_pm: false,
    dinner_compliant: false,
    binder_evening: false,
    no_sugar: true,
    herx_check: false,
    shop_phase3: true,
  };
}

function buildEntries(scene: CaptureScene, day: number): JournalEntry[] {
  if (scene !== 'help') {
    return [];
  }

  return [];
}

function buildCustomItems(scene: CaptureScene): CustomChecklistItem[] {
  if (scene === 'prep') {
    return [{
      key: 'custom_prep_budget',
      label: 'Buy only the must-have starter stack first',
      source: 'ai',
      createdAt: '2026-03-12T15:03:00.000Z',
    }];
  }

  return [{
    key: 'custom_today_hydrate',
    label: 'Finish the second hydration push before dinner',
    source: 'ai',
    createdAt: '2026-03-12T15:04:00.000Z',
  }];
}

function makeReminder(input: {
  id: string;
  dayNumber: number;
  checklistKey: string;
  label: string;
  scheduledLocalTime: string;
}): TaskReminder {
  const scheduledAtUtc = new Date(input.scheduledLocalTime).toISOString();
  return {
    id: input.id,
    userId: null,
    dayNumber: input.dayNumber,
    checklistKey: input.checklistKey,
    label: input.label,
    scheduledLocalTime: input.scheduledLocalTime,
    scheduledAtUtc,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    deliveryChannel: 'local',
    smsEnabled: false,
    deepLinkTarget: '/protocol',
    active: true,
    createdAt: new Date().toISOString(),
    deliveredAt: null,
    lastSentAt: null,
  };
}

function buildCoachDemoSequence(day: number, label: string): JournalEntry[] {
  return [
    makeEntry(
      day,
      'user',
      `I am trying to do "${label}" but I feel bloated, tired, and kind of wired. Did I mess this cleanse up?`,
      2,
    ),
    makeEntry(
      day,
      'assistant',
      `Probably not. Day 4-6 is one of the most common wobble windows. In Week 1 you are breaking up fungal colonies first, so bloat, fatigue, brain fog, and weird cravings can all spike while the body clears waste.

[CLARIFY]
question: What kind of help do you want first?
option: Is this normal?
option: What do I do today?
option: Why does this happen?
[/CLARIFY]`,
      3,
    ),
    makeEntry(
      day,
      'user',
      'What do I do today?',
      4,
    ),
    makeEntry(
      day,
      'assistant',
      `Keep today boring. Do not stack extra detox tricks. Protect the binder window, stay on clean meals, drink real water, and rest more than your ego wants. The win is drainage and consistency, not intensity.

[CLARIFY]
question: Where do you want help next?
option: What can I eat tonight?
option: How do I calm it?
option: Why fungal first?
[/CLARIFY]`,
      5,
    ),
    makeEntry(
      day,
      'user',
      'Why fungal first?',
      6,
    ),
    makeEntry(
      day,
      'assistant',
      `They panic and start changing everything at once. The order matters here: parasites like to hide and lay eggs in fungal colonies, so Week 1 goes after that home base first. If you skip the fungal layer, you can leave the environment that keeps feeding the bigger problem.

[CLARIFY]
question: What do you want help with next?
option: Tell me the red flags
option: What can I eat tonight?
option: How do I calm die-off?
option: Why fungal first?
[/CLARIFY]`,
      7,
    ),
  ];
}

/**
 * Mobile-only Protocol capture page for landing page screenshots.
 * No auth required. Renders the redesigned mobile Protocol UI with sample data.
 * Route: /capture-mobile/:scene (prep | today | help | guide)
 */
export default function ProtocolCaptureMobile() {
  const { scene } = useParams();
  const activeScene = normalizeScene(scene);
  const day = activeScene === 'prep' ? 0 : 5;

  const [progress] = useState<UserProgress>(() => buildProgress(day));
  const [entries, setEntries] = useState<JournalEntry[]>(() => buildEntries(activeScene, day));
  const [checklist, setChecklist] = useState<ChecklistState>(() => buildChecklist(activeScene));
  const [customItems] = useState<CustomChecklistItem[]>(() => buildCustomItems(activeScene));
  const [shoppingOverrides] = useState<ShoppingListOverride[]>([]);
  const [taskReminders, setTaskReminders] = useState<TaskReminder[]>([]);
  const [reminderComposerTargetKey, setReminderComposerTargetKey] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>(() => getInitialView(activeScene));
  const [coachDemoVersion, setCoachDemoVersion] = useState(activeScene === 'help' ? 1 : 0);
  const [coachDemoLabel, setCoachDemoLabel] = useState('Stay hydrated - half body weight in oz');

  const addJournalEntry = async (role: 'user' | 'assistant', content: string) => {
    const entry = makeEntry(progress.currentDay, role, content, entries.length + 5);
    setEntries((prev) => [...prev, entry]);
    return entry;
  };

  const updateEntry = (entryId: string, content: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, content } : entry,
      ),
    );
  };

  const handleAskAbout = (label: string) => {
    setCoachDemoLabel(label);
    setCoachDemoVersion((prev) => prev + 1);
    setActiveView('help');
  };

  useEffect(() => {
    if (activeView !== 'help' || coachDemoVersion === 0) {
      return;
    }

    const sequence = buildCoachDemoSequence(progress.currentDay, coachDemoLabel);
    const timers: number[] = [];

    setEntries([sequence[0]]);

    sequence.slice(1).forEach((entry, index) => {
      timers.push(
        window.setTimeout(() => {
          setEntries(sequence.slice(0, index + 2));
        }, (index + 1) * 650),
      );
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [activeView, coachDemoLabel, coachDemoVersion, progress.currentDay]);

  const handleSetReminder = async (input: {
    checklistKey: string;
    dayNumber: number;
    label: string;
    scheduledLocalTime: string;
  }) => {
    setTaskReminders((prev) => {
      const nextReminder = makeReminder({
        id: `${input.dayNumber}-${input.checklistKey}`,
        dayNumber: input.dayNumber,
        checklistKey: input.checklistKey,
        label: input.label,
        scheduledLocalTime: input.scheduledLocalTime,
      });

      return [
        ...prev.filter((reminder) => !(reminder.dayNumber === input.dayNumber && reminder.checklistKey === input.checklistKey)),
        nextReminder,
      ];
    });
    setReminderComposerTargetKey(null);
  };

  const handleClearReminder = (checklistKey: string, dayNumber: number) => {
    setTaskReminders((prev) => prev.filter((reminder) => !(reminder.dayNumber === dayNumber && reminder.checklistKey === checklistKey)));
    setReminderComposerTargetKey(null);
  };

  return (
    <div data-capture-scene={activeScene} className="h-screen overflow-hidden bg-background flex flex-col">
      <style>{`
        [data-capture-scene] *:focus,
        [data-capture-scene] *:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>

      <TopBar
        progress={progress}
        onPreviousDay={() => undefined}
        onNextDay={() => undefined}
        onSignOut={() => undefined}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-14">
        {activeView === 'shopping' ? (
          <ShoppingListView
            currentDay={progress.currentDay}
            checklist={checklist}
            shoppingOverrides={shoppingOverrides}
            onToggle={(key) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))}
            onAddItem={() => Promise.resolve(null)}
            onRemoveItem={() => Promise.resolve(null)}
            onBack={() => setActiveView('guide')}
            onAskAI={() => setActiveView('help')}
            defaultExpandedCategories={activeScene === 'prep' ? PREP_EXPANDED_CATEGORIES : undefined}
          />
        ) : activeView === 'roadmap' ? (
          <ProtocolRoadmapExplorer
            currentDay={progress.currentDay}
            currentPhase={progress.currentPhase}
            onBack={() => setActiveView('guide')}
            onOpenShoppingView={() => setActiveView('shopping')}
            onAskCoach={() => setActiveView('help')}
            onOpenNormalToday={() => setActiveView('normal')}
          />
        ) : activeView === 'normal' ? (
          <NormalTodayView
            currentDay={progress.currentDay}
            currentPhase={progress.currentPhase}
            onBack={() => setActiveView('guide')}
            onAskCoach={() => setActiveView('help')}
          />
        ) : activeView === 'guide' ? (
          <div className="flex h-full flex-col bg-background">
            <div className="flex-1 overflow-y-auto px-4 py-3.5 pb-6">
              <div className="mb-2">
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">Guide</h2>
              </div>
              <MobileProtocolReferenceContent
                currentPhase={progress.currentPhase}
                currentDay={progress.currentDay}
                onOpenShoppingView={() => setActiveView('shopping')}
                onOpenRoadmapView={() => setActiveView('roadmap')}
                onOpenNormalTodayView={() => setActiveView('normal')}
              />
            </div>
          </div>
        ) : activeView === 'today' ? (
          <MobileTodayView
            currentDay={progress.currentDay}
            currentPhase={progress.currentPhase}
            checklist={checklist}
            customItems={customItems}
            taskReminders={taskReminders}
            recoveryState={null}
            maintenanceHandoff={null}
            reminderComposerTargetKey={reminderComposerTargetKey}
            onToggle={(key) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))}
            onAddCustomItem={() => undefined}
            onRemoveCustomItem={() => undefined}
            onAskAbout={handleAskAbout}
            onOpenShoppingView={() => setActiveView('shopping')}
            onResumeToday={() => undefined}
            onAskCoachAboutRecovery={() => setActiveView('help')}
            onAskCoachAboutMaintenance={() => setActiveView('help')}
            onReminderComposerOpenChange={(itemKey, open) => {
              setReminderComposerTargetKey(open ? itemKey : null);
            }}
            onSetReminder={handleSetReminder}
            onClearReminder={handleClearReminder}
          />
        ) : (
          <JournalCenter
            userId={null}
            progress={progress}
            entries={entries}
            onAddEntry={addJournalEntry}
            onUpdateEntry={updateEntry}
            onFinalizeEntry={updateEntry}
            isMobile={true}
            mobileVariant="help"
          />
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50">
        <div className="grid grid-cols-3 gap-1 px-2 py-1.5">
          <button
            onClick={() => setActiveView('today')}
            className={cn(
              'flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
              activeView === 'today' ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50',
            )}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] font-medium">Today</span>
          </button>

          <button
            onClick={() => setActiveView('help')}
            className={cn(
              'flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
              activeView === 'help' ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50',
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Coach</span>
          </button>

          <button
            onClick={() => setActiveView('guide')}
            className={cn(
              'flex w-full flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
              activeView === 'guide' || activeView === 'shopping' || activeView === 'roadmap' || activeView === 'normal'
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted/50',
            )}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
}
