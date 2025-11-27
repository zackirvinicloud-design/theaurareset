import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Stethoscope, ShoppingCart, X, DollarSign } from 'lucide-react';
export const ProblemScene = () => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const chatGptY = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const googleY = useTransform(scrollYProgress, [0, 0.5], [-100, 0]);
  return <div ref={ref} className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-center mb-4 px-4" initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }}>How Much Time and Money Have You Already Wasted?</motion.h2>

        <motion.p className="text-base sm:text-lg md:text-xl text-center font-bold mb-2 max-w-3xl mx-auto px-4" style={{
        color: '#dc2626'
      }} initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.2
      }}>Thousands of Dollars? Years of Life?</motion.p>

        <motion.p className="text-base sm:text-lg text-center text-muted-foreground mb-16 sm:mb-20 max-w-3xl mx-auto px-4" initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.3
      }}>It may make you sick to think about it.</motion.p>

        <div className="grid md:grid-cols-2 gap-8 mb-20 mt-8">{" "}
          <motion.div style={{
          y: googleY
        }} className="relative p-8 rounded-2xl border-2 border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10">
            <div className="absolute top-4 right-4">
              <X className="w-8 h-8 text-destructive" strokeWidth={3} />
            </div>
            <ShoppingCart className="w-12 h-12 mb-4" style={{
            color: '#dc2626'
          }} />
            <h3 className="text-2xl font-bold mb-2" style={{
            color: '#dc2626'
          }}>The Supplement Graveyard</h3>
            <p className="text-sm text-muted-foreground mb-4 italic">Your shame cabinet of wasted time and money</p>
            <ul className="space-y-4 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">That probiotic you bought for $68.</span> Sitting there 7 months later, 80% full. You took it for 9 days. You spent 6 hours researching which one to buy. You don't even remember why you stopped.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">The "gut health stack"</span> the influencer swore by. $147 for 6 bottles plus 4 hours watching videos and reading reviews. Took them for a week and a half. Felt nothing. Now they mock you every morning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">The research rabbit holes.</span> Entire Saturday afternoons lost to conflicting advice. Reddit threads. YouTube videos. Blog posts. 20+ hours trying to figure out what works. Still confused.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">Zero accountability. No structure.</span> Just you, alone, trying to remember if you took 3 pills or 4. No one tracking your progress. You quit by week 3 every single time because there's no guidance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">Your partner sees the cabinet.</span> They see you still scrolling gut health articles at 11pm. They don't say anything. They don't have to. Another failed attempt. Another waste of TIME and money you can't get back.</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                <span className="leading-tight font-semibold text-destructive">Add it ALL up. Every bottle. Every hour researching. Every "this is the one" moment. It's not dozens. It's HUNDREDS of hours and THOUSANDS of dollars. And you're still here, still searching.</span>
              </li>
            </ul>
          </motion.div>

          <motion.div style={{
          y: chatGptY
        }} className="relative p-8 rounded-2xl border-2 border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10">
            <div className="absolute top-4 right-4">
              <X className="w-8 h-8 text-destructive" strokeWidth={3} />
            </div>
            <Stethoscope className="w-12 h-12 mb-4" style={{
            color: '#dc2626'
          }} />
            <h3 className="text-2xl font-bold mb-2" style={{
            color: '#dc2626'
          }}>Traditional Medicine</h3>
            <p className="text-sm text-muted-foreground mb-4 italic">They waste your time AND your money</p>
            <ul className="space-y-4 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">"Everything came back normal."</span> But you can't sleep. Can't focus. You took 3 hours off work, waited 45 minutes in the lobby, spent $380 for 12 minutes. They send you home with nothing. Time AND money, gone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">Months of appointments</span> that lead nowhere. Each one: time off work, driving, waiting rooms, parking fees. $380 per visit. A prescription for an antidepressant or PPI. Your gut gets worse. You come back in 3 months. Repeat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">They don't get paid to cure you quickly.</span> They get paid per visit, per prescription, per test. A healthy patient is a lost customer. No financial incentive to fix the ROOT cause fast. Your time doesn't matter to them.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">The gut-brain connection?</span> Not in their medical school curriculum. Not in the insurance playbook. They have 12 minutes per patient. No time to actually understand YOU. Not profitable for pharma companies.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight"><span className="font-bold">"Have you tried therapy?"</span> Translation: "We don't know what's wrong, but we're not going to admit it. Here's a $150/session referral. More time. More money. See you in 6 months when you're worse."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1 font-bold text-lg">•</span>
                <span className="leading-tight font-semibold text-destructive">You leave feeling dismissed, gaslit, and wondering if it's "all in your head." (It's not. It's in your gut. They just don't get paid—or have TIME—to look there.)</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div className="text-center bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-6 sm:p-10 mb-12" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.3
      }}>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{
          color: '#dc2626'
        }}>
            You're Not Broken. The System Is.
          </p>
          <p className="text-base sm:text-lg md:text-xl text-foreground mb-4 leading-relaxed">
            The doctors won't learn about the gut-brain axis AND waste your time with useless visits. The supplements can't keep you accountable AND drain your bank account. The programs don't adapt to YOU AND leave you drowning in research.
          </p>
          <p className="text-lg sm:text-xl font-bold text-foreground">
            So you keep spending hours. Keep spending money. Keep failing. Keep hating yourself for "not having discipline."
          </p>
        </motion.div>

        <motion.div className="text-center bg-primary/10 border-2 border-primary/30 rounded-2xl p-6 sm:p-8" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.5
      }}>
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
    </div>;
};