import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProgressSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDay: number;
  currentPhase: 1 | 2 | 3 | 4;
  onSave: (day: number, phase: 1 | 2 | 3 | 4) => void;
}

const PHASES = [
  { value: 1, label: 'Phase 1: Liver Support', days: 'Days 1-7' },
  { value: 2, label: 'Phase 2: Fungal & Viral', days: 'Days 8-14' },
  { value: 3, label: 'Phase 3: Parasites', days: 'Days 15-21' },
  { value: 4, label: 'Phase 4: Heavy Metals', days: 'Days 22-28' },
] as const;

export const ProgressSettingsDialog = ({
  open,
  onOpenChange,
  currentDay,
  currentPhase,
  onSave,
}: ProgressSettingsDialogProps) => {
  const [selectedDay, setSelectedDay] = useState(currentDay.toString());
  const [selectedPhase, setSelectedPhase] = useState(currentPhase.toString());

  const handleSave = () => {
    onSave(parseInt(selectedDay), parseInt(selectedPhase) as 1 | 2 | 3 | 4);
  };

  const handleCancel = () => {
    setSelectedDay(currentDay.toString());
    setSelectedPhase(currentPhase.toString());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Your Progress</DialogTitle>
          <DialogDescription>
            Manually set your current day and phase in the protocol.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Day Selection */}
          <div className="space-y-2">
            <Label htmlFor="day-select">Current Day</Label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger id="day-select">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    Day {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phase Selection */}
          <div className="space-y-3">
            <Label>Current Phase</Label>
            <RadioGroup value={selectedPhase} onValueChange={setSelectedPhase}>
              {PHASES.map((phase) => (
                <div key={phase.value} className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={phase.value.toString()}
                    id={`phase-${phase.value}`}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`phase-${phase.value}`}
                    className="flex flex-col gap-0.5 cursor-pointer font-normal"
                  >
                    <span className="font-medium">{phase.label}</span>
                    <span className="text-xs text-muted-foreground">{phase.days}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
