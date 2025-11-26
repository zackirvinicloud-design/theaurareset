import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Check, X } from 'lucide-react';

const comparisons = [
  {
    feature: "Structured daily protocol (not just advice)",
    others: false,
    us: true
  },
  {
    feature: "Built-in accountability system",
    others: false,
    us: true
  },
  {
    feature: "Personalized progression plan",
    others: false,
    us: true
  },
  {
    feature: "Knows what you should do TODAY",
    others: false,
    us: true
  },
  {
    feature: "Tracks your patterns over time",
    others: false,
    us: true
  },
  {
    feature: "One clear path (not decision paralysis)",
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
          className="text-4xl md:text-6xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why it's different
        </motion.h2>

        <motion.div 
          style={{ y }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <div className="grid grid-cols-3 gap-4 p-6 bg-muted/50 border-b border-border">
            <div className="text-muted-foreground font-medium">Feature</div>
            <div className="text-center font-bold">ChatGPT / Google</div>
            <div className="text-center font-bold text-primary">Gut Brain Journal</div>
          </div>

          {comparisons.map((item, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-3 gap-4 p-6 border-b border-border last:border-b-0"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-sm md:text-base">{item.feature}</div>
              <div className="flex justify-center">
                <X className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex justify-center">
                <Check className="w-6 h-6 text-primary" />
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
          <p className="text-xl md:text-2xl text-muted-foreground italic">
            "Information doesn't change behavior. Structure and accountability do."
          </p>
        </motion.div>
      </div>
    </div>
  );
};
