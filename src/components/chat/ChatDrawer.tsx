import { MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChatPanel } from './ChatPanel';
import { useState } from 'react';

interface ChatDrawerProps {
  context?: string;
}

export const ChatDrawer = ({ context }: ChatDrawerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-3 p-4 pb-safe cursor-pointer active:opacity-70 transition-opacity">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                Chat with your journal...
              </p>
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90dvh] max-h-[90dvh] p-0">
        <ChatPanel context={context} className="h-full" />
      </SheetContent>
    </Sheet>
  );
};
