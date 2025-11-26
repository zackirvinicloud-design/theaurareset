import { motion } from 'framer-motion';

const noisyAdvice = [
  "$270 billion market", "Try probiotics", "Eliminate gluten", 
  "Carnivore diet", "More fiber", "Less fiber",
  "Detox cleanse", "Raw foods", "Fermented foods",
  "Keto for gut health", "Veganism heals", "Bone broth protocol",
  "Supplement stacks", "Parasite cleanse", "Candida diet",
  "SIBO treatment", "Low FODMAP", "Prebiotic foods"
];

export const NoiseScene = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-background to-muted/20">
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
            className="text-5xl md:text-7xl font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Everyone's Talking
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            But nobody's showing you exactly what to do—and when.
          </motion.p>
        </div>
        
        {/* Floating chaotic text */}
        <div className="absolute inset-0 opacity-20">
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
      </div>
    </div>
  );
};
