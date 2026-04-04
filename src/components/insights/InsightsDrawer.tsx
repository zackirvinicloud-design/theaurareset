import { useState } from 'react';
import { Brain } from 'lucide-react';
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
import type { GutBrainState } from '@/hooks/useGutBrainProfile';
import type { GutBrainConversationEntry, GutBrainProfile, GutBrainProgressState } from '@/lib/gutbrain';

interface InsightsDrawerProps {
  brain: GutBrainState;
  entries: GutBrainConversationEntry[];
  progress: GutBrainProgressState;
  buttonLabel?: string;
  compact?: boolean;
  onUpdateProfile?: (updates: Partial<GutBrainProfile>) => Promise<void>;
}

export const InsightsDrawer = ({
  brain,
  entries,
  progress,
  buttonLabel = 'Insights',
  compact = false,
  onUpdateProfile,
}: InsightsDrawerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Coach insights">
            <Brain className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Brain className="w-4 h-4" />
            {buttonLabel}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Inside your pattern</SheetTitle>
          <SheetDescription>
            A deeper read on behavior, friction, motivation, and what matters most for staying on track.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 pb-8">
          <ConversationInsights
            entries={entries}
            progress={progress}
            profile={brain.profile}
            snapshot={brain.snapshot}
            isLoading={brain.isLoading}
            isRefreshing={brain.isRefreshing}
            onRefresh={(options) => brain.refreshBrain(entries, progress, options)}
            onUpdateProfile={onUpdateProfile}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
