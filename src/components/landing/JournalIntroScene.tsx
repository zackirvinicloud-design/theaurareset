import { motion } from 'framer-motion';
import { BookOpen, Brain, TrendingUp } from 'lucide-react';

export const JournalIntroScene = () => {
  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            The Gut Brain Journal
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground">
            Personalized. Accountable. Sustained.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            className="p-8 rounded-2xl bg-card border border-border"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <BookOpen className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-3">Your Protocol</h3>
            <p className="text-muted-foreground">
              Not random advice. A structured 30-day protocol designed by experts, adapted to your unique situation.
            </p>
          </motion.div>

          <motion.div
            className="p-8 rounded-2xl bg-card border border-border"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Brain className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-3">AI Accountability Partner</h3>
            <p className="text-muted-foreground">
              Not just answers—daily check-ins, progress tracking, and personalized guidance. Your journal adapts to YOUR unique responses and keeps you moving forward.
            </p>
          </motion.div>

          <motion.div
            className="p-8 rounded-2xl bg-card border border-border"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <TrendingUp className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-3">Daily Accountability</h3>
            <p className="text-muted-foreground">
              Check in daily. We follow up. We track trends. We help you stay consistent where others give up.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
