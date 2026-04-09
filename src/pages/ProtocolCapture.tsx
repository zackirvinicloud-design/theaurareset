import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DailyChecklist } from '@/components/journal/DailyChecklist';
import { JournalCenter } from '@/components/journal/JournalCenter';
import { NormalTodayView } from '@/components/journal/NormalTodayView';
import { ProtocolReference } from '@/components/journal/ProtocolReference';
import { ProtocolRoadmapExplorer } from '@/components/journal/ProtocolRoadmapExplorer';
import { ShoppingListView } from '@/components/journal/ShoppingListView';
import { TopBar } from '@/components/journal/TopBar';
import { calculatePhase } from '@/hooks/useProtocolData';
import type {
  ChecklistState,
  CustomChecklistItem,
  JournalEntry,
  ShoppingListOverride,
  UserProgress,
} from '@/hooks/useJournalStore';

type CaptureScene = 'prep' | 'today' | 'journey';
type ActiveView = 'chat' | 'shopping' | 'roadmap' | 'normal';

const PREP_EXPANDED_CATEGORIES = [
  'Foundation_Morning Ritual Essentials',
  'Foundation_Liver Support Supplements',
  'Fungal Elimination_Fungal Support Supplements',
];

function buildShopKey(phase: string, category: string, index: number) {
  return `shop_${phase}_${category}_${index}`;
}

function makeEntry(day: number, role: 'user' | 'assistant', content: string, minuteOffset: number) {
  return {
    id: `${day}-${role}-${minuteOffset}`,
    dayNumber: day,
    role,
    content,
    createdAt: new Date(Date.UTC(2026, 2, 12, 15, minuteOffset, 0)).toISOString(),
  } satisfies JournalEntry;
}

function normalizeScene(value?: string): CaptureScene {
  if (value === 'prep' || value === 'today' || value === 'journey') return value;
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

function buildChecklist(scene: CaptureScene, day: number): ChecklistState {
  if (scene === 'prep') {
    return {
      shopping: true,
      remove_foods: true,
      prep_meals: false,
      organize_supps: true,
      set_intention: false,
      [buildShopKey('Foundation', 'Morning Ritual Essentials', 0)]: true,
      [buildShopKey('Foundation', 'Liver Support Supplements', 0)]: true,
      [buildShopKey('Fungal Elimination', 'Fungal Support Supplements', 0)]: true,
    };
  }

  if (scene === 'today') {
    return {
      lemon_salt_water: true,
      breakfast_compliant: true,
      supplements_am: true,
      oregano_oil: true,
      caprylic_acid: true,
      hydration_goal: false,
      lunch_compliant: false,
      supplements_pm: false,
      dinner_compliant: false,
      binder_evening: false,
      no_sugar: true,
      herx_check: false,
    };
  }

  if (day >= 15) {
    return {
      lemon_salt_water: true,
      breakfast_compliant: true,
      supplements_am: true,
      hydration_goal: true,
      lunch_compliant: true,
      supplements_pm: true,
      dinner_compliant: true,
      supplements_dinner: true,
      binder_evening: false,
      sleep_routine: false,
      no_sugar: true,
      herx_check: true,
    };
  }

  if (day >= 8) {
    return {
      lemon_salt_water: true,
      breakfast_compliant: true,
      supplements_am: true,
      hydration_goal: true,
      lunch_compliant: true,
      supplements_pm: false,
      dinner_compliant: false,
      supplements_dinner: false,
      binder_evening: false,
      sleep_routine: false,
      no_sugar: true,
      herx_check: true,
      shop_phase3: true,
    };
  }

  return {
    lemon_salt_water: true,
    breakfast_compliant: true,
    supplements_am: true,
    hydration_goal: false,
    lunch_compliant: false,
    supplements_pm: false,
    dinner_compliant: false,
    supplements_dinner: false,
    binder_evening: false,
    sleep_routine: false,
    no_sugar: true,
    herx_check: false,
    shop_phase3: true,
  };
}

function buildEntries(scene: CaptureScene, day: number): JournalEntry[] {
  if (scene === 'prep') {
    return [
      makeEntry(0, 'user', 'Help me simplify what I need to buy now versus later.', 1),
      makeEntry(
        0,
        'assistant',
        'Buy the Foundation and Fungal essentials now. Leave Parasite and Heavy Metal items for their later phases so you do not overbuy up front.',
        2,
      ),
    ];
  }

  if (scene === 'today') {
    return [
      makeEntry(5, 'user', 'Can you explain the binder window in plain English?', 1),
      makeEntry(
        5,
        'assistant',
        'Keep binders at least 2 hours away from meals and supplements. Today, the simplest move is to protect the evening binder window instead of squeezing it in randomly.',
        2,
      ),
    ];
  }

  if (day >= 15) {
    return [
      makeEntry(day, 'user', 'What changes now that I am in the heavy metal phase?', 1),
      makeEntry(
        day,
        'assistant',
        'The workflow stays the same, but the support stack changes. Keep the day calm: heavy metal smoothie, chelators at the right times, hydration, and clean sleep.',
        2,
      ),
    ];
  }

  if (day >= 8) {
    return [
      makeEntry(day, 'user', 'What matters most as I move into the parasite phase?', 1),
      makeEntry(
        day,
        'assistant',
        'Do not reinvent the routine. Keep the foundation habits steady, add the parasite stack on schedule, and log how your body responds instead of guessing.',
        2,
      ),
    ];
  }

  return [
    makeEntry(day, 'user', 'What should I focus on before the phase changes?', 1),
    makeEntry(
      day,
      'assistant',
      'Finish today cleanly, keep sugar out, and use the guide to prep Phase 3 supplies so the transition feels smooth instead of rushed.',
      2,
    ),
  ];
}

function buildCustomItems(scene: CaptureScene): CustomChecklistItem[] {
  if (scene === 'prep') {
    return [
      {
        key: 'custom_prep_budget',
        label: 'Buy only the must-have starter stack first',
        source: 'ai',
        createdAt: '2026-03-12T15:03:00.000Z',
      },
    ];
  }

  if (scene === 'today') {
    return [
      {
        key: 'custom_today_hydrate',
        label: 'Finish the second hydration push before dinner',
        source: 'ai',
        createdAt: '2026-03-12T15:04:00.000Z',
      },
    ];
  }

  return [
    {
      key: 'custom_journey_phase',
      label: 'Check the next phase shopping reminder',
      source: 'ai',
      createdAt: '2026-03-12T15:05:00.000Z',
    },
  ];
}

function initialDayForScene(scene: CaptureScene) {
  if (scene === 'prep') return 0;
  if (scene === 'today') return 5;
  return 7;
}

export default function ProtocolCapture() {
  const { scene } = useParams();
  const activeScene = normalizeScene(scene);
  const startingDay = initialDayForScene(activeScene);

  const [progress, setProgress] = useState<UserProgress>(() => buildProgress(startingDay));
  const [entries, setEntries] = useState<JournalEntry[]>(() => buildEntries(activeScene, startingDay));
  const [checklist, setChecklist] = useState<ChecklistState>(() => buildChecklist(activeScene, startingDay));
  const [customItems, setCustomItems] = useState<CustomChecklistItem[]>(() =>
    buildCustomItems(activeScene)
  );
  const [shoppingOverrides] = useState<ShoppingListOverride[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>(activeScene === 'prep' ? 'shopping' : 'chat');
  const [refOpen, setRefOpen] = useState(activeScene !== 'prep');

  useEffect(() => {
    const day = initialDayForScene(activeScene);
    setProgress(buildProgress(day));
    setEntries(buildEntries(activeScene, day));
    setChecklist(buildChecklist(activeScene, day));
    setCustomItems(buildCustomItems(activeScene));
    setActiveView(activeScene === 'prep' ? 'shopping' : 'chat');
    setRefOpen(activeScene !== 'prep');
  }, [activeScene]);

  useEffect(() => {
    const timers: number[] = [];

    if (activeScene === 'prep') {
      timers.push(
        window.setTimeout(() => {
          setChecklist((prev) => ({
            ...prev,
            [buildShopKey('Foundation', 'Morning Ritual Essentials', 2)]: true,
          }));
        }, 450),
      );
      timers.push(
        window.setTimeout(() => {
          setChecklist((prev) => ({
            ...prev,
            prep_meals: true,
            [buildShopKey('Fungal Elimination', 'Fungal Support Supplements', 1)]: true,
          }));
        }, 950),
      );
      timers.push(
        window.setTimeout(() => {
          setChecklist((prev) => ({
            ...prev,
            set_intention: true,
            [buildShopKey('Foundation', 'Liver Support Supplements', 1)]: true,
          }));
        }, 1400),
      );
    }

    if (activeScene === 'today') {
      timers.push(
        window.setTimeout(() => {
          setChecklist((prev) => ({ ...prev, lunch_compliant: true }));
        }, 400),
      );
      timers.push(
        window.setTimeout(() => {
          setChecklist((prev) => ({ ...prev, hydration_goal: true }));
        }, 800),
      );
      timers.push(
        window.setTimeout(() => {
          setEntries([
            makeEntry(5, 'user', 'How far apart do I space the binder from my probiotic?', 2),
            makeEntry(
              5,
              'assistant',
              'At least 2 hours apart. Take your binder on an empty stomach, then wait 2 hours before food, supplements, or your probiotic. Binders absorb everything nearby — including the good stuff.',
              3,
            ),
            makeEntry(5, 'user', 'I\'m bloated and exhausted on Day 5 — is this normal?', 4),
            makeEntry(
              5,
              'assistant',
              'Completely normal. Days 4–6 are peak die-off. Your body is clearing faster than it can drain. Stay hydrated, take your binders on schedule, and rest. Most people notice a clear shift by Day 7–8.',
              5,
            ),
          ]);
        }, 1200),
      );
      timers.push(
        window.setTimeout(() => {
          setChecklist((prev) => ({ ...prev, supplements_pm: true, binder_evening: true, dinner_compliant: true }));
        }, 1700),
      );
    }

    if (activeScene === 'journey') {
      timers.push(
        window.setTimeout(() => {
          setProgress(buildProgress(8));
          setChecklist(buildChecklist('journey', 8));
          setEntries(buildEntries('journey', 8));
        }, 600),
      );
      timers.push(
        window.setTimeout(() => {
          setProgress(buildProgress(15));
          setChecklist(buildChecklist('journey', 15));
          setEntries(buildEntries('journey', 15));
        }, 1500),
      );
      timers.push(
        window.setTimeout(() => {
          setProgress(buildProgress(18));
          setChecklist(buildChecklist('journey', 18));
          setEntries(buildEntries('journey', 18));
        }, 2500),
      );
      timers.push(
        window.setTimeout(() => {
          setProgress(buildProgress(21));
          setChecklist(buildChecklist('journey', 21));
          setEntries(buildEntries('journey', 21));
        }, 3500),
      );
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [activeScene]);

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
    setActiveView('chat');
    setEntries([
      makeEntry(progress.currentDay, 'user', `Walk me through this step: ${label}.`, 7),
      makeEntry(
        progress.currentDay,
        'assistant',
        `For ${label}, stay simple and literal: follow the checklist timing, use the guide only when you need context, and keep momentum over perfection.`,
        8,
      ),
    ]);
  };

  const handleShoppingAskAI = (prompt: string) => {
    setActiveView('chat');
    setEntries([
      makeEntry(progress.currentDay, 'user', prompt, 9),
      makeEntry(
        progress.currentDay,
        'assistant',
        'Buy the current-phase essentials first, delay later-phase items, and use the optional markers to avoid overspending. The goal is enough to start cleanly, not maximum inventory.',
        10,
      ),
    ]);
  };

  return (
    <div data-capture-scene={activeScene} className="h-screen overflow-hidden bg-background">
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

      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        <aside className="flex w-64 flex-col border-r border-border/50 bg-muted/20">
          <DailyChecklist
            currentDay={progress.currentDay}
            currentPhase={progress.currentPhase}
            checklist={checklist}
            customItems={customItems}
            onToggle={(key) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))}
            onAddCustomItem={(label, source = 'manual') =>
              setCustomItems((prev) => [
                ...prev,
                {
                  key: `${source}-${prev.length + 1}`,
                  label,
                  source,
                  createdAt: new Date().toISOString(),
                },
              ])
            }
            onRemoveCustomItem={(key) =>
              setCustomItems((prev) => prev.filter((item) => item.key !== key))
            }
            onAskAbout={handleAskAbout}
          />
        </aside>

        <main className={`flex min-w-0 flex-1 flex-col overflow-hidden ${refOpen ? 'mr-80' : ''}`}>
          {activeView === 'shopping' ? (
            <ShoppingListView
              currentDay={progress.currentDay}
              checklist={checklist}
              shoppingOverrides={shoppingOverrides}
              onToggle={(key) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))}
              onAddItem={() => Promise.resolve(null)}
              onRemoveItem={() => Promise.resolve(null)}
              onBack={() => setActiveView('chat')}
              onAskAI={handleShoppingAskAI}
              defaultExpandedCategories={PREP_EXPANDED_CATEGORIES}
            />
          ) : activeView === 'roadmap' ? (
            <ProtocolRoadmapExplorer
              currentDay={progress.currentDay}
              currentPhase={progress.currentPhase}
              onBack={() => setActiveView('chat')}
              onOpenShoppingView={() => setActiveView('shopping')}
              onAskCoach={() => setActiveView('chat')}
              onOpenNormalToday={() => setActiveView('normal')}
            />
          ) : activeView === 'normal' ? (
            <NormalTodayView
              currentDay={progress.currentDay}
              currentPhase={progress.currentPhase}
              onBack={() => setActiveView('chat')}
              onAskCoach={() => setActiveView('chat')}
            />
          ) : (
            <JournalCenter
              userId={null}
              progress={progress}
              entries={entries}
              onAddEntry={addJournalEntry}
              onUpdateEntry={updateEntry}
              onFinalizeEntry={updateEntry}
            />
          )}
        </main>

        <ProtocolReference
          currentPhase={progress.currentPhase}
          currentDay={progress.currentDay}
          onOpenShoppingView={() => setActiveView('shopping')}
          onOpenRoadmapView={() => setActiveView('roadmap')}
          onOpenNormalTodayView={() => setActiveView('normal')}
          isOpen={refOpen}
          onToggle={() => setRefOpen((prev) => !prev)}
        />
      </div>
    </div>
  );
}
