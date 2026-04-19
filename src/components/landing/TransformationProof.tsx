import { motion } from 'framer-motion';
import { CheckCircle2, CircleSlash2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Prep once',
    description: 'Get your kitchen, supplements, and shopping list ready before the protocol starts.',
  },
  {
    number: '02',
    title: 'Follow today',
    description: 'Open the app and see the current day grouped into clear morning, afternoon, and evening actions.',
  },
  {
    number: '03',
    title: 'Ask and log',
    description: 'Use GutBrain for clarification and keep lightweight notes in your journal as you go.',
  },
];

const goodFit = [
  'People who want a clear daily plan instead of more research.',
  'People willing to follow a structured 21-day cleanse.',
  'People who want guidance without hiring a coach.',
];

const notFit = [
  'People looking for medical diagnosis or urgent care.',
  'People who want a fully custom protocol engine.',
  'People who prefer content browsing over step-by-step execution.',
];

export const TransformationProof = () => {
  return (
    <section className="py-32 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            How It{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Works.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The cleanse gets easier when the product stays focused on the job: prep, follow, and keep moving.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="h-full p-8 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold mb-6">
                  {step.number}
                </div>
                
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid lg:grid-cols-2 gap-8"
        >
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8">
            <h3 className="text-2xl font-bold mb-5">Best fit for</h3>
            <div className="space-y-4">
              {goodFit.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8">
            <h3 className="text-2xl font-bold mb-5">Not built for</h3>
            <div className="space-y-4">
              {notFit.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CircleSlash2 className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
