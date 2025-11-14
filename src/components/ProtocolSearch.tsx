import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  section: string;
  context: string;
  id: string;
}

interface ProtocolSearchProps {
  onNavigate: (id: string) => void;
}

export const ProtocolSearch = ({ onNavigate }: ProtocolSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Get all text content from the page
    const content = document.getElementById("protocol-content");
    if (!content) return;

    const results: SearchResult[] = [];
    const sections = content.querySelectorAll("section");
    const queryLower = query.toLowerCase();

    sections.forEach((section) => {
      const sectionId = section.id;
      const heading = section.querySelector("h2");
      const sectionTitle = heading?.textContent || "Section";
      
      const text = section.textContent || "";
      const textLower = text.toLowerCase();
      
      if (textLower.includes(queryLower)) {
        const index = textLower.indexOf(queryLower);
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 50);
        const context = "..." + text.slice(start, end).trim() + "...";
        
        results.push({
          section: sectionTitle,
          context: context,
          id: sectionId,
        });
      }
    });

    setSearchResults(results.slice(0, 20)); // Limit to 20 results
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    performSearch(value);
  };

  const handleResultClick = (id: string) => {
    onNavigate(id);
    setOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-20 z-50 bg-background shadow-lg lg:right-24"
        >
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>Search Protocol</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search supplements, recipes, days..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <ScrollArea className="h-[calc(100vh-180px)]">
            {searchResults.length === 0 && searchQuery && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No results found for "{searchQuery}"
              </p>
            )}
            
            {searchResults.length === 0 && !searchQuery && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Search for supplements, recipes, specific days, or any content...
              </p>
            )}

            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.id)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm mb-1">{result.section}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {result.context}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
