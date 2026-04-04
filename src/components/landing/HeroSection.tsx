import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Built for gut health buyers who need execution</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            A 21-day gut health cleanse
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
            you can actually finish.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Built like a mini web app, not another static PDF. Prep once, see what to do today,
          check off each step, and get help when you need clarity.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Button
            onClick={() => navigate('/signup')}
            size="lg"
            className="text-lg h-16 px-8 gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            Start My Personalized Plan
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            size="lg"
            className="text-lg h-16 px-8"
          >
            Sign In
          </Button>
        </motion.div>

        {/* Product proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid gap-3 sm:grid-cols-3 max-w-3xl mx-auto text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Prep flow with shopping list</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Daily plan grouped by time of day</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>AI help when you get stuck</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
