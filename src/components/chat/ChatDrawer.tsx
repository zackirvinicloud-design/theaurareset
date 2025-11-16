import { MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChatPanel } from './ChatPanel';
import { useState, useRef } from 'react';
import { triggerHaptic } from '@/utils/haptics';

interface ChatDrawerProps {
  context?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ChatDrawer = ({ context, open: controlledOpen, onOpenChange }: ChatDrawerProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = (newOpen: boolean) => {
    // Trigger haptic feedback when opening or closing
    triggerHaptic(newOpen ? 'medium' : 'light');
    
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchCurrentY.current - touchStartY.current;
    
    // If swiped down more than 50px, close the drawer
    if (swipeDistance > 50) {
      handleOpenChange(false);
    }
    
    touchStartY.current = 0;
    touchCurrentY.current = 0;
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
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
      <SheetContent side="bottom" className="h-[90dvh] max-h-[90dvh] p-0 [&>button]:hidden">
        {/* Swipe handle */}
        <div 
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/40 transition-colors hover:bg-muted-foreground/60" />
        </div>
        <ChatPanel context={context} className="h-full" />
      </SheetContent>
    </Sheet>
  );
};
