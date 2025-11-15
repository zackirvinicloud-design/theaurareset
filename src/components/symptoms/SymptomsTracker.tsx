import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useSymptomsStore } from '@/hooks/useSymptomsStore';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SymptomsTrackerProps {
  currentDay: number;
  currentPhase: 1 | 2 | 3 | 4;
}

export const SymptomsTracker = ({ currentDay, currentPhase }: SymptomsTrackerProps) => {
  const { symptoms, addSymptom, deleteSymptom } = useSymptomsStore();
  const [symptomType, setSymptomType] = useState('');
  const [severity, setSeverity] = useState([5]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomType.trim()) {
      toast.error('Please enter a symptom');
      return;
    }

    addSymptom({
      type: symptomType,
      severity: severity[0],
      notes: notes,
      protocolDay: currentDay,
      protocolPhase: currentPhase,
    });

    setSymptomType('');
    setSeverity([5]);
    setNotes('');
    toast.success('Symptom logged');
  };

  const todaySymptoms = symptoms.filter(s => s.protocolDay === currentDay);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptoms Tracker</CardTitle>
        <CardDescription>Log your daily symptoms for Aurora to analyze</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="symptom">Symptom</Label>
            <Input
              id="symptom"
              placeholder="e.g., Headache, Fatigue, Brain fog"
              value={symptomType}
              onChange={(e) => setSymptomType(e.target.value)}
            />
          </div>

          <div>
            <Label>Severity: {severity[0]}/10</Label>
            <Slider
              value={severity}
              onValueChange={setSeverity}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Log Symptom
          </Button>
        </form>

        {todaySymptoms.length > 0 && (
          <div className="space-y-2 mt-6">
            <h3 className="font-semibold text-sm">Today's Symptoms</h3>
            {todaySymptoms.map((symptom) => (
              <div
                key={symptom.id}
                className="flex items-start justify-between gap-2 p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{symptom.type}</div>
                  <div className="text-sm text-muted-foreground">
                    Severity: {symptom.severity}/10
                  </div>
                  {symptom.notes && (
                    <div className="text-sm mt-1">{symptom.notes}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    deleteSymptom(symptom.id);
                    toast.success('Symptom deleted');
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
