import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullProtocolViewProps {
    onBack: () => void;
}

export function FullProtocolView({ onBack }: FullProtocolViewProps) {
    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-shrink-0 border-b border-border/50 px-6 py-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Full Protocol
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            The original written protocol, available in the center workspace whenever you want to reference it directly.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-muted/10">
                <iframe
                    src="/protocol-original.html"
                    title="Full Protocol"
                    className="h-full w-full border-0 bg-background"
                />
            </div>
        </div>
    );
}
