import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    SheetClose,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

interface FullProtocolViewProps {
    onBack: () => void;
}

interface LegacyProtocolSection {
    id: string;
    label: string;
    description: string;
}

interface ParsedProtocolDocument {
    html: string;
    sections: LegacyProtocolSection[];
}

export function FullProtocolView({ onBack }: FullProtocolViewProps) {
    const [documentState, setDocumentState] = useState<ParsedProtocolDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        const loadDocument = async () => {
            setIsLoading(true);
            setLoadError(null);

            try {
                const response = await fetch('/protocol-original.html');
                if (!response.ok) {
                    throw new Error(`Failed to load protocol (${response.status})`);
                }

                const html = await response.text();
                if (!isActive) return;

                setDocumentState(parseProtocolDocument(html));
            } catch (error) {
                if (!isActive) return;

                const message = error instanceof Error
                    ? error.message
                    : 'Unable to load the full protocol right now.';
                setLoadError(message);
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void loadDocument();

        return () => {
            isActive = false;
        };
    }, []);

    const scrollToSection = useCallback((id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const sections = documentState?.sections ?? [];

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="flex-shrink-0 border-b border-border/50 px-4 py-4 lg:px-6">
                <div className="flex items-start gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-9 w-9 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                                Full Protocol
                            </h2>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            The original long-form protocol, restored inside the app in dark mode so you can read the full reference without leaving the product.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="hidden border-r border-border/50 bg-muted/20 lg:block">
                    <ScrollArea className="h-full">
                        <div className="space-y-2 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Table of contents
                            </p>
                            {isLoading ? (
                                <div className="rounded-2xl border border-border/60 bg-background/80 px-3 py-6 text-sm text-muted-foreground">
                                    Loading sections...
                                </div>
                            ) : loadError ? (
                                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-3 py-4 text-sm text-muted-foreground">
                                    {loadError}
                                </div>
                            ) : (
                                sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className="w-full rounded-2xl border border-border/60 bg-background/80 px-3 py-3 text-left transition-colors hover:bg-background"
                                    >
                                        <p className="text-sm font-semibold text-foreground">{section.label}</p>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            {section.description}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </aside>

                <ScrollArea className="h-full">
                    <div className="mx-auto max-w-5xl px-4 py-4 lg:px-8 lg:py-6">
                        <div className="mb-4 lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-11 w-full justify-between rounded-2xl border-border/60 bg-card/70 px-4 text-left"
                                    >
                                        <span className="flex items-center gap-2 text-sm font-medium">
                                            <List className="h-4 w-4 text-primary" />
                                            Contents
                                        </span>
                                        <span className="text-xs text-muted-foreground">{sections.length} sections</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="rounded-t-[28px] border-border/60 px-4 pb-6 pt-8">
                                    <SheetHeader className="text-left">
                                        <SheetTitle className="text-left">Full Protocol Contents</SheetTitle>
                                        <SheetDescription className="text-left">
                                            Jump into the section you need without scrolling the whole guide.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-5 space-y-2">
                                        {sections.map((section) => (
                                            <SheetClose asChild key={section.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => scrollToSection(section.id)}
                                                    className="w-full rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-left transition-colors hover:bg-card"
                                                >
                                                    <p className="text-sm font-semibold text-foreground">{section.label}</p>
                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                        {section.description}
                                                    </p>
                                                </button>
                                            </SheetClose>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {isLoading ? (
                            <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-border/60 bg-card/70 px-6 py-16">
                                <div className="text-center">
                                    <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Loading the full protocol...</p>
                                </div>
                            </div>
                        ) : loadError ? (
                            <div className="rounded-[32px] border border-destructive/30 bg-destructive/5 px-6 py-8">
                                <p className="text-sm font-semibold text-foreground">Could not load the full protocol.</p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">{loadError}</p>
                            </div>
                        ) : documentState ? (
                            <div className="rounded-[32px] border border-border/60 bg-card/70 p-4 shadow-sm lg:p-6">
                                <div className="mb-4 hidden rounded-3xl border border-primary/20 bg-primary/5 px-4 py-4 sm:block">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                                        Original reference restored
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        This is the dense source document inside the app shell, so you keep the full read without the old white-page mismatch.
                                    </p>
                                </div>

                                <div
                                    data-protocol-legacy
                                    className="protocol-legacy-root"
                                    dangerouslySetInnerHTML={{ __html: documentState.html }}
                                />
                            </div>
                        ) : null}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

function parseProtocolDocument(rawHtml: string): ParsedProtocolDocument {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    doc.querySelectorAll('script, style, link, meta, title').forEach((node) => node.remove());

    const sections = Array.from(doc.querySelectorAll<HTMLElement>('section[id]')).map((section) => {
        const label = cleanText(section.querySelector('h2')?.textContent || section.id);
        const firstParagraph = cleanText(section.querySelector('p')?.textContent || '');

        return {
            id: section.id,
            label,
            description: truncateText(firstParagraph, 120),
        };
    });

    return {
        html: doc.body.innerHTML,
        sections,
    };
}

function cleanText(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

function truncateText(value: string, maxLength: number) {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}
