import { motion } from 'framer-motion';
import { useLazyLoad } from '@/hooks/useLazyLoad';

const noisyAdvice = [
  "Carnivore diet", "Keto for gut health", "Low FODMAP",
  "Intermittent fasting", "Leaky gut syndrome", "Microbiome test",
  "Seed oils toxic", "Sugar addiction", "Whole30 protocol",
  "Paleo lifestyle", "Mediterranean diet", "Blue zones secret",
  "Autophagy fasting", "OMAD diet", "Kombucha gut health",
  "Gluten sensitivity", "Gut-brain axis", "Adrenal fatigue",
  "Insulin resistance", "CGM tracking", "Turmeric curcumin",
  "Fish oil daily", "Vitamin D deficiency", "Coffee enemas",
  "Cold plunges", "Sauna detox", "Grounding earthing",
  "Wim Hof method", "Functional medicine", "Biohacking"
];

export const NoiseScene = () => {
  const { ref, isVisible } = useLazyLoad({ threshold: 0.1, rootMargin: '100px' });

  return (
    <div ref={ref} className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-8 z-10 px-4">
          <motion.div
            className="text-sm md:text-base text-primary font-semibold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            The $270 Billion Gut Health Industry
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Everyone's Talking
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            But nobody's showing you exactly what to do—and when.
          </motion.p>
        </div>
        
        {/* Floating chaotic text - reduced count on mobile */}
        {isVisible && (
          <div className="absolute inset-0 opacity-30 hidden sm:block">
            {noisyAdvice.map((text, i) => (
            <motion.div
              key={i}
              className="absolute text-sm md:text-base font-medium text-muted-foreground whitespace-nowrap"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                ],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {text}
            </motion.div>
          ))}
          </div>
        )}

        {/* Simplified mobile version */}
        {isVisible && (
          <div className="absolute inset-0 opacity-30 sm:hidden">
          {noisyAdvice.slice(0, 15).map((text, i) => (
            <motion.div
              key={i}
              className="absolute text-xs font-medium text-muted-foreground whitespace-nowrap"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                ],
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {text}
            </motion.div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};
