import { useRef, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { ProtocolNav } from "@/components/ProtocolNav";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Index = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeSection, setActiveSection] = useState("welcome");
  const isMobile = useIsMobile();
  
  const [chatOpen, setChatOpen] = useState(() => {
    const saved = localStorage.getItem('chat-panel-open');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Default to open on desktop, closed on mobile
    return !isMobile;
  });

  useEffect(() => {
    // Only sync to localStorage on desktop
    if (!isMobile) {
      localStorage.setItem('chat-panel-open', JSON.stringify(chatOpen));
    }
  }, [chatOpen, isMobile]);

  // Set up intersection observer to track active section
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const handleLoad = () => {
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) return;

      const sections = iframeDoc.querySelectorAll("section[id]");
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
              setActiveSection(entry.target.id);
            }
          });
        },
        {
          threshold: [0.3],
          rootMargin: "-100px 0px -60% 0px",
        }
      );

      sections.forEach((section) => observer.observe(section));

      return () => observer.disconnect();
    };

    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, []);

  const handleNavigate = (id: string) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const iframeDoc = iframe.contentWindow.document;
    const element = iframeDoc.getElementById(id);
    
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  const handleDownloadHTML = async () => {
    try {
      const response = await fetch('/protocol-original.html');
      const htmlContent = await response.text();
      
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aura-reset-protocol.html";
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Success!",
        description: "HTML file downloaded successfully!",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
      toast({
        title: "Print dialog opened",
        description: "You can save as PDF from the print dialog.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-background via-background to-muted/20">
      <ProtocolNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onDownloadHTML={handleDownloadHTML}
        onPrint={handlePrint}
      />
      
      <div className={cn(
        "flex-1 lg:ml-64 flex flex-col lg:flex-row pt-14 lg:pt-0 pb-24 lg:pb-0",
        chatOpen && "lg:mr-80"
      )}>
        <iframe
          ref={iframeRef}
          src="/protocol-original.html"
          className="w-full min-h-screen border-0"
          title="The Aura Reset Protocol"
          id="protocol-content"
        />
      </div>

      {/* Desktop Chat Panel */}
      <div className={cn(
        "hidden lg:block fixed top-0 right-0 h-screen w-80 glass-card border-l border-border/20 transition-transform duration-300",
        chatOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <ChatPanel context={activeSection} />
      </div>

      {/* Desktop Chat Toggle */}
      <Button
        onClick={() => setChatOpen(!chatOpen)}
        size="icon"
        variant={chatOpen ? "secondary" : "default"}
        className="hidden lg:flex fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl z-50"
      >
        {chatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </Button>

      {/* Mobile Chat Drawer */}
      <ChatDrawer context={activeSection} />
    </div>
  );
};

export default Index;
