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
        {/* Mobile: Persistent Chat Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 glass border-t border-border/20">
          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200 text-left shadow-sm hover:shadow-md"
          >
            <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground/80">Ask about the protocol...</span>
          </button>
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90dvh] max-h-[90dvh] p-0">
        <ChatPanel context={context} className="h-full" />
      </SheetContent>
    </Sheet>
  );
};
