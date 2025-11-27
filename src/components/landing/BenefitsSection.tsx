import { Brain, Sparkles, Calendar, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: MessageSquare,
    title: "Your AI Nutrition Coach",
    description: "Journey learns your symptoms, guides your healing, and adapts to your progress every single day."
  },
  {
    icon: Calendar,
    title: "Structured 21-Day Protocol",
    description: "Clear daily guidance through fungal, parasite, and heavy metal elimination phases—no guesswork."
  },
  {
    icon: Brain,
    title: "Gut-Brain Healing",
    description: "Address the root cause: inflammation, neurotransmitter balance, and cellular health through food."
  },
  {
    icon: Sparkles,
    title: "Personalized Support",
    description: "Ask questions anytime. Get recipes, troubleshoot symptoms, and stay motivated with Journey's wisdom."
  }
];

export const BenefitsSection = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            What You Get for $27
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you saw on TikTok, plus the complete protocol and unlimited coaching.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
