import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, Search, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDayLabel } from '@/hooks/useProtocolData';
import { getNormalToday } from '@/hooks/normalToday';
import { SYMPTOMS } from '@/hooks/symptomData';
import {
  rankSymptomSearch,
  type SymptomCheckin,
  type SymptomCheckinInput,
  type SymptomCheckinItemInput,
} from '@/lib/symptom-center';
import { cn } from '@/lib/utils';

type SymptomCenterTab = 'log' | 'normal';

interface SelectedSymptom {
  symptomKey: string;
  symptomLabel: string;
  category: string;
  isCustom?: boolean;
}

interface SymptomCenterViewProps {
  currentDay: number;
  currentPhase: number;
  symptoms: string[];
  symptomCheckins: SymptomCheckin[];
  initialTab?: SymptomCenterTab;
  onBack: () => void;
  onAskCoachPrompt?: (prompt: string) => void;
  onLogSymptomCheckin: (input: SymptomCheckinInput) => Promise<SymptomCheckin | null>;
  onLoadSymptomRange: (startDay?: number, endDay?: number) => Promise<unknown>;
  onGetSymptomCoachFollowup: (checkin: SymptomCheckin) => {
    interpretation: string;
    nextAction: string;
    coachPrompt: string;
  };
}

function GuidanceBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'expected' | 'caution' | 'ignore';
}) {
  return (
    <section
      className={cn(
        'rounded-xl border px-3 py-3',
        tone === 'expected' && 'border-primary/20 bg-primary/[0.03]',
        tone === 'caution' && 'border-rose-500/30 bg-rose-500/[0.04]',
        tone === 'ignore' && 'border-border/60 bg-muted/20',
      )}
    >
      <p
        className={cn(
          'text-xs font-semibold uppercase tracking-[0.11em]',
          tone === 'expected' && 'text-primary',
          tone === 'caution' && 'text-rose-500',
          tone === 'ignore' && 'text-muted-foreground',
        )}
      >
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-foreground/90">
            • {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SymptomCenterView({
  currentDay,
  currentPhase: _currentPhase,
  symptoms,
  symptomCheckins,
  initialTab = 'log',
  onBack,
  onAskCoachPrompt,
  onLogSymptomCheckin,
  onLoadSymptomRange,
  onGetSymptomCoachFollowup,
}: SymptomCenterViewProps) {
  const [activeTab, setActiveTab] = useState<SymptomCenterTab>(initialTab);
  const [search, setSearch] = useState('');
  const [customSymptomLabel, setCustomSymptomLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [gutState, setGutState] = useState(5);
  const [note, setNote] = useState('');
  const [followup, setFollowup] = useState<{
    interpretation: string;
    nextAction: string;
    coachPrompt: string;
  } | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, SelectedSymptom>>({});

  const dayLabel = getDayLabel(currentDay);
  const normalToday = getNormalToday(currentDay);

  const symptomByKey = useMemo(
    () => new Map(SYMPTOMS.map((symptom) => [symptom.key.toLowerCase(), symptom])),
    [],
  );

  const recentKeys = useMemo(() => {
    const fromCheckins = symptomCheckins
      .slice(0, 20)
      .flatMap((checkin) => checkin.items.map((item) => item.symptomKey.toLowerCase()));

    return Array.from(new Set([...symptoms.map((key) => key.toLowerCase()), ...fromCheckins]));
  }, [symptomCheckins, symptoms]);

  const quickSymptoms = useMemo(() => {
    const query = search.trim();

    if (query) {
      return rankSymptomSearch(SYMPTOMS, query, recentKeys).slice(0, 14);
    }

    const recents = recentKeys
      .map((key) => symptomByKey.get(key))
      .filter((symptom): symptom is NonNullable<typeof symptom> => Boolean(symptom));

    const seen = new Set(recents.map((symptom) => symptom.key));
    const fallback = SYMPTOMS.filter((symptom) => !seen.has(symptom.key));

    return [...recents, ...fallback].slice(0, 14);
  }, [recentKeys, search, symptomByKey]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    void onLoadSymptomRange(Math.max(currentDay - 20, 0), currentDay);
  }, [currentDay, onLoadSymptomRange]);

  const toggleSymptom = (symptomKey: string, symptomLabel: string, category: string, isCustom = false) => {
    setSelectedSymptoms((prev) => {
      if (prev[symptomKey]) {
        const next = { ...prev };
        delete next[symptomKey];
        return next;
      }

      return {
        ...prev,
        [symptomKey]: {
          symptomKey,
          symptomLabel,
          category,
          isCustom,
        },
      };
    });
  };

  const addCustomSymptom = () => {
    const label = customSymptomLabel.trim();
    if (!label) {
      return;
    }

    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `custom_${Date.now()}`;
    toggleSymptom(key, label, 'custom', true);
    setCustomSymptomLabel('');
  };

  const saveCheckin = async () => {
    const items: SymptomCheckinItemInput[] = Object.values(selectedSymptoms).map((item) => ({
      symptomKey: item.symptomKey,
      symptomLabel: item.symptomLabel,
      category: item.category,
      isCustom: item.isCustom,
    }));

    if (!items.length) {
      return;
    }

    setSaving(true);

    try {
      const saved = await onLogSymptomCheckin({
        dayNumber: currentDay,
        gutState,
        note: note.trim() || null,
        items,
        factors: null,
      });

      if (saved) {
        setFollowup(onGetSymptomCoachFollowup(saved));
        setSelectedSymptoms({});
        setCustomSymptomLabel('');
        setNote('');
      }

      void onLoadSymptomRange(Math.max(currentDay - 20, 0), currentDay);
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = Object.keys(selectedSymptoms).length;

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-shrink-0 border-b border-border/50 px-3 py-3 sm:px-4 lg:px-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-foreground sm:text-[24px]">
              Symptom center
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{dayLabel}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SymptomCenterTab)}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/40 p-1">
              <TabsTrigger value="log" className="rounded-lg text-sm">
                Log
              </TabsTrigger>
              <TabsTrigger value="normal" className="rounded-lg text-sm">
                Normal today
              </TabsTrigger>
            </TabsList>

            <TabsContent value="log" className="mt-3 space-y-3">
              <Card className="rounded-2xl border-border/60 bg-card/85">
                <CardHeader className="space-y-1.5 pb-3">
                  <CardTitle className="text-base">Quick check-in</CardTitle>
                  <p className="text-sm text-muted-foreground">Pick symptoms, save, and ask GutBrain if needed.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-foreground">Gut state</p>
                      <p className="text-xs text-muted-foreground">{gutState}/10</p>
                    </div>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[gutState]}
                      onValueChange={(next) => setGutState(next[0] ?? gutState)}
                    />
                  </div>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search symptoms"
                      className="rounded-xl pl-9"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickSymptoms.map((symptom) => {
                      const isActive = Boolean(selectedSymptoms[symptom.key]);

                      return (
                        <button
                          key={symptom.key}
                          type="button"
                          onClick={() => toggleSymptom(symptom.key, symptom.label, symptom.category)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-sm transition-colors',
                            isActive
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border/60 bg-background text-muted-foreground hover:bg-muted/30',
                          )}
                        >
                          {symptom.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={customSymptomLabel}
                      onChange={(event) => setCustomSymptomLabel(event.target.value)}
                      placeholder="Add custom symptom"
                      className="rounded-xl"
                    />
                    <Button type="button" variant="outline" className="rounded-xl" onClick={addCustomSymptom}>
                      Add
                    </Button>
                  </div>

                  {selectedCount > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Selected ({selectedCount})</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(selectedSymptoms).map((item) => (
                          <button
                            key={item.symptomKey}
                            type="button"
                            onClick={() => toggleSymptom(item.symptomKey, item.symptomLabel, item.category, item.isCustom)}
                            className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {item.symptomLabel} ×
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Optional note"
                    className="rounded-xl"
                  />

                  <Button className="h-10 w-full rounded-xl" disabled={saving || selectedCount === 0} onClick={saveCheckin}>
                    <Save className="mr-2 h-4 w-4" />
                    Save check-in
                  </Button>
                </CardContent>
              </Card>

              {followup && (
                <Card className="rounded-2xl border-primary/20 bg-primary/[0.04]">
                  <CardContent className="space-y-2 pt-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      GutBrain interpretation
                    </div>
                    <p className="text-sm text-foreground">{followup.interpretation}</p>
                    <p className="text-sm text-muted-foreground">Next action: {followup.nextAction}</p>
                    <Button
                      className="mt-1 h-9 rounded-full px-4 text-sm"
                      onClick={() => followup.coachPrompt && onAskCoachPrompt?.(followup.coachPrompt)}
                    >
                      Ask GutBrain about this
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="normal" className="mt-3 space-y-3">
              <Card className="rounded-2xl border-border/60 bg-card/85">
                <CardHeader className="space-y-1.5 pb-3">
                  <CardTitle className="text-base">Normal today</CardTitle>
                  <p className="text-sm text-foreground/90">{normalToday.headline}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <GuidanceBlock title="Expected" items={normalToday.normal} tone="expected" />
                  <GuidanceBlock title="Pause and check" items={normalToday.redFlags} tone="caution" />
                  <GuidanceBlock title="Ignore for now" items={normalToday.ignore} tone="ignore" />

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" className="h-10 rounded-xl px-4" onClick={() => setActiveTab('log')}>
                      Log symptoms
                    </Button>
                    <Button
                      className="h-10 rounded-xl px-4"
                      onClick={() =>
                        onAskCoachPrompt?.(
                          `Day ${currentDay} symptom check: explain what is expected vs caution, using my latest tracker pattern.`,
                        )
                      }
                    >
                      Ask GutBrain
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
