import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const testimonials = [
  {
    name: "Sarah M.",
    result: "Finally stuck to something",
    quote: "I've tried every diet and supplement stack out there. This was the first time I had a clear structure to follow. No more guessing what to do next."
  },
  {
    name: "James R.",
    result: "No more analysis paralysis",
    quote: "I spent years researching gut health but never committed to anything. Having daily check-ins and a structured protocol made all the difference."
  },
  {
    name: "Maria K.",
    result: "Actually finished a protocol",
    quote: "I've started and quit so many health programs. The daily accountability kept me going when I would've normally given up by week 2."
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
          className="text-4xl md:text-6xl font-bold text-center mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Real people. Real results.
        </motion.h2>

        <motion.p
          className="text-xl text-center text-muted-foreground mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          They cut through the noise. So can you.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="p-6 h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                <div className="mt-auto">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-primary">{testimonial.result}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto p-12 bg-gradient-to-br from-card to-primary/5">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your 2-Day Free Trial
            </h3>
            <p className="text-xl text-muted-foreground mb-8">
              Then just $47 to continue your transformation
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 justify-center">
                <Check className="w-5 h-5 text-primary" />
                <span>2-day free trial</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Check className="w-5 h-5 text-primary" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Check className="w-5 h-5 text-primary" />
                <span>Full refund within 30 days</span>
              </div>
            </div>

            <Button 
              onClick={handleCTA}
              size="lg" 
              className="w-full text-lg h-14"
            >
              Get Started Now
            </Button>

            <p className="text-sm text-muted-foreground mt-6">
              Join hundreds who've cut through the noise
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
