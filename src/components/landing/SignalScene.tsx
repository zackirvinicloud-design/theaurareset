import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Brain } from 'lucide-react';

export const SignalScene = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1.2, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background flex items-center justify-center px-4">
      <motion.div 
        style={{ scale, opacity }}
        className="text-center space-y-8 max-w-4xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Brain className="w-20 h-20 md:w-32 md:h-32 mx-auto text-primary" />
        </motion.div>
        
        <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Your gut knows
        </h2>
        
        <p className="text-xl md:text-3xl text-foreground font-light">
          90% of your serotonin is made in your gut.<br />
          The gut-brain axis is real. The confusion ends here.
        </p>

        <motion.div
          className="pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-2xl md:text-4xl font-bold text-primary mb-2">
            Cut through the $270 billion noise.
          </p>
          <p className="text-2xl md:text-4xl font-bold text-primary">
            Finally, a clear signal.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
