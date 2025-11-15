import { useState, useEffect } from 'react';
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

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProgressSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDay: number;
  onSave: (day: number, phase: 1 | 2 | 3 | 4) => void;
}

const getPhaseFromDay = (day: number): 1 | 2 | 3 | 4 => {
  return Math.ceil(day / 7) as 1 | 2 | 3 | 4;
};

export const ProgressSettingsDialog = ({
  open,
  onOpenChange,
  currentDay,
  onSave,
}: ProgressSettingsDialogProps) => {
  const [selectedDay, setSelectedDay] = useState(currentDay.toString());

  // Sync local state with prop when dialog opens or currentDay changes
  useEffect(() => {
    if (open) {
      setSelectedDay(currentDay.toString());
    }
  }, [open, currentDay]);

  const selectedPhase = getPhaseFromDay(parseInt(selectedDay));

  const handleSave = () => {
    const day = parseInt(selectedDay);
    const phase = getPhaseFromDay(day);
    onSave(day, phase);
  };

  const handleCancel = () => {
    setSelectedDay(currentDay.toString());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Your Progress</DialogTitle>
          <DialogDescription>
            Select your current day. Your phase will be calculated automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          {/* Phase Display */}
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Calculated Phase</p>
            <p className="font-medium">
              Phase {selectedPhase} 
              {selectedPhase === 1 && ': Liver Support (Days 1-7)'}
              {selectedPhase === 2 && ': Fungal & Viral (Days 8-14)'}
              {selectedPhase === 3 && ': Parasites (Days 15-21)'}
              {selectedPhase === 4 && ': Heavy Metals (Days 22-28)'}
            </p>
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
