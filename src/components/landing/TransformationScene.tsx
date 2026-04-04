import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const testimonials = [
  {
    name: "James R., Chicago",
    result: "$847 in supplements gathering dust",
    quote: "I spent $847 on supplements last year that are still sitting in my cabinet. This $27 program is the ONLY thing I've actually finished. Day 21 and my wife says I'm a different person."
  },
  {
    name: "Sarah M., Austin",
    result: "$380 doctor visit vs $27 answers",
    quote: "My doctor charged me $380 for a 15-minute appointment that told me nothing. This program gave me answers in the first 48 hours that 3 specialists couldn't figure out in 2 years."
  },
  {
    name: "Maria K., San Diego",
    result: "Skipped the $2,400 retreat",
    quote: "I was about to book a $2,400 'gut health retreat' in Sedona. My friend sent me this instead. Same transformation, 1/100th the price. I owe her dinner."
  }
];

export const TransformationScene = () => {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          "They Said I Was Crazy To Give This Away For $27..."
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-center text-muted-foreground mb-12 sm:mb-16 px-4 italic"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Real people. Real dollar amounts. Real transformations.
        </motion.p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20 px-4">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="p-4 sm:p-6 h-full">
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="mt-auto pt-3 border-t border-border">
                  <p className="font-bold text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-primary font-semibold">{testimonial.result}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="max-w-4xl mx-auto mb-16 sm:mb-20 px-4"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Card className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-card to-primary/5 border-2 border-primary/30">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
              What You're Getting Today
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-base sm:text-lg">Complete 21-Day Gut-Brain Reset System <span className="text-primary">($297 Value)</span></p>
                  <p className="text-sm text-muted-foreground">The exact day-by-day program used by 2,400+ people</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-base sm:text-lg">Journey AI - Instant Granular Guidance <span className="text-primary">($497 Value)</span></p>
                  <p className="text-sm text-muted-foreground">Answer ANY question instantly, save hours of research and costly mistakes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-base sm:text-lg">Step-by-Step Daily Program Structure <span className="text-primary">($197 Value)</span></p>
                  <p className="text-sm text-muted-foreground">Exact play-by-play instructions saving you time, money, and confusion</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-base sm:text-lg">Symptom Tracker + Insights Dashboard <span className="text-primary">($97 Value)</span></p>
                  <p className="text-sm text-muted-foreground">See your transformation in real-time data</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-base sm:text-lg">Private Progress Journal <span className="text-primary">($47 Value)</span></p>
                  <p className="text-sm text-muted-foreground">Your personal record of the journey</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-base sm:text-lg">LIFETIME ACCESS + All Future Updates <span className="text-primary">($297 Value)</span></p>
                  <p className="text-sm text-muted-foreground">We're not done improving. Neither are you.</p>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-primary/20 pt-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg sm:text-xl font-bold">TOTAL VALUE:</span>
                <span className="text-2xl sm:text-3xl font-bold text-muted-foreground line-through">$1,432</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl sm:text-2xl font-bold text-primary">YOUR PRICE TODAY:</span>
                <span className="text-4xl sm:text-5xl font-bold text-primary">$27</span>
              </div>
              <p className="text-center text-sm sm:text-base text-muted-foreground mt-4">
                That's <span className="font-bold text-primary">$1.29/day</span>. Less than the coffee that's destroying your gut.
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto p-6 sm:p-8 md:p-12 bg-gradient-to-br from-card to-background border-2 border-primary/20">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              "Look, I Could Charge $297 For This..."
            </h3>
            
            <p className="text-base sm:text-lg text-muted-foreground mb-4 leading-relaxed">
              And people would pay it. Happily.
            </p>

            <p className="text-base sm:text-lg text-foreground mb-4 leading-relaxed">
              But I remember being where you are—drowning in contradictory advice, spending hundreds on supplements that did nothing, feeling like my own body was betraying me.
            </p>

            <p className="text-base sm:text-lg text-foreground mb-6 leading-relaxed">
              I'm charging $27 because I want <span className="font-bold text-primary">RESULTS</span>, not just customers.
            </p>

            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed italic">
              When you transform, you tell people. That's worth more than any advertising budget.
            </p>

            <div className="bg-primary/10 rounded-lg p-6 mb-8 border border-primary/20">
              <p className="text-lg sm:text-xl font-bold mb-4">So here's the deal:</p>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-base sm:text-lg"><span className="font-bold">Personalized setup first</span> — See your plan before you commit</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-base sm:text-lg"><span className="font-bold">Then $27 one-time</span> (not monthly, not recurring, EVER)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-base sm:text-lg"><span className="font-bold">Lifetime access</span> (I can't take it away even if I wanted to)</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCTA}
              size="lg" 
              className="w-full text-base sm:text-lg h-12 sm:h-14 mb-4 font-bold"
            >
              Yes! Give Me The 21-Day System For Just $27 →
            </Button>

            <p className="text-xs sm:text-sm text-muted-foreground">
              See your personalized plan, then decide. Zero subscription games.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
