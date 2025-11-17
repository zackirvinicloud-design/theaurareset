import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Download, FileText, Printer, GraduationCap, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { resetTour } from "@/components/onboarding/InteractiveTour";

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
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  onSignOut?: () => void;
}

export const ProtocolNav = ({ 
  activeSection, 
  onNavigate, 
  onDownloadHTML, 
  onPrint,
  mobileMenuOpen: controlledOpen,
  onMobileMenuOpenChange,
  onSignOut
}: ProtocolNavProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onMobileMenuOpenChange || setInternalOpen;

  const handleDownload = () => {
    onDownloadHTML();
    setOpen(false);
  };

  const handlePrint = () => {
    onPrint();
    setOpen(false);
  };

  const handleRestartTutorial = () => {
    resetTour();
    setOpen(false);
    window.location.reload();
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
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-md border-b border-border/40 z-50 flex items-center justify-between px-4">
        <h1 className="font-serif text-lg font-bold truncate">Aura Reset Protocol</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <Menu className="h-5 w-5" />
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
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleRestartTutorial}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Restart Tutorial
              </Button>
              {onSignOut && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => {
                    onSignOut();
                    setOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              )}
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
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-background border-r overflow-y-auto p-6 z-40 protocol-nav">
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
          <Button
            variant="outline"
            className="w-full justify-start text-sm"
            onClick={handleRestartTutorial}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Restart Tutorial
          </Button>
          {onSignOut && (
            <Button
              variant="outline"
              className="w-full justify-start text-sm text-destructive hover:text-destructive"
              onClick={onSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          )}
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
