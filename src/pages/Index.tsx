import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const contentRef = useRef<HTMLIFrameElement>(null);

  const handleDownloadHTML = async () => {
    try {
      const response = await fetch('/protocol-original.html');
      const htmlContent = await response.text();
      
      // Replace "Heavy" in title
      const modifiedHtml = htmlContent.replace(
        'The Aura Heavy Reset Protocol',
        'The Aura Reset Protocol'
      );
      
      const blob = new Blob([modifiedHtml], { type: "text/html" });
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
    if (contentRef.current && contentRef.current.contentWindow) {
      contentRef.current.contentWindow.print();
      toast({
        title: "Print dialog opened",
        description: "You can save as PDF from the print dialog.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <iframe
        ref={contentRef}
        src="/protocol-original.html"
        className="w-full h-screen border-0"
        title="The Aura Reset Protocol"
      />
      
      {/* Download Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="lg" 
            className="fixed bottom-8 right-8 shadow-2xl z-50 bg-primary hover:bg-primary/90"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Protocol
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleDownloadHTML}>
            <FileText className="mr-2 h-4 w-4" />
            Download as HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Index;
