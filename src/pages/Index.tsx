import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Index = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  const handleDownloadHTML = () => {
    if (!contentRef.current) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Aura Heavy Reset Protocol</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      color: #1d1d1f;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 50%, #f0f4f8 100%);
      max-width: 880px;
      margin: 0 auto;
      padding: 32px;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Playfair Display', serif;
    }
    .glass {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
      border-radius: 20px;
      padding: 24px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  ${contentRef.current.innerHTML}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aura-heavy-reset-protocol.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("HTML file downloaded successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-[#e8eef5] to-[#f0f4f8] bg-fixed">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div ref={contentRef} className="protocol-content">
          {/* Cover Section */}
          <section className="relative overflow-hidden rounded-b-[32px] mb-10 p-12 md:p-20 text-center text-white bg-gradient-to-br from-[#0d7377] to-[#14a085] shadow-2xl">
            <div className="absolute inset-0 bg-gradient-radial from-white/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-5 tracking-tight">
                The Aura Heavy Reset Protocol
              </h1>
              <p className="text-xl md:text-3xl font-medium mb-4 opacity-95">
                A Comprehensive 28-Day Detoxification System
              </p>
              <p className="text-base md:text-xl font-light italic opacity-90">
                Eliminate Parasites, Heavy Metals, and Fungal Overgrowth — Reclaim Your Vitality
              </p>
            </div>
          </section>

          {/* Introduction */}
          <section className="glass rounded-3xl p-6 md:p-10 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary font-serif">
              Welcome to the Aura Heavy Reset Protocol
            </h2>
            <p className="text-lg mb-4 leading-relaxed">
              This is not a quick fix—it's a comprehensive 28-day journey designed to systematically remove the hidden
              toxic burdens that may be silently draining your energy, clouding your mind, and weakening your immune system.
            </p>
            <p className="text-lg mb-4 leading-relaxed">
              Over the next four weeks, you'll address four critical areas of toxic accumulation: liver congestion, fungal
              overgrowth, parasitic infections, and heavy metal toxicity. Each phase builds on the previous, creating a
              strategic sequence that maximizes detoxification while minimizing discomfort.
            </p>
            <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg mt-6">
              <p className="text-lg font-medium mb-3">
                <strong>The Four-Phase Strategy:</strong>
              </p>
              <ul className="space-y-3 text-base">
                <li className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">🛡️</span>
                  <span><strong>Phase 1: Liver Support</strong> — Runs continuously for all 28 days</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">🍄</span>
                  <span><strong>Phase 2: Fungal Pre-Conditioning</strong> — Days 1-7</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">🎯</span>
                  <span><strong>Phase 3: Parasite Elimination</strong> — Days 8-21</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">⚡</span>
                  <span><strong>Phase 4: Heavy Metal Detox</strong> — Days 22-28</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Phase Details */}
          <section className="space-y-6 mb-8">
            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="bg-gradient-to-r from-phase-1 to-phase-1/80 text-white rounded-2xl p-6 mb-6">
                <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-3 font-serif">
                  <span className="text-3xl">🛡️</span>
                  Phase 1: The Foundation - Liver Support (Days 1-28)
                </h3>
              </div>
              <p className="text-lg leading-relaxed">
                Your liver is your body's primary detoxification organ. Before we can safely remove toxins, we must ensure
                your liver can process and eliminate them efficiently. This phase runs throughout the entire protocol.
              </p>
            </div>

            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="bg-gradient-to-r from-phase-2 to-phase-2/80 text-white rounded-2xl p-6 mb-6">
                <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-3 font-serif">
                  <span className="text-3xl">🍄</span>
                  Phase 2: The Warm-Up - Fungal Pre-Conditioning (Days 1-7)
                </h3>
              </div>
              <p className="text-lg leading-relaxed">
                Candida and fungal overgrowth create the perfect environment for parasites to thrive. By addressing fungal
                issues first, we weaken the ecosystem that supports parasites, making their elimination more effective.
              </p>
            </div>

            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="bg-gradient-to-r from-phase-3 to-phase-3/80 text-white rounded-2xl p-6 mb-6">
                <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-3 font-serif">
                  <span className="text-3xl">🎯</span>
                  Phase 3: The Main Event - Parasite Elimination (Days 8-21)
                </h3>
              </div>
              <p className="text-lg leading-relaxed">
                This is the core of the protocol. We use targeted herbs and foods to eliminate parasites while aggressively
                supporting your elimination pathways.
              </p>
            </div>

            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="bg-gradient-to-r from-phase-4 to-phase-4/80 text-white rounded-2xl p-6 mb-6">
                <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-3 font-serif">
                  <span className="text-3xl">⚡</span>
                  Phase 4: The Epilogue - Heavy Metal Detox (Days 22-28)
                </h3>
              </div>
              <p className="text-lg leading-relaxed">
                Once parasites are eliminated, we safely chelate heavy metals from deep tissues using natural compounds like
                chlorella, cilantro, and modified citrus pectin.
              </p>
            </div>

            <div className="bg-destructive/10 border-l-4 border-destructive glass rounded-3xl p-6 md:p-8">
              <p className="text-lg font-bold mb-3">⚠️ Why This Sequence Matters:</p>
              <ul className="space-y-2 text-base">
                <li>• Eliminating metals before parasites can redistribute toxins</li>
                <li>• Fungal overgrowth feeds parasites—address the environment first</li>
                <li>• Liver support prevents toxin reabsorption and overwhelm</li>
                <li>• Binders capture and escort toxins out safely throughout all phases</li>
              </ul>
            </div>
          </section>

          {/* Shopping List Section */}
          <section className="glass rounded-3xl p-6 md:p-10 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary font-serif">🛒 Complete Shopping List</h2>
            
            <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg mb-8">
              <p className="text-lg">
                <strong>Shopping Strategy:</strong> You don't need to buy everything at once. This list is organized by when
                you'll need items. Focus on getting Phase 1 and Phase 2 items before you start, then add Phase 3 items before
                Day 8, and Phase 4 items before Day 22.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <div className="bg-primary text-white font-bold text-xl p-4 rounded-xl mb-4">
                  🛡️ Phase 1: Liver Support (Days 1-28) - Buy Before Starting
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 mt-6 font-serif">Fresh Produce (Buy Weekly)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-3 text-left">Item</th>
                        <th className="border border-border p-3 text-left">Week 1 Quantity</th>
                        <th className="border border-border p-3 text-left">Total for 28 Days</th>
                        <th className="border border-border p-3 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-3">Lemons</td>
                        <td className="border border-border p-3">15</td>
                        <td className="border border-border p-3">45+ total</td>
                        <td className="border border-border p-3">Buy fresh weekly, organic preferred</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border border-border p-3">Beets (medium)</td>
                        <td className="border border-border p-3">6</td>
                        <td className="border border-border p-3">18 total</td>
                        <td className="border border-border p-3">For liver detox juices</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Carrots</td>
                        <td className="border border-border p-3">10</td>
                        <td className="border border-border p-3">30 total</td>
                        <td className="border border-border p-3">Organic, for juicing</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border border-border p-3">Green Apples</td>
                        <td className="border border-border p-3">10</td>
                        <td className="border border-border p-3">25 total</td>
                        <td className="border border-border p-3">Granny Smith preferred</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Celery</td>
                        <td className="border border-border p-3">2 bunches</td>
                        <td className="border border-border p-3">6 bunches total</td>
                        <td className="border border-border p-3">Fresh weekly</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border border-border p-3">Kale</td>
                        <td className="border border-border p-3">2 bunches</td>
                        <td className="border border-border p-3">5 bunches total</td>
                        <td className="border border-border p-3">For green juices</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Fresh Ginger Root</td>
                        <td className="border border-border p-3">Large piece (6+ inches)</td>
                        <td className="border border-border p-3">Buy fresh weekly</td>
                        <td className="border border-border p-3">Keep refrigerated</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border border-border p-3">Fresh Turmeric Root</td>
                        <td className="border border-border p-3">3 inches</td>
                        <td className="border border-border p-3">Buy fresh as needed</td>
                        <td className="border border-border p-3">Or turmeric powder</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Reference */}
          <section className="glass rounded-3xl p-6 md:p-10 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary font-serif">📋 Quick Reference Guide</h2>
            
            <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-semibold mb-3 font-serif">🌅 Morning Ritual Quick Guide</h3>
              <p className="text-lg mb-3"><strong>Every morning, choose ONE:</strong></p>
              <ol className="space-y-2 text-base list-decimal list-inside">
                <li><strong>Sole Water:</strong> ¼-½ tsp salt + ½ lemon + 8-16oz water (for energy, minerals)</li>
                <li><strong>Baking Soda:</strong> ¼-½ tsp baking soda + ½ lemon + 8-16oz water (for die-off symptoms)</li>
                <li><strong>Complete Elixir:</strong> ¼ tsp each salt & baking soda + ½ lemon + 12-16oz water (maximum support)</li>
              </ol>
              <p className="text-lg mt-4"><strong>Always:</strong> Wait 20 min → Take binders → Wait 30 min → Eat breakfast</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left">Phase</th>
                    <th className="border border-border p-3 text-left">Days</th>
                    <th className="border border-border p-3 text-left">Key Supplements</th>
                    <th className="border border-border p-3 text-left">Focus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3">Phase 1 (Liver)</td>
                    <td className="border border-border p-3">1-28</td>
                    <td className="border border-border p-3">Milk thistle, NAC, Alpha-lipoic acid</td>
                    <td className="border border-border p-3">Continuous liver support</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="border border-border p-3">Phase 2 (Fungal)</td>
                    <td className="border border-border p-3">1-7</td>
                    <td className="border border-border p-3">Oregano oil, Caprylic acid, Probiotics</td>
                    <td className="border border-border p-3">Starve and weaken fungus</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Phase 3 (Parasite)</td>
                    <td className="border border-border p-3">8-21</td>
                    <td className="border border-border p-3">Black walnut, Wormwood, Clove</td>
                    <td className="border border-border p-3">Eliminate parasites</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="border border-border p-3">Phase 4 (Metals)</td>
                    <td className="border border-border p-3">22-28</td>
                    <td className="border border-border p-3">Chlorella, Cilantro, Spirulina</td>
                    <td className="border border-border p-3">Chelate heavy metals</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Final Notes */}
          <section className="glass rounded-3xl p-6 md:p-10 mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary font-serif">Final Thoughts</h2>
            <p className="text-lg leading-relaxed mb-4">
              Completing this protocol is a significant achievement. You've taken control of your health by addressing
              hidden burdens that conventional medicine often overlooks. The benefits you experience—increased energy,
              mental clarity, better sleep, and improved immunity—are the result of your body finally operating without
              the constant drain of toxins and parasites.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Remember that healing is not linear. Some days will feel harder than others, especially during die-off
              periods. Trust the process, listen to your body, and adjust as needed. The work you're doing now will pay
              dividends for years to come.
            </p>
            <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg mt-6">
              <p className="text-xl font-bold text-center">
                🌟 Here's to your health, vitality, and reclaiming your aura. 🌟
              </p>
            </div>
          </section>
        </div>

        {/* Download Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="lg" 
              className="fixed bottom-8 right-8 shadow-2xl no-print z-50 bg-primary hover:bg-primary/90"
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
    </div>
  );
};

export default Index;
