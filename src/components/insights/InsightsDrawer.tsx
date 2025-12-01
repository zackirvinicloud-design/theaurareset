import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ConversationInsights } from './ConversationInsights';

export const InsightsDrawer = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="AI Insights"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Journey Insights</SheetTitle>
          <SheetDescription>
            Advanced deep analysis of your journey patterns
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 pb-6">
          <ConversationInsights />
        </div>
      </SheetContent>
    </Sheet>
  );
};
