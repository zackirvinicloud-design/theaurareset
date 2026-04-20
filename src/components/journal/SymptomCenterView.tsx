import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { getDayLabel } from '@/hooks/useProtocolData';
import { SYMPTOMS } from '@/hooks/symptomData';
import {
  rankSymptomSearch,
  type SymptomCheckin,
  type SymptomCheckinInput,
  type SymptomCheckinItemInput,
} from '@/lib/symptom-center';
import { cn } from '@/lib/utils';

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
  onBack: () => void;
  onAskCoachPrompt?: (prompt: string) => void;
  onLogSymptomCheckin: (input: SymptomCheckinInput) => Promise<SymptomCheckin | null>;
  onLoadSymptomRange: (startDay?: number, endDay?: number) => Promise<unknown>;
}

export function SymptomCenterView({
  currentDay,
  currentPhase: _currentPhase,
  symptoms,
  symptomCheckins,
  onBack,
  onAskCoachPrompt,
  onLogSymptomCheckin,
  onLoadSymptomRange,
}: SymptomCenterViewProps) {
  const [search, setSearch] = useState('');
  const [customSymptomLabel, setCustomSymptomLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [gutState, setGutState] = useState(5);
  const [note, setNote] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showAskCoachCta, setShowAskCoachCta] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, SelectedSymptom>>({});

  const dayLabel = getDayLabel(currentDay);

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
        setSelectedSymptoms({});
        setCustomSymptomLabel('');
        setNote('');
        setShowAskCoachCta(true);
        setSaveStatus('Saved. This stays in your history so you can review the pattern later.');
      }

      void onLoadSymptomRange(Math.max(currentDay - 20, 0), currentDay);
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = Object.keys(selectedSymptoms).length;
  const askSymptomPrompt = `I logged a rough check-in on Day ${currentDay}. Help me simplify the rest of today around meals, timing, and the next step only.`;

  const openSymptomCoach = () => {
    if (onAskCoachPrompt) {
      onAskCoachPrompt(askSymptomPrompt);
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-shrink-0 border-b border-border/50 px-3 py-3 sm:px-4 lg:px-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-foreground sm:text-[24px]">
              Daily check-ins
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{dayLabel}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
          <div className="space-y-3">
            {showAskCoachCta && (
              <Card className="rounded-2xl border-primary/25 bg-primary/5">
                <CardContent className="space-y-3 pt-5">
                  <p className="text-sm text-foreground">Want to simplify today based on this check-in?</p>
                  <Button
                    className="h-10 w-full rounded-xl"
                    onClick={openSymptomCoach}
                  >
                    Ask GutBrain about my symptoms
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-2xl border-border/60 bg-card/85">
              <CardHeader className="space-y-1.5 pb-3">
                <CardTitle className="text-base">Log today&apos;s check-in</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pick what showed up, leave a short note if you want, and keep the rest of the day simple.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-foreground">How rough does today feel?</p>
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
                    placeholder="Search symptoms or add your own"
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
                  placeholder="Optional note about today"
                  className="rounded-xl"
                />

                  <Button className="h-10 w-full rounded-xl" disabled={saving || selectedCount === 0} onClick={saveCheckin}>
                    <Save className="mr-2 h-4 w-4" />
                    Save check-in
                  </Button>
              </CardContent>
            </Card>

            {saveStatus && (
              <Card className="rounded-2xl border-primary/20 bg-primary/[0.04]">
                <CardContent className="space-y-3 pt-5">
                  <p className="text-sm font-medium text-foreground">Check-in saved</p>
                  <p className="text-sm text-muted-foreground">{saveStatus}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="h-9 rounded-full px-4 text-sm"
                      onClick={openSymptomCoach}
                    >
                      Ask GutBrain to simplify today
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 rounded-full px-4 text-sm"
                      onClick={() => setSaveStatus(null)}
                    >
                      Keep logging
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
