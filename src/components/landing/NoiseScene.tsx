import { motion } from 'framer-motion';
import { useLazyLoad } from '@/hooks/useLazyLoad';

const noisyAdvice = [
  "$270 billion market", "Try probiotics", "Eliminate gluten", 
  "Carnivore diet", "More fiber", "Less fiber",
  "Detox cleanse", "Raw foods", "Fermented foods",
  "Keto for gut health", "Veganism heals", "Bone broth protocol",
  "Supplement stacks", "Parasite cleanse", "Candida diet",
  "SIBO treatment", "Low FODMAP", "Prebiotic foods",
  "Intermittent fasting", "Eat every 2 hours", "Juice cleanse",
  "Alkaline water", "Apple cider vinegar", "Collagen peptides",
  "L-Glutamine heals", "Zinc carnosine", "Try this probiotic",
  "Gut inflammation", "Leaky gut syndrome", "Microbiome test",
  "Organic only", "Non-GMO matters", "Grass-fed everything",
  "Seed oils toxic", "Saturated fat good", "Fat makes you fat",
  "Carbs are bad", "Carbs fuel you", "Sugar addiction",
  "Processed foods", "Whole30 protocol", "Paleo lifestyle",
  "Mediterranean diet", "Blue zones secret", "Longevity hacks",
  "Autophagy fasting", "Time-restricted eating", "OMAD diet",
  "High protein", "Plant-based protein", "Whey vs casein",
  "Digestive enzymes", "Betaine HCL", "Ox bile supplement",
  "Psyllium husk", "Chia seeds daily", "Flax seeds ground",
  "Kombucha gut health", "Kefir probiotics", "Sauerkraut healing",
  "Kimchi benefits", "Miso soup daily", "Tempeh protein",
  "Gluten sensitivity", "Celiac disease", "Wheat belly",
  "Dairy inflammatory", "A2 milk better", "Raw milk healing",
  "Lectins damage gut", "Oxalates problem", "Histamine intolerance",
  "Nightshades inflammatory", "AIP protocol", "Elimination diet",
  "Food sensitivity test", "IgG antibodies", "Gut-brain axis",
  "Vagus nerve tone", "Polyvagal theory", "Nervous system",
  "Cortisol belly", "Adrenal fatigue", "Thyroid function",
  "Hormone balance", "Estrogen dominance", "Insulin resistance",
  "Blood sugar spikes", "CGM tracking", "Metabolic health",
  "Mitochondria energy", "NAD+ boosters", "Resveratrol benefits",
  "Turmeric curcumin", "Ginger anti-inflammatory", "Garlic allicin",
  "Omega-3 fatty acids", "Fish oil daily", "Cod liver oil",
  "Vitamin D deficiency", "Magnesium glycinate", "B12 methylated",
  "Folate not folic", "Iron bisglycinate", "Selenium Brazil nuts",
  "Iodine protocol", "Lugol's solution", "Nascent iodine",
  "Chlorella detox", "Spirulina superfood", "Activated charcoal",
  "Bentonite clay", "Zeolite chelation", "Cilantro heavy metals",
  "Coffee enemas", "Castor oil packs", "Dry brushing lymph",
  "Red light therapy", "Cold plunges", "Sauna detox",
  "Grounding earthing", "EMF protection", "Blue light blocking",
  "Mouth taping sleep", "Nose breathing", "Wim Hof method",
  "Buteyko breathing", "Box breathing", "4-7-8 technique",
  "Meditation gut", "Yoga digestion", "Qi gong healing",
  "Acupuncture points", "Reflexology feet", "Massage lymphatic",
  "Functional medicine", "Integrative approach", "Root cause",
  "Holistic healing", "Mind-body connection", "Biohacking optimal"
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
          {noisyAdvice.slice(0, 25).map((text, i) => (
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
