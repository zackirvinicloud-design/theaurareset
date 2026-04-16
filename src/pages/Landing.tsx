import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Plus, X } from 'lucide-react';
import { PRODUCT_PRICE, PRODUCT_ORIGINAL_PRICE } from '@/lib/product';
import './Landing.css';

const START_PATH = `/setup/profile?redirect=${encodeURIComponent('/payment-required')}`;
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

const WEEKS = [
  {
    id: 1,
    label: 'WEEK 1',
    name: 'FUNGAL FLUSH',
    description: 'Blast the initial fungal shield. Starve the yeast overgrowth ravaging your gut walls—without the crushing overwhelm of scattered PDF guides and conflicting TikTok advice. Shut down the crippling sugar cravings before they even begin. Skip the endless Google searches and eliminate the panic when brutal die-off symptoms hit on Day 3.',
    image: '/daily-oranges.jpg',
  },
  {
    id: 2,
    label: 'WEEK 2',
    name: 'PARASITE PURGE',
    description: 'Flush the core system. Paralyze and expel the parasites feeding off your daily energy supply—without staring blankly at a counter full of random supplement bottles you do not know how to sequence. Torch the brain fog. Reclaim your mental clarity and lock in ruthless consistency instead of waking up to pure exhaustion.',
    image: '/week-tangerine.jpg',
  },
  {
    id: 3,
    label: 'WEEK 3',
    name: 'METAL DETOX',
    description: 'Bind and extract. Pull the deep-rooted metals and toxic sludge directly out of your system—without dealing with constant, painful bloating, and without the fear of immediate relapse. Solidify the flat stomach. Erase the toxic load permanently so you drop the bloat and lock in a clean system.',
    image: '/week-cosmos-reference.webp',
  },
];

const DESKTOP_SHOWCASE = {
  title: 'The End of the "Wing It" Method.',
  description: 'Trying to survive a 21-day parasite cleanse with a messy folder of PDFs and saved TikToks is a guaranteed path to failure. The Gut Brain Journal is your ruthless execution engine. No confusion. Just daily directives.',
  mediaBase: '/landing-media/desktop-app-demo',
} as const;

const DESKTOP_SHOWCASE_POINTS = [
  'Burn the PDFs. Open "Today" and see exactly what to do, what to take, and when to eat.',
  'Get a hyper-strict shopping list so you stop panic-buying random useless supplements.',
  'Push reminders force you to stay on schedule before the day spirals out of control.',
  '24/7 Nutrition Agent access to pull you back from the ledge when sugar cravings hit hard.',
  'Instant symptom decoding when die-off makes you panic and wonder if something is "wrong".',
  'Roadmap tracking so you actually know if you are making progress or just spinning your wheels.',
  'Drop the mental overhead. Tell us what you took, and we handle the logic for the rest of the day.',
] as const;

const MOBILE_DEMO_CARDS = [
  {
    id: 'today-mobile',
    label: 'Daily Directives',
    title: 'Wake up. Open the app. Execute.',
    description: 'Your meals, pill timing, and checklists are dictated clearly. No re-reading the protocol every three hours to figure out your next move.',
    value: 'Zero guesswork. You always know what to do.',
    frames: [
      '/landing-media/mobile-today-seq-1.png',
      '/landing-media/mobile-today-seq-2.png',
      '/landing-media/mobile-today-seq-3.png',
      '/landing-media/mobile-today-seq-4.png',
    ],
  },
  {
    id: 'coach-mobile',
    label: 'Crisis Support',
    title: 'An emergency brake for when you spiral.',
    description: 'When the die-off hits and you want to quit, the Nutrition Agent intercepts. It answers the exact blocker keeping you stuck and forces you forward.',
    value: 'Hard days stop being an excuse to order takeout.',
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
    description: 'You get a phase-by-phase shopping directive. Get exactly what you need for Day 1, skip the fluff, and stop wasting money.',
    value: 'You start armed and dangerous, not overwhelmed.',
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
  'An airtight Prep Day protocol that deletes startup chaos',
  'Ruthless day-by-day directives (no guessing)',
  '24/7 Crisis Agent for when the cravings hit hard',
];

const FIT_ITEMS = [
  'You already bought supplements but have ZERO schedule',
  'You quit your last cleanse because of severe "Die-Off" brain fog',
  'You need someone to tell you exactly what to do',
];

const FAQS = [
  {
    q: 'Do I really need this if I already have the PDFs?',
    a: 'Yes. A PDF will not tap you on the shoulder when it is time to take your binders. It will not talk you down when you are staring at a donut on Day 4. This is an execution engine, not a reading assignment.',
  },
  {
    q: 'I already bought products from a TikTok creator. Can I use this?',
    a: 'Absolutely. That is exactly who we built this for. You have the bottles on your counter, but no system. We turn that expensive pile of pills into a ruthless, easy-to-follow daily plan.',
  },
  {
    q: 'Is this a monthly subscription?',
    a: `No. ${PRODUCT_PRICE} one time. Lifetime access. No sneaky monthly rebills. No app-store friction. Pay once and keep your entire cleanse command center forever.`,
  },
  {
    q: 'Will this cure my IBS / SIBO / Gut Issues?',
    a: 'No. We are not doctors, and this is not medical advice. The Gut Brain Journal is an execution software. You bring the protocol, we provide the daily structure and accountability so you actually finish it.',
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
          <span className="open-program__heading-right">FUNGAL • PARASITE • METAL DETOX</span>
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
              <span className="open-program__tab-name">{week.name}</span>
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
            <p className="open-program__description">{currentWeek.description}</p>
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
        🚀 LAUNCH PRICE: {PRODUCT_PRICE} <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{PRODUCT_ORIGINAL_PRICE}</span> — First 100 customers only
      </div>
      <header className={`open-header ${!logoVisible ? 'open-header--hidden' : ''}`}>
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
              <span className="open-hero__line-rest">A GUT CLEANSE</span>
            </motion.h1>
          </div>

          <motion.p
            className="open-hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Winging a 21-day gut reset guarantees a 92% failure rate. Plug into the daily execution engine that tells you exactly what to do, what to take, and when.
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
              When the die-off brain fog hits on Day 3, you are going to slip up. See how we force you to stay on track.
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
              If you are serious about fixing your gut, stop "winging it." Get the daily system that actually gets you across the finish line.
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
            <p className="open-offer__panel-label">LAUNCH PRICE</p>
            <p className="open-offer__price">{PRODUCT_PRICE} <span style={{ textDecoration: 'line-through', opacity: 0.4, fontSize: '0.5em' }}>{PRODUCT_ORIGINAL_PRICE}</span></p>
            <p className="open-offer__panel-copy">
              One payment. Lifetime access. No monthly leeching on your credit card. Snag this before the launch pricing disappears forever.
            </p>

            <button type="button" className="open-hero__button open-offer__button" onClick={handleStart}>
              Take the Free Gut Analysis <ArrowRight size={18} />
            </button>

            <p className="open-offer__micro">
              Create your account, unlock the workspace, and start from Prep Day.
            </p>
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
            Zero thinking required. Wake up. Open the journal. Execute the checklist. Everything you need to survive today is handed to you on a silver platter. Stop re-reading complex protocols and just follow the damn instructions.
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
          Take the Free Gut Analysis <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Landing;
