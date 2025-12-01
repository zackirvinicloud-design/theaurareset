import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Monthly',
    price: '$29',
    period: '/month',
    description: 'Perfect for trying it out',
    features: [
      'Full 21-day protocol access',
      'Unlimited AI assistant queries',
      'Daily journal & tracking',
      'Progress analytics',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Quarterly',
    price: '$69',
    period: '/3 months',
    savings: 'Save 20%',
    description: 'Most popular choice',
    features: [
      'Everything in Monthly, plus:',
      'Priority AI response times',
      'Advanced analytics dashboard',
      'Personalized meal suggestions',
      'Priority support',
      'Exclusive community access',
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Annual',
    price: '$199',
    period: '/year',
    savings: 'Save 43%',
    description: 'Best value for serious results',
    features: [
      'Everything in Quarterly, plus:',
      'One-on-one protocol optimization',
      'Custom supplement recommendations',
      'Lifetime access to updates',
      'VIP support (24hr response)',
      'Early access to new features',
    ],
    cta: 'Start Free Trial',
    popular: false
  }
];

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Investment in Your Health.{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Not Another Expense.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Less than a single doctor's visit. More impact than years of trial and error.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`relative h-full p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular 
                  ? 'bg-primary/5 border-primary shadow-xl scale-105' 
                  : 'bg-card border-border hover:border-primary/40 hover:shadow-lg'
              }`}>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  {plan.savings && (
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                      {plan.savings}
                    </div>
                  )}
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/signup')}
                  className={`w-full mb-6 h-12 text-base font-semibold ${
                    plan.popular ? 'shadow-lg' : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center text-muted-foreground"
        >
          <p className="mb-2">✓ 7-day free trial • Cancel anytime • No hidden fees</p>
          <p className="text-sm">Compare: Average functional medicine visit: $300-500/session</p>
        </motion.div>
      </div>
    </section>
  );
};
