import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ProtocolNav } from "@/components/ProtocolNav";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { InteractiveTour } from "@/components/onboarding/InteractiveTour";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const Protocol = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeSection, setActiveSection] = useState("welcome");
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  const [chatOpen, setChatOpen] = useState(() => {
    const saved = localStorage.getItem('chat-panel-open');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return !isMobile;
  });

  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has active subscription
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      // Check if user has active paid subscription
      const hasActiveSubscription = subscription?.is_active;

      // Check if user is within 48-hour free trial
      const userCreatedAt = new Date(session.user.created_at);
      const now = new Date();
      const hoursSinceSignup = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
      const isWithinFreeTrial = hoursSinceSignup < 48;

      // Grant access if either condition is met
      if (!hasActiveSubscription && !isWithinFreeTrial) {
        navigate("/payment-required");
        return;
      }

      setHasAccess(true);
      setIsLoading(false);
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('chat-panel-open', JSON.stringify(chatOpen));
    }
  }, [chatOpen, isMobile]);

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
  }, [hasAccess]);

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
      a.download = "gut-brain-journal.html";
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <InteractiveTour />
      
      <ProtocolNav
        activeSection={activeSection} 
        onNavigate={handleNavigate}
        onDownloadHTML={handleDownloadHTML}
        onPrint={handlePrint}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuOpenChange={setMobileMenuOpen}
        onSignOut={handleSignOut}
      />
      
      <div className={`lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-0 transition-all duration-300 ${chatOpen ? 'lg:mr-80' : ''}`}>
        <iframe
          ref={iframeRef}
          src="/protocol-original.html"
          className="w-full min-h-screen border-0"
          title="The Gut Brain Journal"
          id="protocol-content"
        />
      </div>

      <div className={`hidden lg:block fixed top-0 right-0 h-screen w-80 bg-background border-l border-border transition-transform duration-300 ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <ChatPanel context={activeSection} onClose={() => setChatOpen(false)} />
      </div>

      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          size="icon"
          variant="default"
          className="hidden lg:flex fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      )}

      <ChatDrawer 
        context={activeSection} 
        open={mobileChatOpen}
        onOpenChange={setMobileChatOpen}
      />
    </div>
  );
};

export default Protocol;
