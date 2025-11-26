import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { MessageSquare, Search, X } from 'lucide-react';

export const ProblemScene = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const chatGptY = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const googleY = useTransform(scrollYProgress, [0, 0.5], [-100, 0]);

  return (
    <div ref={ref} className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-6xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          You've tried the usual solutions
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div 
            style={{ y: chatGptY }}
            className="relative p-8 rounded-2xl border-2 border-destructive/20 bg-card"
          >
            <div className="absolute top-4 right-4">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <MessageSquare className="w-12 h-12 mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-4">ChatGPT</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Gives you information, but no structure to follow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>No daily check-ins or accountability system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>You close the tab and forget what you learned</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Still stuck figuring out what to do next</span>
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
            <Search className="w-12 h-12 mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-4">Google Search</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>10,000 results saying different things</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Hours of research, still no clarity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Contradictory advice from "experts"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>More confused than when you started</span>
              </li>
            </ul>
          </motion.div>
        </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-2xl md:text-3xl text-muted-foreground italic">
              "I have all the information... but I still don't know what to actually DO."
            </p>
          </motion.div>
      </div>
    </div>
  );
};
