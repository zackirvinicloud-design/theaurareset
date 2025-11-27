import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Stethoscope, ShoppingCart, X, DollarSign } from 'lucide-react';

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
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-center mb-4 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How Much Money Have You Already Thrown Away?
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-center font-bold mb-2 max-w-3xl mx-auto px-4"
          style={{ color: '#dc2626' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          $500? $1,200? $3,000? More?
        </motion.p>

        <motion.p
          className="text-base sm:text-lg text-center text-muted-foreground mb-16 sm:mb-20 max-w-3xl mx-auto px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          You know the exact number. It makes you sick every time you think about it.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8 mb-20 mt-8">{" "}
          <motion.div 
            style={{ y: googleY }}
            className="relative p-8 rounded-2xl border-2 border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10"
          >
            <div className="absolute top-4 right-4">
              <X className="w-8 h-8 text-destructive" strokeWidth={3} />
            </div>
            <ShoppingCart className="w-12 h-12 mb-4" style={{ color: '#dc2626' }} />
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#dc2626' }}>The Supplement Graveyard</h3>
            <p className="text-sm text-muted-foreground mb-4 italic">Your shame cabinet of $270 billion failure</p>
            <ul className="space-y-4 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">That probiotic you bought for $68.</span> Sitting there 7 months later, 80% full. You took it for 9 days. You don't even remember why you stopped.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">The "gut health stack"</span> the influencer swore by. $147 for 6 bottles. You took them for a week and a half. Felt nothing. Now they mock you every morning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">The new brand</span> you'll try next month. Because THIS time will be different. (It won't. You know it won't. But what else are you supposed to do?)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">Zero accountability.</span> No tracking. No structure. Just you, alone, trying to remember if you took 3 pills or 4. You quit by week 3 every single time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">Your partner sees the cabinet.</span> They don't say anything. They don't have to. You FEEL the judgment. Another failed attempt. Another waste of money you can't get back.</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                <span className="leading-tight font-semibold text-destructive">Add it up. Go ahead. Every bottle. Every "this is the one" moment. It's not dozens. It's HUNDREDS. Maybe thousands. And you're still here.</span>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            style={{ y: chatGptY }}
            className="relative p-8 rounded-2xl border-2 border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10"
          >
            <div className="absolute top-4 right-4">
              <X className="w-8 h-8 text-destructive" strokeWidth={3} />
            </div>
            <Stethoscope className="w-12 h-12 mb-4" style={{ color: '#dc2626' }} />
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#dc2626' }}>Traditional Medicine</h3>
            <p className="text-sm text-muted-foreground mb-4 italic">They profit when you stay sick</p>
            <ul className="space-y-4 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">"Everything came back normal."</span> But you can't sleep. Can't focus. Can't remember the last time you felt GOOD. They send you home with nothing. Because normal labs = no billable treatment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">$380 later</span>, you get 12 minutes and a prescription for an antidepressant or PPI. Big Pharma gets paid. Your gut gets worse. You come back in 3 months. Repeat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">They don't get paid to cure you.</span> They get paid per visit, per prescription, per test. A healthy patient is a lost customer. There's no financial incentive to fix the ROOT cause.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">The gut-brain connection?</span> Not in their medical school curriculum. Not in the insurance playbook. Not profitable for pharma companies selling symptom-masking pills for life.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">"Have you tried therapy?"</span> Translation: "We don't know what's wrong, but we're not going to admit it. Here's a $150/session referral. See you in 6 months when you're worse."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight font-semibold text-destructive">You leave feeling dismissed, gaslit, and wondering if it's "all in your head." (It's not. It's in your gut. They just don't get paid to look there.)</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="text-center bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-6 sm:p-10 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: '#dc2626' }}>
            You're Not Broken. The System Is.
          </p>
          <p className="text-base sm:text-lg md:text-xl text-foreground mb-4 leading-relaxed">
            The doctors won't learn about the gut-brain axis. The supplements can't keep you accountable. The programs don't adapt to YOU.
          </p>
          <p className="text-lg sm:text-xl font-bold text-foreground">
            So you keep spending. Keep failing. Keep hating yourself for "not having discipline."
          </p>
        </motion.div>

        <motion.div 
          className="text-center bg-primary/10 border-2 border-primary/30 rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">
            It's Not About More Information
          </p>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            You already know gut health matters. You've spent 100+ hours reading about it. <br className="hidden sm:block" />
            What you actually need: <span className="font-bold text-primary">Step-by-step guidance. Instant answers to every question. Something that saves you time AND money.</span><br className="hidden sm:block" />
            A structured program with an AI coach who won't let you quit on Day 9.
          </p>
        </motion.div>
      </div>
    </div>
  );
};