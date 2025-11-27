import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      <div className="relative max-w-5xl mx-auto text-center pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 text-sm font-medium text-primary">
            <CheckCircle2 className="w-4 h-4" />
            <span>Yes, This Is Journey From TikTok</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Your 21-Day Gut Healing
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Starts Right Now
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Journey guides you through the complete protocol. Daily support. Real transformation. Just $27.
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Instant access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Complete 21-day protocol</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>24/7 AI coaching</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup')}
              className="gap-2 text-lg px-8 py-6 w-full sm:w-auto"
            >
              Get Journey Now - $27
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Social proof line */}
          <p className="mt-8 text-sm text-muted-foreground">
            One-time payment • Instant access • Start today
          </p>
        </motion.div>
      </div>
    </section>
  );
};
