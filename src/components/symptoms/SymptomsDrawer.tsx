import { useState } from 'react';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SymptomsTracker } from './SymptomsTracker';
import { SymptomsInsights } from './SymptomsInsights';

interface SymptomsDrawerProps {
  currentDay: number;
  currentPhase: 1 | 2 | 3 | 4;
}

export const SymptomsDrawer = ({ currentDay, currentPhase }: SymptomsDrawerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Track symptoms"
        >
          <Activity className="w-3.5 h-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Symptom Tracking</SheetTitle>
          <SheetDescription>
            Log symptoms and view patterns over time
          </SheetDescription>
        </SheetHeader>
        <Tabs defaultValue="tracker" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tracker">Log Symptom</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="tracker" className="mt-4">
            <SymptomsTracker currentDay={currentDay} currentPhase={currentPhase} />
          </TabsContent>
          <TabsContent value="insights" className="mt-4">
            <SymptomsInsights />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
