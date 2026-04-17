import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PRODUCT_PRICE, PRODUCT_PRICE_SUFFIX, PRODUCT_TRIAL_LABEL } from '@/lib/product';

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
            Clear Offer.{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              No App-Store Friction.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pay for a 21-day cleanse execution system that works in your browser and can ping you back into the right step.
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
            <div className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2 border-primary shadow-2xl">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="inline-block">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-bold">{PRODUCT_PRICE}</span>
                    <span className="text-2xl font-semibold text-muted-foreground">{PRODUCT_PRICE_SUFFIX}</span>
                  </div>
                  <div className="text-lg text-muted-foreground mt-2">{PRODUCT_TRIAL_LABEL}, then billed annually.</div>
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={() => navigate('/signup')}
                className="w-full mb-8 h-16 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Start My Personalized Plan
              </Button>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-center mb-6">What You Get:</h3>
                {[
                  'A 21-day cleanse command center built around what to do today',
                  'Prep Day setup and shopping guidance',
                  'A daily plan grouped by morning, afternoon, and evening',
                  'Protocol-specific help for questions, symptoms, and troubleshooting',
                  'Optional push reminders that reopen the exact step you need',
                  'No app download required for the core experience',
                  'Budget protection so you know what to buy first',
                  'Ongoing access, reminders, and updates for one simple annual plan',
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

              <div className="pt-8 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  This offer is intentionally narrow so the product stays clear, actionable, and easier to finish.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
