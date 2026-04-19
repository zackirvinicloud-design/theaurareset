import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Check, X } from 'lucide-react';

const comparisons = [
  {
    feature: "Step-by-step daily instructions (what, when, how)",
    others: false,
    us: true
  },
  {
    feature: "GutBrain answers ANY granular question instantly",
    others: false,
    us: true
  },
  {
    feature: "Saves both TIME (no research) and MONEY (no trial-and-error)",
    others: false,
    us: true
  },
  {
    feature: "Real-time personalized guidance adapting to YOU",
    others: false,
    us: true
  },
  {
    feature: "Built-in accountability that prevents quitting",
    others: false,
    us: true
  },
  {
    feature: "87% completion rate (vs 12% DIY)",
    others: false,
    us: true
  }
];

export const ExperienceScene = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <div ref={ref} className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-center mb-12 sm:mb-16 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why it's different
        </motion.h2>

        <motion.div 
          style={{ y }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-6 bg-muted/50 border-b border-border">
            <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">Feature</div>
            <div className="text-center text-xs sm:text-sm md:text-base font-bold">Traditional</div>
            <div className="text-center text-xs sm:text-sm md:text-base font-bold text-primary">Us</div>
          </div>

          {comparisons.map((item, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-6 border-b border-border last:border-b-0"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-xs sm:text-sm md:text-base">{item.feature}</div>
              <div className="flex justify-center">
                <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-destructive" />
              </div>
              <div className="flex justify-center">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-card border border-primary/20 rounded-xl p-4 sm:p-6 max-w-2xl mx-auto">
            <p className="text-xl sm:text-2xl font-bold text-primary mb-2">The Science</p>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              90% of serotonin is produced in your gut. Your gut-brain axis controls mood, energy, immunity, and inflammation. We're not selling supplements—we're providing the structured path to optimize this connection.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
