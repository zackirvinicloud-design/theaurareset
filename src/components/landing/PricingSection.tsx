import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  "24/7 access to Journey, your AI nutrition coach",
  "Complete 21-day gut healing protocol",
  "Personalized daily meal plans & recipes",
  "Symptom tracking & progress insights",
  "Phase-specific supplement guidance",
  "Unlimited questions & support",
  "Shopping lists & prep guides",
  "Lifetime access to all content"
];

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Start Your Healing Journey Today
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Everything you need to transform your gut health in 21 days.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-background border-2 border-primary/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        >
          {/* Popular badge */}
          <div className="absolute top-0 right-8 bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold rounded-b-lg">
            Most Popular
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Complete 21-Day Program</h3>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold">$27</span>
              <span className="text-muted-foreground">one-time</span>
            </div>
            <p className="text-muted-foreground">Instant access • Lifetime ownership</p>
          </div>

          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            size="lg" 
            onClick={() => navigate('/signup')}
            className="w-full gap-2 text-lg py-6"
          >
            Get Instant Access
            <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Secure payment • Instant access • Lifetime ownership
          </p>
        </motion.div>

        {/* Guarantee */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <span className="font-semibold text-foreground">30-Day Money-Back Guarantee.</span> If you don't see improvements in your gut health, energy, or mental clarity, we'll refund you completely.
          </p>
        </div>
      </div>
    </section>
  );
};
