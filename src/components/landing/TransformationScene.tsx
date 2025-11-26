import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const testimonials = [
  {
    name: "Sarah M.",
    result: "Finally completed a full protocol",
    quote: "I've bought so many supplements that sit unused. This was different—daily structure and AI check-ins meant I actually followed through for 30 days. My brain fog is gone."
  },
  {
    name: "James R.",
    result: "Gut-brain connection clicked",
    quote: "Doctors said my tests were fine but I felt terrible. Understanding the gut-brain axis and having a clear daily plan changed everything. I'm finally sleeping through the night."
  },
  {
    name: "Maria K.",
    result: "87% completion rate is real",
    quote: "I'm part of that 87%. The AI coach adapted to my responses and kept me accountable. I would've quit any other program by week 2. Day 30 now and feel incredible."
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
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-center mb-6 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Real people. Real results.
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-center text-muted-foreground mb-12 sm:mb-16 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          They stuck to the protocol. 87% completion vs 12% for traditional approaches.
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
                <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 italic">"{testimonial.quote}"</p>
                <div className="mt-auto">
                  <p className="font-bold text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-primary">{testimonial.result}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto mb-12 sm:mb-16 px-4">
            <div className="bg-card border border-primary/20 rounded-xl p-3 sm:p-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">87%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Complete full 30 days</div>
            </div>
            <div className="bg-card border border-primary/20 rounded-xl p-3 sm:p-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">AI coaching access</div>
            </div>
            <div className="bg-card border border-primary/20 rounded-xl p-3 sm:p-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">4-Phase</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Structured protocol</div>
            </div>
          </div>

          <Card className="max-w-2xl mx-auto p-6 sm:p-8 md:p-12 bg-gradient-to-br from-card to-primary/5 border-2 border-primary/20">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Start Your 2-Day Free Trial
            </h3>
            <p className="text-lg sm:text-xl text-muted-foreground mb-2">
              Then just $47/month to transform your gut-brain health
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/80 mb-6 sm:mb-8">
              Join the 87% who actually complete. Not the 90% who quit traditional approaches.
            </p>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 justify-center text-sm sm:text-base">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span>2-day free trial • No card required</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center text-sm sm:text-base">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span>30-day structured protocol with AI coach</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center text-sm sm:text-base">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span>Cancel anytime • Full refund within 30 days</span>
              </div>
            </div>

            <Button 
              onClick={handleCTA}
              size="lg" 
              className="w-full text-base sm:text-lg h-12 sm:h-14 mb-4"
            >
              Get Started Now
            </Button>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Used by people tired of the $270B supplement chaos
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
