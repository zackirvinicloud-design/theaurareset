import { motion } from 'framer-motion';
import { Brain, Calendar, Target, Zap, MessageSquare, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: '21-Day Structured Protocol',
    description: 'No more endless research. Get exact daily actions that actually move the needle on your gut health.',
    stat: '100+ hours saved',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500'
  },
  {
    icon: Brain,
    title: 'Journey AI Assistant',
    description: 'Your personal gut-brain expert. Get granular answers instantly—no waiting, no guessing.',
    stat: 'Answers in seconds',
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500'
  },
  {
    icon: Target,
    title: 'Daily Accountability',
    description: 'Track symptoms, meals, and progress. See exactly what works for YOUR unique biology.',
    stat: '95% completion rate',
    color: 'from-primary/20 to-emerald-500/20',
    iconColor: 'text-primary'
  },
  {
    icon: Zap,
    title: 'Instant Implementation',
    description: 'Start seeing results in days, not months. Our protocol is designed for rapid transformation.',
    stat: 'Results in 3-7 days',
    color: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-500'
  },
  {
    icon: MessageSquare,
    title: 'Conversational Insights',
    description: 'Ask anything. Get personalized recommendations based on your journal entries and progress.',
    stat: 'Unlimited questions',
    color: 'from-rose-500/20 to-red-500/20',
    iconColor: 'text-rose-500'
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Beautiful dashboards showing your gut-brain improvements over time. Data you can actually use.',
    stat: 'Real-time tracking',
    color: 'from-teal-500/20 to-cyan-500/20',
    iconColor: 'text-teal-500'
  },
];

export const FeaturesShowcase = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Everything You Need.{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Nothing You Don't.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            While others give you generic advice, we give you a personalized roadmap with AI-powered support every step of the way.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {feature.stat}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
