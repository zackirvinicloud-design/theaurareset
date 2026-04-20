import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Plus, X } from 'lucide-react';
import { PRODUCT_PRICE_SUMMARY, PRODUCT_PRICE_WITH_INTERVAL, PRODUCT_TRIAL_LABEL } from '@/lib/product';
import { PROTOCOL_ROADMAP_PHASES } from '@/lib/protocol-roadmap';
import './Landing.css';

const START_PATH = `/setup/profile?redirect=${encodeURIComponent('/payment-required')}`;
const LOGIN_PATH = '/auth';
const DESKTOP_DEMO_PLAYBACK_RATE = 0.9;
const MOBILE_FRAME_INTERVAL_MS = 1000;

const CYCLING_WORDS = [
  'GUESSING',
  'GOOGLING',
  'DOOMSCROLLING',
  'PODCASTING',
  'WINGING',
  'OVERTHINKING',
];

const LANDING_PHASE_IDS = ['week-1', 'week-2', 'week-3'] as const;
type LandingPhaseId = typeof LANDING_PHASE_IDS[number];

const LANDING_PHASE_IMAGES: Record<LandingPhaseId, string> = {
  'week-1': '/daily-oranges.jpg',
  'week-2': '/week-tangerine.jpg',
  'week-3': '/week-cosmos-reference.webp',
};

const WEEKS = LANDING_PHASE_IDS.map((phaseId, index) => {
  const phase = PROTOCOL_ROADMAP_PHASES.find((entry) => entry.id === phaseId);

  if (!phase) {
    throw new Error(`Missing roadmap phase ${phaseId}`);
  }

  return {
    id: index + 1,
    label: phase.railLabel.toUpperCase(),
    name: phase.title.replace(/^Week\s+\d+:\s*/i, '').toUpperCase(),
    shortPromise: phase.shortPromise,
    overview: phase.overview,
    image: LANDING_PHASE_IMAGES[phaseId],
  };
});

const DESKTOP_SHOWCASE = {
  title: 'The End of the "Wing It" Method.',
  description: 'Trying to follow a 21-day protocol from scattered PDFs and saved TikToks is a guaranteed path to confusion. The Gut Brain Journal turns it into one clean daily workspace: what to do, what to buy, what to prep, and what matters next.',
  mediaBase: '/landing-media/desktop-app-demo',
} as const;

const DESKTOP_SHOWCASE_POINTS = [
  'Open "Today" and see your checklist, timing windows, and meals in one place.',
  'Use the shopping list to buy only what this phase needs instead of panic-buying random extras.',
  'Set reminders so the day stays on schedule even when life gets noisy.',
  'Ask GutBrain for help with meals, shopping, missed steps, and schedule friction.',
  'Keep simple daily check-ins so you can review the pattern later without guessing from memory.',
  'Use the roadmap to see where you are, what changes next, and what to prep before it sneaks up on you.',
  'Drop the mental overhead. The app keeps the next step obvious.',
] as const;

const MOBILE_DEMO_CARDS = [
  {
    id: 'today-mobile',
    label: 'Daily Directives',
    title: 'Wake up. Open the app. Execute.',
    description: 'Your meals, timing windows, and checklists are laid out clearly. No re-reading the protocol every three hours to figure out your next move.',
    value: 'Zero guesswork. You always know what to do.',
    frames: [
      '/landing-media/mobile-today-seq-1.png',
      '/landing-media/mobile-today-seq-2.png',
      '/landing-media/mobile-today-seq-3.png',
      '/landing-media/mobile-today-seq-4.png',
    ],
  },
  {
    id: 'gutbrain-mobile',
    label: 'On-the-Go Help',
    title: 'A practical reset when the day gets messy.',
    description: 'When you miss a step or get overwhelmed, GutBrain helps you simplify the rest of the day around food, timing, shopping, and the next move.',
    value: 'Hard days stop turning into full restarts.',
    frames: [
      '/landing-media/mobile-coach-seq-1.png',
      '/landing-media/mobile-coach-seq-2.png',
      '/landing-media/mobile-coach-seq-3.png',
      '/landing-media/mobile-coach-seq-4.png',
    ],
  },
  {
    id: 'shopping-mobile',
    label: 'Immediate Action',
    title: 'Stop panic-buying random bottles.',
    description: 'You get a phase-by-phase shopping plan. Get exactly what you need for Day 1, skip the fluff, and stop wasting money.',
    value: 'You start organized, not overwhelmed.',
    frames: [
      '/landing-media/mobile-shopping-seq-1.png',
      '/landing-media/mobile-shopping-seq-2.png',
      '/landing-media/mobile-shopping-seq-3.png',
      '/landing-media/mobile-shopping-seq-4.png',
      '/landing-media/mobile-shopping-seq-5.png',
    ],
  },
] as const;

const OFFER_ITEMS = [
  'A clear Prep Day setup so Day 1 feels obvious',
  'Day-by-day checklists with meals, timing, and reminders',
  'GutBrain help for shopping, food swaps, and missed steps',
];

const COMMAND_CENTER_SUBTEXT = 'Wake up. Open the journal. See today\'s checklist, timing windows, meals, and reminders in one place. Everything important for today is easy to find.';

const FIT_ITEMS = [
  'You already bought supplements but still do not have a clear schedule',
  'You quit last time because the plan got confusing by Day 3 or 4',
  'You want structure, not more research',
];

const FAQS = [
  {
    q: 'Do I really need this if I already have the PDFs?',
    a: 'Probably. A PDF will not organize your day, send reminders, keep your shopping clean, or show the next step at a glance. This is a daily workspace, not a reading assignment.',
  },
  {
    q: 'I already bought products from a TikTok creator. Can I use this?',
    a: 'Absolutely. That is exactly who we built this for. You have the bottles on your counter but no system, and the app turns that pile into a simple daily plan.',
  },
  {
    q: 'Is this a monthly subscription?',
    a: `No monthly bill. It starts with a ${PRODUCT_TRIAL_LABEL}, then becomes ${PRODUCT_PRICE_WITH_INTERVAL}. Cancel before renewal if it is not helping.`,
  },
  {
    q: 'Will this cure my IBS / SIBO / Gut Issues?',
    a: 'No. The Gut Brain Journal is planning software, not medical care. It helps you organize a protocol, follow the daily structure, and keep your progress in one place.',
  },
];

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

const Landing = () => {
  const navigate = useNavigate();
  const [activeWeek, setActiveWeek] = useState(0);
  const [logoVisible, setLogoVisible] = useState(true);
  const [displayWord, setDisplayWord] = useState(CYCLING_WORDS[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mobileFrameTick, setMobileFrameTick] = useState(0);
  const wordIndex = React.useRef(0);
  const proofSectionRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setLogoVisible(window.scrollY < window.innerHeight * 0.6);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const currentFull = CYCLING_WORDS[wordIndex.current];

    if (!isDeleting && displayWord === currentFull) {
      const pause = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(pause);
    }

    if (isDeleting && displayWord === '') {
      wordIndex.current = (wordIndex.current + 1) % CYCLING_WORDS.length;
      setIsDeleting(false);
      return;
    }

    const speed = isDeleting ? 45 : 78;
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMobileFrameTick((prev) => prev + 1);
    }, MOBILE_FRAME_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  const currentWeek = WEEKS[activeWeek];

  const handleStart = () => {
    navigate(START_PATH);
  };

  const handleLogin = () => {
    navigate(LOGIN_PATH);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleScrollToTop();
    }
  };

  const renderVideoSources = (mediaBase: string) => (
    <>
      <source src={`${mediaBase}.webm`} type="video/webm" />
    </>
  );

  const applyPlaybackRate = (
    event: React.SyntheticEvent<HTMLVideoElement>,
    playbackRate: number,
  ) => {
    if (event.currentTarget.playbackRate !== playbackRate) {
      event.currentTarget.playbackRate = playbackRate;
    }
  };

  const renderProgramSection = (variantClassName: string) => (
    <section className={`open-program ${variantClassName}`}>
      <div className="open-program__inner">
        <div className="open-program__header-row">
          <span className="open-program__heading">21-DAY CLEANSE</span>
          <span className="open-program__heading-right">SETUP • WEEK 1 • WEEK 2 • WEEK 3</span>
        </div>

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

        <div className="open-program__tabs">
          {WEEKS.map((week, index) => (
            <button
              key={week.id}
              onClick={() => setActiveWeek(index)}
              className={`open-program__tab ${activeWeek === index ? 'open-program__tab--active' : ''}`}
            >
              <span className="open-program__tab-label">{week.label}</span>
              <span className="open-program__tab-name" aria-label={week.name}>
                {week.name.split(' ').map((word, wordIndex) => (
                  <span key={`${week.id}-${wordIndex}`} className="open-program__tab-name-word">
                    {word}
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeWeek}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="open-program__details"
          >
            <p className="open-program__promise">{currentWeek.shortPromise}</p>
            <p className="open-program__description">{currentWeek.overview}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );

  return (
    <div className="open-landing">
      {/* Launch urgency banner */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'linear-gradient(90deg, #065f46, #047857)',
        color: '#ecfdf5',
        textAlign: 'center',
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        transform: !logoVisible ? 'translateY(0)' : 'translateY(-100%)',
        opacity: !logoVisible ? 1 : 0,
        transition: 'transform 0.4s ease, opacity 0.4s ease',
        pointerEvents: !logoVisible ? 'auto' : 'none',
      }}>
        START FREE TODAY — {PRODUCT_PRICE_SUMMARY}
      </div>
      <header className={`open-header ${!logoVisible ? 'open-header--hidden' : ''}`}>
        <div className="open-header__inner">
          <div
            className="open-logo"
            onClick={handleScrollToTop}
            onKeyDown={handleLogoKeyDown}
            role="button"
            tabIndex={0}
          >
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
          <button
            type="button"
            className="open-header__login"
            onClick={handleLogin}
          >
            Log in
          </button>
        </div>
      </header>

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
              <span className="open-hero__line-rest">A 21-DAY PROTOCOL</span>
            </motion.h1>
          </div>

          <motion.p
            className="open-hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {COMMAND_CENTER_SUBTEXT}
          </motion.p>
        </div>
      </section>

      {renderProgramSection('open-program--mobile')}

      <section className="open-proof" ref={proofSectionRef}>
        <div className="open-proof__inner">
          <div className="open-proof__intro">
            <span className="open-proof__eyebrow">THE BRUTAL TRUTH</span>
            <h2 className="open-proof__title">
              You will crack without a system.
            </h2>
            <p className="open-proof__description">
              When confusion hits on Day 3, most people start freestyling. See how the app keeps the next step obvious.
            </p>
          </div>

          <div className="open-proof__desktop-demo">
            <div className="open-proof__desktop-stage">
              <video
                key={DESKTOP_SHOWCASE.mediaBase}
                className="open-proof__desktop-video"
                poster={`${DESKTOP_SHOWCASE.mediaBase}.png`}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={DESKTOP_SHOWCASE.title}
                onLoadedMetadata={(event) => applyPlaybackRate(event, DESKTOP_DEMO_PLAYBACK_RATE)}
                onPlay={(event) => applyPlaybackRate(event, DESKTOP_DEMO_PLAYBACK_RATE)}
              >
                {renderVideoSources(DESKTOP_SHOWCASE.mediaBase)}
              </video>
            </div>
          </div>

          <div className="open-proof__desktop-copy">
            <h3 className="open-proof__desktop-title">{DESKTOP_SHOWCASE.title}</h3>
            <p className="open-proof__desktop-description">{DESKTOP_SHOWCASE.description}</p>
            <div className="open-proof__desktop-points">
              {DESKTOP_SHOWCASE_POINTS.map((point) => (
                <div key={point} className="open-proof__desktop-point">
                  <CheckCircle2 size={16} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="open-proof__mobile-stack">
            {MOBILE_DEMO_CARDS.map((card) => {
              const activeFrameIndex = mobileFrameTick % card.frames.length;

              return (
                <article key={card.id} className="open-proof__mobile-card">
                  <div className="open-proof__mobile-frame">
                    {card.frames.map((frame, frameIndex) => (
                      <img
                        key={frame}
                        src={frame}
                        alt={frameIndex === activeFrameIndex ? card.title : ''}
                        aria-hidden={frameIndex !== activeFrameIndex}
                        className={`open-proof__mobile-image ${frameIndex === activeFrameIndex ? 'open-proof__mobile-image--active' : ''}`}
                        loading="eager"
                        decoding="async"
                      />
                    ))}
                  </div>

                  <div className="open-proof__mobile-body">
                    <span className="open-proof__card-label">{card.label}</span>
                    <h3 className="open-proof__card-title">{card.title}</h3>
                    <p className="open-proof__card-description">{card.description}</p>
                    <div className="open-proof__value">
                      <CheckCircle2 size={18} />
                      <span>{card.value}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="open-proof__mobile-image-break">
            <img
              src="/week-apple.jpg"
              alt="A sunlit portrait holding an apple"
              className="open-proof__mobile-feature-image"
            />
          </div>

          <div className="open-proof__mobile-benefits">
            <h3 className="open-proof__desktop-title">{DESKTOP_SHOWCASE.title}</h3>
            <p className="open-proof__desktop-description">{DESKTOP_SHOWCASE.description}</p>
            <div className="open-proof__desktop-points">
              {DESKTOP_SHOWCASE_POINTS.map((point) => (
                <div key={point} className="open-proof__desktop-point">
                  <CheckCircle2 size={16} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="open-offer">
        <div className="open-offer__inner">
          <div className="open-offer__content">
            <span className="open-offer__eyebrow">THE BOTTOM LINE</span>
            <h2 className="open-offer__title">Buy execution, not excuses.</h2>
            <p className="open-offer__description">
              If you are serious about finishing a protocol, stop winging it. Get the daily system that gets you from Prep Day to Day 21 without the chaos.
            </p>

            <div className="open-offer__lists">
              <div className="open-offer__list-block">
                <h3 className="open-offer__list-title">What you get</h3>
                <div className="open-offer__list">
                  {OFFER_ITEMS.map((item) => (
                    <div key={item} className="open-offer__list-item">
                      <CheckCircle2 size={18} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="open-offer__list-block">
                <h3 className="open-offer__list-title">Best for</h3>
                <div className="open-offer__list">
                  {FIT_ITEMS.map((item) => (
                    <div key={item} className="open-offer__list-item">
                      <CheckCircle2 size={18} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="open-offer__panel">
            <p className="open-offer__panel-label">START FREE TODAY</p>
            <p className="open-offer__price">3 DAYS FREE</p>
            <p className="open-offer__panel-copy">
              Then {PRODUCT_PRICE_WITH_INTERVAL} for ongoing access to your command center, reminders, and updates. No monthly charge. Cancel before renewal if it is not helping.
            </p>

            <button type="button" className="open-hero__button open-offer__button" onClick={handleStart}>
              Start the Free Trial <ArrowRight size={18} />
            </button>

            <p className="open-offer__micro">
              Start your trial, unlock the workspace, and begin from Prep Day. Planning software only. No diagnosis or symptom interpretation.
            </p>
            <button type="button" className="open-offer__login" onClick={handleLogin}>
              Already have an account? Log in
            </button>
          </div>
        </div>
      </section>

      {renderProgramSection('open-program--desktop')}

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
          <h2 className="open-daily__heading">THE COMMAND CENTER</h2>
          <p className="open-daily__subheading">
            {COMMAND_CENTER_SUBTEXT}
          </p>
        </div>
        <div className="open-daily__footer">
          <div className="open-daily__stat">
            <span className="open-daily__stat-label">CHECK-IN</span>
            <span className="open-daily__stat-value">2-5 MINUTES</span>
          </div>
          <div className="open-daily__stat">
            <span className="open-daily__stat-label">STRUCTURE</span>
            <span className="open-daily__stat-value">MORNING • AFTERNOON • EVENING</span>
          </div>
          <div className="open-daily__stat">
            <span className="open-daily__stat-label">SUPPORT</span>
            <span className="open-daily__stat-value">DAY-AWARE • PHASE-AWARE</span>
          </div>
        </div>
      </section>

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

      <div className="open-sticky-cta">
        <button
          className="open-sticky-cta__button"
          onClick={handleStart}
        >
          Start the Free Trial <ArrowRight size={18} />
        </button>
        <button
          type="button"
          className="open-sticky-cta__login"
          onClick={handleLogin}
        >
          Log in
        </button>
      </div>
    </div>
  );
};

export default Landing;
