import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Stethoscope, ShoppingCart, X } from 'lucide-react';
import { useLazyLoad } from '@/hooks/useLazyLoad';

export const ProblemScene = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { isVisible } = useLazyLoad({ threshold: 0.1 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const chatGptY = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const googleY = useTransform(scrollYProgress, [0, 0.5], [-100, 0]);

  if (!isVisible) {
    return <div className="min-h-screen bg-background py-20 px-4" />;
  }

  return (
    <div ref={ref} className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-block px-4 py-2 bg-destructive/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-destructive">
              Over 90% of people quit within 2 weeks
            </span>
          </div>
        </motion.div>

        <motion.h2 
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-center mb-4 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          You've been here before
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-center text-muted-foreground mb-12 sm:mb-16 max-w-3xl mx-auto px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Stuck in the cycle between medical dead-ends and supplement graveyard
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div 
            style={{ y: chatGptY }}
            className="relative p-8 rounded-2xl border-2 border-destructive/20 bg-card"
          >
            <div className="absolute top-4 right-4">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <Stethoscope className="w-12 h-12 mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-4">Traditional Medicine</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>"Your bloodwork is normal" but you still feel awful</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>15-minute appointments, zero gut-brain education</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Prescription that masks symptoms, not root cause</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Left to figure out the gut connection yourself</span>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            style={{ y: googleY }}
            className="relative p-8 rounded-2xl border-2 border-destructive/20 bg-card"
          >
            <div className="absolute top-4 right-4">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <ShoppingCart className="w-12 h-12 mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-4">The Supplement Graveyard</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Cabinet full of half-used bottles ($270B market chaos)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Brand-hopping every few weeks, no consistency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Conflicting protocols, zero personalization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>12% completion rate—you always quit by week 3</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="text-center bg-muted/30 rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
            The real problem isn't information
          </p>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            You know gut health matters. You've read about the gut-brain axis. <br className="hidden sm:block" />
            What you need is structure, personalization, and accountability to actually <span className="font-semibold text-foreground">complete</span> a protocol.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
