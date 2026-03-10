import { motion } from 'framer-motion';
import { BookOpen, Brain, Calendar, ClipboardList, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Prep Without Guesswork',
    description: 'Start with a focused Prep Day so you know what to buy, remove, and organize before Day 1.',
    stat: 'Prep Day',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500'
  },
  {
    icon: ClipboardList,
    title: "See Today's Plan",
    description: 'Follow a short, structured plan for the current day instead of scanning an entire protocol document.',
    stat: 'Morning to evening',
    color: 'from-primary/20 to-emerald-500/20',
    iconColor: 'text-primary'
  },
  {
    icon: MessageSquare,
    title: 'Get Unstuck Fast',
    description: 'Tap a step or ask a question when you need clarification, meal ideas, or troubleshooting in the current phase.',
    stat: 'Step help',
    color: 'from-rose-500/20 to-red-500/20',
    iconColor: 'text-rose-500'
  },
  {
    icon: Brain,
    title: 'Log What Changes',
    description: 'Keep lightweight notes on symptoms and mood so you can stay aware of patterns without turning this into a data project.',
    stat: 'Simple logs',
    color: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500'
  },
  {
    icon: BookOpen,
    title: 'Keep The Guide Nearby',
    description: 'See the current phase, supplement reminders, and practical tips without bouncing back into a long PDF.',
    stat: 'Reference panel',
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
            Built Around{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Completion.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The product does one job well: turn the protocol into something you can follow without getting lost.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full p-7 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
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
