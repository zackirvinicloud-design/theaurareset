import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  phase: string;
}

interface DailyChecklistProps {
  currentDay: number;
}

export const DailyChecklist = ({ currentDay }: DailyChecklistProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const savedChecks = localStorage.getItem(`aura-checklist-day-${currentDay}`);
    const savedNotes = localStorage.getItem(`aura-notes-day-${currentDay}`);
    
    if (savedChecks) {
      setCheckedItems(JSON.parse(savedChecks));
    } else {
      setCheckedItems({});
    }
    
    setNotes(savedNotes || "");
  }, [currentDay]);

  useEffect(() => {
    localStorage.setItem(`aura-checklist-day-${currentDay}`, JSON.stringify(checkedItems));
  }, [checkedItems, currentDay]);

  useEffect(() => {
    if (notes) {
      localStorage.setItem(`aura-notes-day-${currentDay}`, notes);
    }
  }, [notes, currentDay]);

  const getChecklistItems = (day: number): ChecklistItem[] => {
    const items: ChecklistItem[] = [
      // Phase 1 - All 28 days
      { id: "morning-ritual", label: "Morning ritual (Sole Water, Baking Soda, or Complete Elixir)", phase: "liver" },
      { id: "liver-juice-1", label: "Morning liver juice", phase: "liver" },
      { id: "liver-juice-2", label: "Afternoon liver juice", phase: "liver" },
      { id: "liver-juice-3", label: "Evening liver juice", phase: "liver" },
      { id: "milk-thistle-am", label: "Milk Thistle (300mg) with breakfast", phase: "liver" },
      { id: "dandelion", label: "Dandelion Root (500mg) with breakfast", phase: "liver" },
      { id: "nac", label: "NAC (600mg) with lunch", phase: "liver" },
      { id: "ala", label: "Alpha-Lipoic Acid (300mg) with lunch", phase: "liver" },
      { id: "selenium", label: "Selenium (200mcg) with lunch", phase: "liver" },
      { id: "b-complex", label: "B-Complex with lunch", phase: "liver" },
      { id: "milk-thistle-pm", label: "Milk Thistle (300mg) with dinner", phase: "liver" },
      { id: "artichoke", label: "Artichoke Extract (500mg) with dinner", phase: "liver" },
      { id: "water", label: "8+ glasses of water", phase: "liver" },
      { id: "binders", label: "Evening binders (activated charcoal or psyllium husk)", phase: "liver" },
    ];

    // Phase 2 - Days 1-7
    if (day <= 7) {
      items.push(
        { id: "oregano-oil", label: "Oregano oil (2-3 capsules, 2x daily)", phase: "fungal" },
        { id: "caprylic-acid", label: "Caprylic acid (1000-1500mg)", phase: "fungal" },
        { id: "garlic", label: "Raw garlic (2-4 cloves throughout day)", phase: "fungal" },
        { id: "pau-darco", label: "Pau d'arco tea", phase: "fungal" }
      );
    }

    // Phase 3 - Days 8-21
    if (day >= 8 && day <= 21) {
      items.push(
        { id: "wormwood", label: "Wormwood complex (as directed)", phase: "parasite" },
        { id: "black-walnut", label: "Black walnut hull tincture (as directed)", phase: "parasite" },
        { id: "clove", label: "Clove oil (as directed)", phase: "parasite" },
        { id: "mimosa-pudica", label: "Mimosa pudica (1000mg, 2x daily)", phase: "parasite" },
        { id: "diatomaceous-earth", label: "Diatomaceous earth (1 tsp in morning)", phase: "parasite" }
      );
    }

    // Phase 4 - Days 22-28
    if (day >= 22) {
      items.push(
        { id: "increased-binders", label: "Increased binders (3x daily)", phase: "elimination" },
        { id: "castor-oil", label: "Castor oil pack or enema", phase: "elimination" },
        { id: "epsom-bath", label: "Epsom salt bath", phase: "elimination" }
      );
    }

    return items;
  };

  const items = getChecklistItems(currentDay);
  const liverItems = items.filter(item => item.phase === "liver");
  const fungalItems = items.filter(item => item.phase === "fungal");
  const parasiteItems = items.filter(item => item.phase === "parasite");
  const eliminationItems = items.filter(item => item.phase === "elimination");

  const totalItems = items.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const completionPercentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const handleCheck = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const resetDay = () => {
    setCheckedItems({});
    setNotes("");
    localStorage.removeItem(`aura-checklist-day-${currentDay}`);
    localStorage.removeItem(`aura-notes-day-${currentDay}`);
  };

  const ChecklistSection = ({ items, title }: { items: ChecklistItem[], title: string }) => (
    <div className="space-y-3">
      {items.length > 0 && (
        <>
          <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
          {items.map((item) => (
            <div key={item.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Checkbox
                id={item.id}
                checked={checkedItems[item.id] || false}
                onCheckedChange={() => handleCheck(item.id)}
                className="mt-1"
              />
              <label
                htmlFor={item.id}
                className={`text-sm cursor-pointer flex-1 leading-relaxed ${
                  checkedItems[item.id] ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.label}
              </label>
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {completionPercentage === 100 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            Day {currentDay} Checklist
          </h3>
          <div className="text-sm font-medium">
            <span className={completionPercentage === 100 ? "text-green-500" : "text-primary"}>
              {checkedCount}/{totalItems}
            </span>
            <span className="text-muted-foreground ml-1">({completionPercentage}%)</span>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              <ChecklistSection items={liverItems} title="🛡️ Liver Support (Daily)" />
              <ChecklistSection items={fungalItems} title="🍄 Fungal Phase" />
              <ChecklistSection items={parasiteItems} title="🦠 Parasite Phase" />
              <ChecklistSection items={eliminationItems} title="⚡ Final Elimination" />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={resetDay}
              className="w-full"
            >
              Reset Day {currentDay}
            </Button>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Day {currentDay} Notes</label>
              <Textarea
                placeholder="How are you feeling? Any symptoms or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[300px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Your notes are automatically saved for this day.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
