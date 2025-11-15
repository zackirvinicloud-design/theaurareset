import { MessageSquare, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChatPanel } from './ChatPanel';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ChatDrawerProps {
  context?: string;
}

export const ChatDrawer = ({ context }: ChatDrawerProps) => {
  const [open, setOpen] = useState(false);

  const handleChatTap = () => {
    setOpen(true);
  };

  return (
    <>
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
          "glass border-t border-brand-blue/20",
          "transition-all duration-300 ease-in-out px-4 py-3 flex items-center gap-3",
          "cursor-pointer hover:bg-brand-blue/5 active:bg-brand-blue/10"
        )}
        onClick={handleChatTap}
      >
        <MessageSquare className="w-5 h-5 text-brand-blue flex-shrink-0" />
        <span className="text-sm text-muted-foreground flex-1">Ask about the protocol...</span>
        <Sparkles className="w-4 h-4 text-brand-blue flex-shrink-0" />
      </div>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[90dvh] max-h-[90dvh] p-0">
          <ChatPanel context={context} className="h-full" />
        </SheetContent>
      </Sheet>
    </>
  );
};
