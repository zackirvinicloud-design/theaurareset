import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Dramatic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.25),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Start with{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
              Prep Day.
            </span>
          </h2>

          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Know what to buy, know what to do today, and know where to ask when you are stuck.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button
              onClick={() => navigate('/signup')}
              size="lg"
              className="text-xl h-20 px-12 gap-3 shadow-2xl hover:shadow-primary/50 transition-all duration-300 group"
            >
              Open the guided protocol
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div>✓ Prep flow</div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div>✓ Daily plan</div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div>✓ In-app guide</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
