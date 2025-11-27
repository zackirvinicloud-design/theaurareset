import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 rounded-3xl p-12 sm:p-16"
      >
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          Ready to Finally Heal Your Gut?
        </h2>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Stop cycling through conflicting advice. Start your guided 21-day transformation with Journey today—completely free.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/signup')}
            className="gap-2 text-lg px-8 py-6 w-full sm:w-auto"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required • 21 days completely free • Cancel anytime
        </p>
      </motion.div>
    </section>
  );
};
