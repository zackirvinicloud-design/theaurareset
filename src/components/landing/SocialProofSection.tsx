import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Sarah M.",
    result: "Lost brain fog in Week 1",
    quote: "I didn't realize how much inflammation was affecting my thinking until it cleared. Journey's daily guidance made it so easy to follow.",
    rating: 5
  },
  {
    name: "Marcus T.",
    result: "Energy levels doubled",
    quote: "The protocol is intense but Journey breaks it down perfectly. I actually understand what's happening in my body for the first time.",
    rating: 5
  },
  {
    name: "Jessica L.",
    result: "Anxiety significantly reduced",
    quote: "The gut-brain connection is real. My mood stabilized as my gut healed. Journey helped me stay consistent through the tough days.",
    rating: 5
  }
];

export const SocialProofSection = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Real Transformations
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            See what happens when you actually complete the 21 days.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background border border-border rounded-2xl p-8"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-lg font-semibold mb-2 text-primary">{testimonial.result}</p>
              <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.quote}"</p>
              <p className="text-sm font-medium">— {testimonial.name}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground mb-1">10,000+</p>
              <p className="text-sm">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground mb-1">4.9/5</p>
              <p className="text-sm">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground mb-1">21 Days</p>
              <p className="text-sm">To Transform</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
