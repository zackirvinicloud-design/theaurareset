import { MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 lg:hidden"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90dvh] max-h-[90dvh] p-0">
        <ChatPanel context={context} className="h-full" />
      </SheetContent>
    </Sheet>
  );
};
