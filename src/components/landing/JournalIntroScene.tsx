import { motion } from 'framer-motion';
import { Calendar, Brain, Target } from 'lucide-react';

export const JournalIntroScene = () => {
  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent px-4">
            The Gut Brain Journal
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-4 px-4">
            Step-by-step guidance that saves you both time and money
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            No more wasted hours researching. No more expensive trial-and-error. Journey AI gives you instant answers to ANY question, adapting to YOUR unique situation in real-time.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <motion.div
            className="p-6 sm:p-8 rounded-2xl bg-card border-2 border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mb-4 text-primary" />
            <h3 className="text-xl sm:text-2xl font-bold mb-3">21-Day Step-by-Step Program</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Not random advice. Exact daily instructions telling you what to do, when to do it, and how. Phase 1-4 progression with play-by-play guidance. Saves hours of confusion and costly mistakes.
            </p>
            <div className="text-xs sm:text-sm text-primary font-semibold">
              87% complete the full program vs 12% for DIY approaches
            </div>
          </motion.div>

          <motion.div
            className="p-6 sm:p-8 rounded-2xl bg-card border-2 border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 mb-4 text-primary" />
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Journey AI - Granular Answers Instantly</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Ask ANY question, get specific answers immediately. "Can I substitute this?" "Why am I dizzy?" "What if I can't find organic?" Journey adapts to YOUR situation, saving hours of research and preventing expensive mistakes.
            </p>
            <div className="text-xs sm:text-sm text-primary font-semibold">
              Instant guidance doctors can't provide, available 24/7
            </div>
          </motion.div>

          <motion.div
            className="p-6 sm:p-8 rounded-2xl bg-card border-2 border-primary/20 sm:col-span-2 md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Target className="w-10 h-10 sm:w-12 sm:h-12 mb-4 text-primary" />
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Daily Accountability</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              The difference between knowing and doing. Check-ins, progress tracking, and pattern recognition that keeps you moving forward when others quit.
            </p>
            <div className="text-xs sm:text-sm text-primary font-semibold">
              Accountability is the #1 retention factor in health programs
            </div>
          </motion.div>
        </div>

        <motion.div
          className="text-center bg-muted/30 rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground italic mb-2">
            "The gut health market is worth $270 billion, but completion rates for traditional approaches are under 15%."
          </p>
          <p className="text-base sm:text-lg font-semibold text-primary">
            Step-by-Step Guidance + Instant Answers + Structured Accountability = Save Time, Money, and Confusion
          </p>
        </motion.div>
      </div>
    </div>
  );
};
