import { useRef, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { ProtocolNav } from "@/components/ProtocolNav";

const Index = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeSection, setActiveSection] = useState("welcome");

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
    <div className="min-h-screen bg-background">
      {/* Unified Menu */}
      <ProtocolNav 
        activeSection={activeSection} 
        onNavigate={handleNavigate}
        onDownloadHTML={handleDownloadHTML}
        onPrint={handlePrint}
      />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        <iframe
          ref={iframeRef}
          src="/protocol-original.html"
          className="w-full min-h-screen border-0"
          title="The Aura Reset Protocol"
          id="protocol-content"
        />
      </div>
    </div>
  );
};

export default Index;
