import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            One Payment.{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Lifetime Access.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Less than a single supplement bottle. More impact than thousands spent on trial and error.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            {/* Popular badge */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-1 px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg">
                <Zap className="w-4 h-4" />
                Limited Time Offer
              </div>
            </div>

            <div className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2 border-primary shadow-2xl">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="inline-block mb-4">
                  <div className="text-sm text-muted-foreground line-through mb-1">$197</div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-bold">$27</span>
                  </div>
                  <div className="text-lg text-muted-foreground mt-2">One-time payment • Lifetime access</div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4" />
                  Save $170 Today
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={() => navigate('/signup')}
                className="w-full mb-8 h-16 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Get Lifetime Access Now
              </Button>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-center mb-6">Everything Included:</h3>
                {[
                  'Complete 21-day gut-brain protocol',
                  'Unlimited GutBrain AI assistant access',
                  'Daily journal & symptom tracking',
                  'Advanced progress analytics dashboard',
                  'Personalized meal & supplement suggestions',
                  'Priority email support',
                  'All future updates & features (free forever)',
                  'Private community access',
                  'Downloadable resources & guides',
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-base leading-relaxed">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Guarantee */}
              <div className="pt-8 border-t border-border text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  ✓ 30-Day Money-Back Guarantee
                </p>
                <p className="text-xs text-muted-foreground">
                  If you don't see results, we'll refund you. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 text-center space-y-2"
        >
          <p className="text-muted-foreground">Compare to alternatives:</p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="font-semibold mb-1">Functional Medicine</div>
              <div className="text-muted-foreground">$300-500 per visit</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="font-semibold mb-1">Supplement Trial & Error</div>
              <div className="text-muted-foreground">$2,000+ wasted</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="font-semibold mb-1">Gut Health Programs</div>
              <div className="text-muted-foreground">$99-297/month</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
