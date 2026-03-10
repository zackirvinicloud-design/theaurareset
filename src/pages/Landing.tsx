import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesShowcase } from '@/components/landing/FeaturesShowcase';
import { TransformationProof } from '@/components/landing/TransformationProof';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                The Gut Brain Journal
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                size="sm"
                className="text-sm sm:text-base"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/signup')}
                className="gap-1 sm:gap-2"
                size="sm"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      <FeaturesShowcase />
      <TransformationProof />
      <PricingSection />
      <FinalCTA />

      <footer className="bg-muted/30 border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-[1.4fr,1fr,1fr] items-start">
            <div>
              <h4 className="font-semibold mb-3 text-lg">The Gut Brain Journal</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                A guided protocol companion built to answer one question first:
                what do I need to do today?
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Core Flow</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Prep</li>
                <li>Today</li>
                <li>Guide</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Principles</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Protocol first</li>
                <li>Reduce confusion</li>
                <li>Optimize for completion</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 The Gut Brain Journal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
