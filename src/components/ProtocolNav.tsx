import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSection {
  id: string;
  title: string;
  emoji: string;
}

const sections: NavSection[] = [
  { id: "welcome", title: "Welcome", emoji: "🌟" },
  { id: "architecture", title: "Protocol Architecture", emoji: "🏗️" },
  { id: "shopping", title: "Shopping List", emoji: "🛒" },
  { id: "28-day", title: "28-Day Protocol", emoji: "📅" },
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
}

export const ProtocolNav = ({ activeSection, onNavigate }: ProtocolNavProps) => {
  const [open, setOpen] = useState(false);

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
            "w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm",
            activeSection === section.id
              ? "bg-primary text-primary-foreground font-medium"
              : "hover:bg-muted"
          )}
        >
          <span>{section.emoji}</span>
          <span className="truncate">{section.title}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-background shadow-lg"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 overflow-y-auto">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-bold">Contents</h2>
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-background border-r overflow-y-auto p-6 z-40">
        <div className="mb-6">
          <h2 className="font-serif text-xl font-bold">Contents</h2>
        </div>
        <NavContent />
      </aside>
    </>
  );
};
