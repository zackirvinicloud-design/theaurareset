import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Download, FileText, Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface NavSection {
  id: string;
  title: string;
  emoji: string;
}

const sections: NavSection[] = [
  { id: "welcome", title: "Welcome", emoji: "🌟" },
  { id: "architecture", title: "Protocol Architecture", emoji: "🏗️" },
  { id: "shopping", title: "Shopping List", emoji: "🛒" },
  { id: "phase-1", title: "Phase 1: Liver Support", emoji: "🛡️" },
  { id: "phase-2", title: "Phase 2: Fungal", emoji: "🍄" },
  { id: "phase-3", title: "Phase 3: Parasites", emoji: "🎯" },
  { id: "phase-4", title: "Phase 4: Heavy Metals", emoji: "⚡" },
  { id: "quick-ref", title: "Quick Reference", emoji: "📋" },
  { id: "pillars", title: "5 Pillars of Success", emoji: "🏆" },
  { id: "troubleshooting", title: "Troubleshooting", emoji: "🔧" },
  { id: "maintenance", title: "Maintenance Phase", emoji: "🔄" },
  { id: "science", title: "The Science", emoji: "🌟" },
];

interface ProtocolNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  onDownloadHTML: () => void;
  onPrint: () => void;
}

export const ProtocolNav = ({ activeSection, onNavigate, onDownloadHTML, onPrint }: ProtocolNavProps) => {
  const [open, setOpen] = useState(false);

  const handleDownload = () => {
    onDownloadHTML();
    setOpen(false);
  };

  const handlePrint = () => {
    onPrint();
    setOpen(false);
  };

  const NavContent = () => (
    <nav className="space-y-1">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => {
            onNavigate(section.id);
            setOpen(false);
          }}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm",
            activeSection === section.id
              ? "bg-primary text-primary-foreground font-medium"
              : "hover:bg-muted text-foreground"
          )}
        >
          <span className="text-base">{section.emoji}</span>
          <span className="truncate">{section.title}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Menu - Top Right */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 right-4 z-50 bg-background/60 backdrop-blur-md border-border/40 shadow-lg h-12 w-12 hover:bg-background/80 transition-all"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto pt-10">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold">Menu</h2>
            </div>
            
            {/* Download Options */}
            <div className="mb-6 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownload}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print / Save as PDF
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="mb-4">
              <h3 className="font-serif text-lg font-semibold">Navigation</h3>
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-background border-r overflow-y-auto p-6 z-40">
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold">Menu</h2>
        </div>
        
        {/* Download Options */}
        <div className="mb-6 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={onDownloadHTML}
          >
            <FileText className="mr-2 h-4 w-4" />
            Download HTML
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={onPrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="mb-4">
          <h3 className="font-serif text-base font-semibold">Navigation</h3>
        </div>
        <NavContent />
      </aside>
    </>
  );
};
