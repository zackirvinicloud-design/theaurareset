import { useState } from 'react';
import { Calendar, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useChatStore } from '@/hooks/useChatStore';

interface JournalHistoryProps {
  trigger?: React.ReactNode;
}

export const JournalHistory = ({ trigger }: JournalHistoryProps) => {
  const { messages } = useChatStore();
  const [open, setOpen] = useState(false);

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, typeof messages>);

  const sortedDates = Object.keys(groupedMessages).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (messages.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Calendar className="w-3.5 h-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Journal History</DialogTitle>
          <DialogDescription>
            Review your past conversations with Aurora, organized by date
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 sticky top-0 bg-background py-2 border-b">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">{date}</h3>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {groupedMessages[date].length} messages
                  </Badge>
                </div>
                <div className="space-y-3 pl-2">
                  {groupedMessages[date].map((msg) => (
                    <div key={msg.id} className="flex gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                        {msg.role === 'user' ? (
                          <User className="w-3 h-3 text-secondary-foreground" />
                        ) : (
                          <Bot className="w-3 h-3 text-secondary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-xs">
                            {msg.role === 'user' ? 'You' : 'Aurora'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
