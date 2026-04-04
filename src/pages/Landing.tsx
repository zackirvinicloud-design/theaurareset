import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { Plus, X, ArrowRight } from 'lucide-react';

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const CYCLING_WORDS = [
  'GUESSING',
  'GOOGLING',
  'DOOMSCROLLING',
  'PODCASTING',
  'WINGING',
  'OVERTHINKING',
];

const WEEKS = [
  {
    id: 1,
    label: 'WEEK 1',
    name: 'PREP',
    description: 'Gather your supplies. Understand the protocol. Remove the guesswork before Day 1 even starts.',
    goal: ['Organize', 'Simplify'],
    techniques: ['Shopping list', 'Supplement timing', 'Phase overview'],
    image: '/week-tangerine.jpg',
  },
  {
    id: 2,
    label: 'WEEK 2',
    name: 'CLEANSE',
    description: 'Follow the daily plan. Check things off. Know exactly what to take, when to take it, and what to expect.',
    goal: ['Execute', 'Track'],
    techniques: ['Daily checklist', 'Symptom logging', 'Die-off guidance'],
    image: '/week-mango.jpg',
  },
  {
    id: 3,
    label: 'WEEK 3',
    name: 'RESTORE',
    description: 'Rebuild and strengthen. Transition from cleanse to maintenance with the same day-by-day clarity.',
    goal: ['Rebuild', 'Sustain'],
    techniques: ['Probiotic timing', 'Diet reintroduction', 'Progress review'],
    image: '/week-apple.jpg',
  },
];

const FAQS = [
  {
    q: 'What protocol does this follow?',
    a: 'A specific 21-day gut cleanse protocol that works — but is nearly impossible to follow from a PDF alone. The journal organizes 47 pages of dense information into a simple daily checklist.',
  },
  {
    q: 'Do I need to understand supplements?',
    a: 'Not at all. The journal tells you exactly what to take, when to take it, and in what order. Think of it as a recipe — you follow the steps, not study the chemistry.',
  },
  {
    q: 'Who is this for?',
    a: 'Anyone who has decided to do a gut reset but feels overwhelmed by the how. If you have supplements on your counter and no clear schedule, this was built for you.',
  },
  {
    q: 'How is the program structured?',
    a: 'Three phases over 21 days: Prep (gather supplies and understand the plan), Cleanse (daily execution with checklist guidance), and Restore (rebuild and transition to maintenance).',
  },
  {
    q: 'How long are the daily sessions?',
    a: 'Most people spend 2-5 minutes in the app each day. Open it, check your plan, follow the steps, move on. This is not a time commitment — it is a clarity tool.',
  },
  {
    q: 'What if I have questions mid-protocol?',
    a: 'Tap any step for an instant, protocol-specific answer. No Googling. No Reddit. No guessing at 2am whether your symptoms are normal.',
  },
  {
    q: 'Is this a subscription?',
    a: 'No. One payment. Lifetime access. No monthly charges, no premium tiers, no sneaky billing.',
  },
  {
    q: 'What results can I expect?',
    a: 'The journal helps you actually finish the 21-day protocol instead of quitting on Day 5. Completion is the goal — and with structure, most people make it further than they ever have before.',
  },
  {
    q: 'Can I use this on my phone?',
    a: 'Yes — that is how most people use it. Wake up, open the journal on your phone, check today\'s plan, follow it. It works on any device with a browser.',
  },
  {
    q: 'Can I restart or repeat the program?',
    a: 'Absolutely. Your access is permanent. Restart anytime, repeat as many rounds as you want.',
  },
];

/* ═══════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════ */

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="faq-trigger"
      >
        <span className="faq-question">{q}</span>
        <span className={`faq-icon ${open ? 'faq-icon--open' : ''}`}>
          {open ? <X size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="faq-answer-wrapper"
          >
            <p className="faq-answer">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   LANDING
   ═══════════════════════════════════════════════════ */

const Landing = () => {
  const navigate = useNavigate();
  const [activeWeek, setActiveWeek] = useState(0);
  const [logoVisible, setLogoVisible] = useState(true);
  const [displayWord, setDisplayWord] = useState(CYCLING_WORDS[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const wordIndex = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      setLogoVisible(window.scrollY < window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Typewriter cycling effect
  useEffect(() => {
    const currentFull = CYCLING_WORDS[wordIndex.current];

    if (!isDeleting && displayWord === currentFull) {
      // Pause before deleting
      const pause = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(pause);
    }

    if (isDeleting && displayWord === '') {
      // Move to the next word
      wordIndex.current = (wordIndex.current + 1) % CYCLING_WORDS.length;
      setIsDeleting(false);
      return;
    }

    const speed = isDeleting ? 50 : 80;
    const timer = setTimeout(() => {
      if (isDeleting) {
        setDisplayWord((prev) => prev.slice(0, -1));
      } else {
        const target = CYCLING_WORDS[wordIndex.current];
        setDisplayWord((prev) => target.slice(0, prev.length + 1));
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayWord, isDeleting]);

  const currentWeek = WEEKS[activeWeek];

  return (
    <div className="open-landing">
      {/* ─── Fixed Logo ─── */}
      <header className={`open-header ${!logoVisible ? 'open-header--hidden' : ''}`}>
        <div className="open-logo">
          <span>T</span>
          <span>h</span>
          <span>e</span>
          <span className="open-logo-space" />
          <span>G</span>
          <span>u</span>
          <span>t</span>
          <span className="open-logo-space" />
          <span>B</span>
          <span>r</span>
          <span>a</span>
          <span>i</span>
          <span>n</span>
          <span className="open-logo-space" />
          <span>J</span>
          <span>o</span>
          <span>u</span>
          <span>r</span>
          <span>n</span>
          <span>a</span>
          <span>l</span>
        </div>
      </header>

      {/* ═════════════════════════════════════════════
         SECTION 1 — HERO (Full-bleed cinematic)
         ═════════════════════════════════════════════ */}
      <section className="open-hero">
        <div className="open-hero__bg">
          <img
            src="/hero-blueberry.png"
            alt=""
            className="open-hero__img"
          />
          <div className="open-hero__overlay" />
        </div>

        <div className="open-hero__content">
          <div className="open-hero__left">
            <motion.h1
              className="open-hero__title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="open-hero__line-stop">STOP</span>
              <span className="open-hero__line-verb">
                <span className="open-hero__cycling-word">
                  {displayWord}
                  <span className="open-hero__cursor">|</span>
                </span>
              </span>
              <span className="open-hero__line-rest">YOUR WAY THROUGH</span>
              <span className="open-hero__line-rest">A GUT CLEANSE</span>
            </motion.h1>

            <motion.div
              className="open-hero__pills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="open-hero__pill">Reduce Bloating</span>
              <span className="open-hero__pill">Clear Brain Fog</span>
              <span className="open-hero__pill">Finish the Protocol</span>
            </motion.div>
          </div>

          <motion.p
            className="open-hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            21-day guided gut reset protocol to organize your supplements, follow a daily plan, and actually finish what you started.
          </motion.p>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
         SECTION 2 — 21-DAY PROGRAM (Tabs + Image)
         ═════════════════════════════════════════════ */}
      <section className="open-program">
        <div className="open-program__inner">
          {/* Subtle header row */}
          <div className="open-program__header-row">
            <span className="open-program__heading">21-DAY PROGRAM</span>
            <span className="open-program__heading-right">GUT RESET • PROTOCOL</span>
          </div>

          {/* Image first */}
          <div className="open-program__image-area">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeWeek}
                src={currentWeek.image}
                alt={currentWeek.name}
                className="open-program__image"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
          </div>

          {/* Tabs */}
          <div className="open-program__tabs">
            {WEEKS.map((week, i) => (
              <button
                key={week.id}
                onClick={() => setActiveWeek(i)}
                className={`open-program__tab ${activeWeek === i ? 'open-program__tab--active' : ''}`}
              >
                <span className="open-program__tab-label">{week.label}</span>
                <span className="open-program__tab-name">{week.name}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWeek}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="open-program__details"
            >
              <p className="open-program__description">{currentWeek.description}</p>

              <div className="open-program__meta">
                <div className="open-program__meta-group">
                  <span className="open-program__meta-label">GOAL</span>
                  {currentWeek.goal.map((g) => (
                    <span key={g} className="open-program__meta-value">{g}</span>
                  ))}
                </div>
                <div className="open-program__meta-group">
                  <span className="open-program__meta-label">WHAT YOU GET</span>
                  {currentWeek.techniques.map((t) => (
                    <span key={t} className="open-program__meta-value">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
         SECTION 3 — YOUR DAILY PRACTICE
         ═════════════════════════════════════════════ */}
      <section className="open-daily">
        <div className="open-daily__bg">
          <img
            src="/daily-oranges.jpg"
            alt=""
            className="open-daily__bg-img"
          />
          <div className="open-daily__bg-overlay" />
        </div>
        <div className="open-daily__content">
          <h2 className="open-daily__heading">YOUR DAILY PLAN</h2>
          <p className="open-daily__subheading">
            Wake up. Open the journal. Follow today's checklist. Supplements, meals, timing — all organized so you never have to think about what comes next.
          </p>
        </div>
        <div className="open-daily__footer">
          <div className="open-daily__stat">
            <span className="open-daily__stat-label">LEVELS</span>
            <span className="open-daily__stat-value">ALL</span>
          </div>
          <div className="open-daily__stat">
            <span className="open-daily__stat-label">LENGTH</span>
            <span className="open-daily__stat-value">2-5 MIN</span>
          </div>
          <div className="open-daily__stat">
            <span className="open-daily__stat-label">CATEGORY</span>
            <span className="open-daily__stat-value">PROTOCOL + TRACK</span>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
         SECTION 4 — FAQ
         ═════════════════════════════════════════════ */}
      <section className="open-faq">
        <div className="open-faq__inner">
          <div className="open-faq__left">
            <h2 className="open-faq__heading">FAQ</h2>
          </div>
          <div className="open-faq__right">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
         STICKY CTA
         ═════════════════════════════════════════════ */}
      <div className="open-sticky-cta">
        <button
          className="open-sticky-cta__button"
          onClick={() => navigate('/signup')}
        >
          Start here <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Landing;
