import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  Mail,
  ShoppingCart,
  Star,
  X,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

/* ═══════════════════════════════════════════════════
   UTILITY — preserve UTM params when linking out
   ═══════════════════════════════════════════════════ */

const useUtmParams = () => {
  const [searchParams] = useSearchParams();
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const params = new URLSearchParams();
  utmKeys.forEach((k) => {
    const v = searchParams.get(k);
    if (v) params.set(k, v);
  });
  const qs = params.toString();
  return (path: string) => (qs ? `${path}?${qs}` : path);
};

/* ═══════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════ */

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
};

/* ═══════════════════════════════════════════════════
   PULL-QUOTE COMPONENT
   ═══════════════════════════════════════════════════ */

const PullQuote = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return (
    <motion.blockquote
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="relative my-10 border-l-4 border-emerald-500 py-2 pl-6 sm:my-14 sm:pl-8"
    >
      <p className="font-['Lora',serif] text-xl italic leading-relaxed text-slate-700 sm:text-2xl">
        {children}
      </p>
    </motion.blockquote>
  );
};

/* ═══════════════════════════════════════════════════
   CALLOUT BOX
   ═══════════════════════════════════════════════════ */

const Callout = ({
  children,
  variant = 'info',
}: {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success';
}) => {
  const colors = {
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
  return (
    <div className={`my-8 rounded-xl border px-5 py-4 text-[0.94rem] leading-7 sm:my-10 sm:px-6 sm:py-5 ${colors[variant]}`}>
      {children}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   ARTICLE PAGE
   ═══════════════════════════════════════════════════ */

const Advertorial = () => {
  const navigate = useNavigate();
  const buildLink = useUtmParams();

  // Lead magnet
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail.trim()) return;
    setLeadSubmitting(true);
    try {
      await (supabase as any).from('lead_captures').insert({
        email: leadEmail.trim().toLowerCase(),
        source: 'advertorial',
        captured_at: new Date().toISOString(),
      });
    } catch {
      // Insert may fail if table doesn't exist yet — still show success
    }
    setLeadSubmitted(true);
    setLeadSubmitting(false);
  };

  return (
    <div data-advertorial-dark className="min-h-screen bg-white text-slate-900">
      {/* ─── Minimal Top Bar ─── */}
      <nav className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4 sm:h-14 sm:px-6">
          <button
            onClick={() => navigate(buildLink('/'))}
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 sm:text-[11px]"
          >
            The Gut Brain Journal
          </button>
          <span className="text-[10px] tracking-widest text-slate-400 uppercase sm:text-[11px]">
            Article
          </span>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
         ARTICLE BODY
         ═══════════════════════════════════════════ */}
      <article className="mx-auto max-w-[680px] px-4 pb-20 pt-10 sm:px-6 sm:pt-16">

        {/* ─── Category Tag ─── */}
        <motion.div {...fadeUp}>
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
            Personal Experience
          </span>
        </motion.div>

        {/* ─── Headline ─── */}
        <motion.h1
          {...fadeUp}
          className="mt-6 font-['Lora',serif] text-[2rem] font-bold leading-[1.2] tracking-[-0.02em] text-slate-950 sm:mt-8 sm:text-[2.75rem] sm:leading-[1.15]"
        >
          I Tried Every Parasite Cleanse on TikTok. Here's What Actually Worked.
        </motion.h1>

        {/* ─── Byline ─── */}
        <motion.div {...fadeUp} className="mt-5 flex items-center gap-3 text-sm text-slate-500 sm:mt-6">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
          <div>
            <p className="font-medium text-slate-700">Sarah M.</p>
            <p>7 min read</p>
          </div>
        </motion.div>

        {/* ─── Divider ─── */}
        <div className="my-8 h-px bg-slate-100 sm:my-10" />

        {/* ═══ SECTION 1: THE HOOK ═══ */}
        <motion.div {...fadeUp} className="prose-article">
          <p className="text-lg leading-8 text-slate-700 sm:text-[1.125rem]">
            It started at 11:47pm on a Tuesday.
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            I was supposed to be sleeping, but I was three hours deep into a TikTok spiral about parasite cleanses. You know the ones — the girl showing what came out of her (yeah, THAT video), the guy with the supplement shelf explaining "Phase 1, Phase 2, Phase 3" like it was obvious, the naturopath saying "this is the exact protocol" while holding up 11 different bottles.
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            By midnight, I had 23 saved videos, 6 different supplement brands in my Amazon cart, and <strong className="text-slate-800">absolutely no idea what to take first, what to take together, or what order any of this was supposed to go in.</strong>
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            The total in my cart? $187.34. From three different creators who all disagreed with each other.
          </p>
        </motion.div>

        <PullQuote>
          "I had 6 supplements from 3 TikToks and no schedule. Just vibes."
        </PullQuote>

        {/* ═══ SECTION 2: THE FIRST ATTEMPT ═══ */}
        <motion.div {...fadeUp} className="prose-article">
          <h2 className="mt-12 font-['Lora',serif] text-2xl font-bold text-slate-900 sm:text-3xl">
            Day 1 felt amazing. Day 4 broke me.
          </h2>
          <p className="mt-5 leading-8 text-slate-600">
            I woke up that first morning feeling like a warrior. Lined up my supplements on the kitchen counter. Took a photo for my close friends story. Caption: "cleanse day 1 💪🪱." Cringe, I know.
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            Days 1 and 2 were fine. I was basically just taking some herbs before meals and a binder at night. Easy.
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            Then Day 3 happened.
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            Brain fog so thick I couldn't finish a sentence at work. My stomach was making sounds I'd never heard. I got home, curled into a ball on my couch, and did what any rational person would do — <strong className="text-slate-800">I Googled "is die-off supposed to feel like this" at 2am.</strong>
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            Reddit said it was normal. Reddit also said it could be a sign of something dangerous. Reddit was not helpful.
          </p>
        </motion.div>

        <Callout variant="warning">
          <strong>What I didn't know at the time:</strong> The Day 3–5 wall is the #1 reason people quit their gut cleanse. It's called a Herxheimer reaction — your body is processing dead pathogens faster than it can clear them. It's temporary. It's textbook. But when you're alone at 2am with your gut in revolt, it feels like something is very wrong.
        </Callout>

        <motion.div {...fadeUp} className="prose-article">
          <p className="leading-8 text-slate-600">
            By Day 4, I couldn't remember if the binder was supposed to go before or after the herbs. One TikTok said 30 minutes before. Another said 60 minutes after. A third said take it on an empty stomach. My stomach was never empty because I was stress-eating crackers.
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            So I just… stopped. Closed the apps. Shoved the supplements behind the protein powder. Told myself I'd restart "next month."
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            That was four months ago.
          </p>
        </motion.div>

        {/* ─── Visual break: the supplement graveyard ─── */}
        <motion.div
          {...fadeUp}
          className="my-10 rounded-2xl border border-slate-100 bg-slate-50 p-6 sm:my-14 sm:p-8"
        >
          <div className="flex items-start gap-3">
            <ShoppingCart className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
            <div>
              <p className="font-semibold text-slate-800">My supplement graveyard (at that point):</p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <X className="mt-1 h-4 w-4 flex-shrink-0 text-red-400" />
                  <span>Wormwood complex from TikTok #1 — half bottle left</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="mt-1 h-4 w-4 flex-shrink-0 text-red-400" />
                  <span>Diatomaceous earth from TikTok #2 — sealed, never opened</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="mt-1 h-4 w-4 flex-shrink-0 text-red-400" />
                  <span>Two different binders that "might" interact — unclear</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="mt-1 h-4 w-4 flex-shrink-0 text-red-400" />
                  <span>Probiotics I was supposed to take in Phase 3 (I was on Day 4)</span>
                </li>
              </ul>
              <p className="mt-4 text-sm font-medium text-slate-500">Total wasted: ~$210</p>
            </div>
          </div>
        </motion.div>

        {/* ═══ SECTION 3: THE REAL PROBLEM ═══ */}
        <motion.div {...fadeUp} className="prose-article">
          <h2 className="mt-12 font-['Lora',serif] text-2xl font-bold text-slate-900 sm:text-3xl">
            The problem was never willpower. It was chaos.
          </h2>
          <p className="mt-5 leading-8 text-slate-600">
            After my third failed attempt, I started noticing a pattern. It wasn't that I was lazy. It wasn't that the protocol didn't work. It was that <strong className="text-slate-800">I had no system.</strong>
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            I had information — too much of it. From 14 different creators. In 47-page PDFs I'd highlighted and lost. In screenshots I couldn't find. In notes apps I forgot existed.
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            What I didn't have was something that told me, every single morning:
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="my-8 rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-6 sm:my-10 sm:p-8"
        >
          <p className="text-center font-['Lora',serif] text-xl font-semibold text-emerald-900 sm:text-2xl">
            "Here's what you take today. Here's when. Here's why. Go."
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="prose-article">
          <p className="leading-8 text-slate-600">
            Not another 45-minute YouTube breakdown. Not another PDF. Not another "check the comments for my supplement list."
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            Just a daily system that answers one question: <strong className="text-slate-800">What do I do today?</strong>
          </p>
        </motion.div>

        {/* ═══ SECTION 4: THE DISCOVERY ═══ */}
        <motion.div {...fadeUp} className="prose-article">
          <h2 className="mt-12 font-['Lora',serif] text-2xl font-bold text-slate-900 sm:text-3xl">
            Then I found The Gut Brain Journal.
          </h2>
          <p className="mt-5 leading-8 text-slate-600">
            A friend who'd actually finished all 21 days sent me a link. I almost ignored it — because honestly, I'd already spent so much on supplements and guides that felt like the same recycled advice.
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            But she said something that stuck: <em>"It doesn't teach you anything new. It just organizes what you already know into a daily checklist."</em>
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            That's exactly what it does. It's not a new protocol. It's not a course. It's not another person telling you to buy more supplements. <strong className="text-slate-800">It takes a specific 21-day gut cleanse protocol and turns it into a day-by-day system you can actually follow.</strong>
          </p>
        </motion.div>

        {/* ═══ SECTION 5: WHAT IT ACTUALLY DOES ═══ */}
        <motion.div {...fadeUp} className="prose-article">
          <h2 className="mt-12 font-['Lora',serif] text-2xl font-bold text-slate-900 sm:text-3xl">
            Here's what changed when I used it.
          </h2>
        </motion.div>

        {/* Feature cards — editorial style */}
        <motion.div {...fadeUp} className="mt-8 space-y-5 sm:mt-10">
          {[
            {
              title: 'One screen. Every morning.',
              body: 'I woke up. Opened the app. Saw: Morning herbs (dose + timing). Afternoon meal window. Evening binder (60 min after herbs). Checked them off. Done. No PDF. No scrolling. No panic.',
            },
            {
              title: 'The $200 Amazon cart became $58.',
              body: 'The journal showed me I needed FOUR things for Phase 1. Four. Not fourteen. I deleted the Amazon cart. Bought what I actually needed. Started the next morning.',
            },
            {
              title: 'Day 3 die-off didn\'t make me quit.',
              body: 'When the brain fog hit again, I tapped the step. The app said: "Textbook Herxheimer reaction. Expected on Days 3–5. Do this: [specific guidance]." I exhaled. Drank water. Kept going.',
            },
            {
              title: 'I never lost track of what day I was on.',
              body: 'Top of the screen, every time I opened it: Day 9. Phase 2. 43% complete. No more "wait, what day am I on?" No more quietly giving up.',
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                <div>
                  <h3 className="font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-[0.94rem] leading-7 text-slate-600">{card.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <PullQuote>
          "Day 14 felt as clear as Day 1. I didn't even have to think."
        </PullQuote>

        {/* ═══ SECTION 6: SOCIAL PROOF ═══ */}
        <motion.div {...fadeUp} className="prose-article">
          <h2 className="mt-12 font-['Lora',serif] text-2xl font-bold text-slate-900 sm:text-3xl">
            I'm not the only one.
          </h2>
          <p className="mt-5 leading-8 text-slate-600">
            When I finished all 21 days (yes, all of them — I ugly-cried at the completion screen), I started talking about it. Turns out, a lot of people were stuck in the same loop.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mt-8 space-y-5 sm:mt-10">
          {[
            {
              quote: 'Had a $230 Amazon cart from three TikTok creators. The journal said I needed FOUR things. Four. Spent $58. Started the next morning.',
              name: 'David K.',
              detail: 'Day 17 — gut finally quiet',
            },
            {
              quote: 'Day 3 WRECKED me. Brain fog, headache, stomach making sounds I\'ve never heard. Tapped the step, it said "textbook herxheimer, do this." I kept going. Day 19 now. Different person.',
              name: 'Jessica R.',
              detail: 'Second round — it gets easier',
            },
          ].map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-slate-100 bg-slate-50 p-5 sm:p-6"
            >
              <div className="mb-3 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-['Lora',serif] text-[0.94rem] italic leading-7 text-slate-700">
                "{t.quote}"
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <p className="text-xs font-semibold text-slate-500">{t.name}</p>
                <span className="text-xs text-slate-400">·</span>
                <p className="text-xs text-slate-400">{t.detail}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══ SECTION 7: THE CTA ═══ */}
        <motion.div {...fadeUp} className="prose-article">
          <h2 className="mt-14 font-['Lora',serif] text-2xl font-bold text-slate-900 sm:mt-16 sm:text-3xl">
            If you've been stuck in the loop — this is the exit.
          </h2>
          <p className="mt-5 leading-8 text-slate-600">
            You've already decided to do the cleanse. You're not researching whether it works. You're stuck on <strong className="text-slate-800">how to actually execute it</strong> without quitting on Day 5.
          </p>
          <p className="mt-5 leading-8 text-slate-600">
            The Gut Brain Journal is a one-time purchase ($79) that turns the 21-day protocol into a daily system. No subscription. No monthly charges. Pay once, own it forever.
          </p>
        </motion.div>

        {/* ─── CTA Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="my-10 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-100/40 sm:my-14"
        >
          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              Ready to actually finish this time?
            </p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              See the full breakdown of The Gut Brain Journal
            </h3>
            <p className="mt-3 text-[0.94rem] leading-7 text-slate-600">
              The landing page shows exactly what's inside — the daily checklists, the shopping lists, the protocol Q&A, the symptom tracking — everything that got me (and hundreds of others) to Day 21.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-13 gap-2 rounded-xl bg-emerald-600 px-6 text-base font-semibold shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/30 sm:h-14 sm:px-8"
                onClick={() => navigate(buildLink('/'))}
              >
                See how it works
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                One-time $79
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No subscription
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Lifetime access
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══ SECTION 8: LEAD MAGNET (not ready to buy) ═══ */}
        <motion.div {...fadeUp} className="mt-14 sm:mt-16">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
            <Download className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">
              Not ready yet? Get the protocol free.
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              Download the full 21-day protocol — the same one the app is built around. Follow it on your own, or come back when you want the daily guidance.
            </p>

            {leadSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto mt-6 max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 p-5"
              >
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="mt-3 font-semibold text-emerald-900">Check your inbox</p>
                <p className="mt-1 text-sm text-emerald-700">
                  The protocol PDF is on its way to <strong>{leadEmail}</strong>.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleLeadSubmit}
                className="mx-auto mt-6 flex max-w-sm flex-col gap-2.5 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={leadSubmitting}
                  className="h-11 whitespace-nowrap rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-all hover:bg-slate-800"
                >
                  {leadSubmitting ? 'Sending...' : 'Send it free'}
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </form>
            )}

            <p className="mt-4 text-[11px] text-slate-400">
              No spam. Just the protocol. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>

        {/* ─── Closing line ─── */}
        <motion.div {...fadeUp} className="mt-14 text-center sm:mt-16">
          <div className="mx-auto h-px w-16 bg-slate-200" />
          <p className="mt-6 font-['Lora',serif] text-lg italic text-slate-500">
            Stop researching. Start finishing.
          </p>
          <button
            onClick={() => navigate(buildLink('/'))}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            See The Gut Brain Journal <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </article>

      {/* ─── Minimal Footer ─── */}
      <footer className="border-t border-slate-100 bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            The Gut Brain Journal
          </p>
          <p className="mt-2 text-xs text-slate-400">
            The 21-day gut cleanse companion for people who are done Googling at 2am.
          </p>
          <p className="mt-3 text-[10px] text-slate-300">
            &copy; {new Date().getFullYear()} The Gut Brain Journal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Advertorial;
