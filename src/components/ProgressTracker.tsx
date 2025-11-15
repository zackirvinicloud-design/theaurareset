import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface ProgressTrackerProps {
  onDayChange?: (day: number) => void;
}

export const ProgressTracker = ({ onDayChange }: ProgressTrackerProps) => {
  const [currentDay, setCurrentDay] = useState(() => {
    const saved = localStorage.getItem("aura-protocol-day");
    return saved ? parseInt(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem("aura-protocol-day", currentDay.toString());
    onDayChange?.(currentDay);
  }, [currentDay, onDayChange]);

  const progress = (currentDay / 28) * 100;

  const getActivePhases = (day: number) => {
    const phases = [];
    phases.push({ name: "Liver Support", emoji: "🛡️", color: "from-teal-500 to-emerald-600" });
    if (day <= 7) phases.push({ name: "Fungal Pre-Conditioning", emoji: "🍄", color: "from-green-500 to-emerald-500" });
    if (day >= 8 && day <= 21) phases.push({ name: "Intestinal Parasites", emoji: "🦠", color: "from-blue-500 to-cyan-500" });
    if (day >= 22) phases.push({ name: "Final Elimination", emoji: "⚡", color: "from-purple-500 to-pink-500" });
    return phases;
  };

  const activePhases = getActivePhases(currentDay);

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">28-Day Progress</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            Day {currentDay} of 28
          </div>
        </div>

        <Progress value={progress} className="h-3" />

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
            disabled={currentDay === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Day
          </Button>
          
          <div className="text-2xl font-bold text-primary">
            Day {currentDay}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDay(Math.min(28, currentDay + 1))}
            disabled={currentDay === 28}
          >
            Next Day
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Active Phases:</div>
          <div className="flex flex-wrap gap-2">
            {activePhases.map((phase) => (
              <div
                key={phase.name}
                className={`px-3 py-2 rounded-lg bg-gradient-to-r ${phase.color} text-white text-sm font-medium shadow-md`}
              >
                <span className="mr-1">{phase.emoji}</span>
                {phase.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
