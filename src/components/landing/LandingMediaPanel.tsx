import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface LandingDemoStep {
  id: string;
  badge: string;
  title: string;
  description: string;
  value: string;
  imageSrc: string;
  spotlight?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    cardPosition?: 'left' | 'right' | 'top' | 'bottom';
  };
}

interface LandingMediaPanelProps {
  label: string;
  title?: string;
  description?: string;
  steps: readonly LandingDemoStep[];
  mobileSteps?: readonly LandingDemoStep[];
  className?: string;
  theme?: 'emerald' | 'sand' | 'teal' | 'slate';
  autoPlayMs?: number;
}

/* ─── Tooltip arrow helper ─── */
const arrowClasses: Record<string, string> = {
  top: 'left-1/2 -translate-x-1/2 -bottom-2 border-l-transparent border-r-transparent border-b-transparent border-t-[#2563EB]',
  bottom: 'left-1/2 -translate-x-1/2 -top-2 border-l-transparent border-r-transparent border-t-transparent border-b-[#2563EB]',
  left: 'top-1/2 -translate-y-1/2 -right-2 border-t-transparent border-b-transparent border-r-transparent border-l-[#2563EB]',
  right: 'top-1/2 -translate-y-1/2 -left-2 border-t-transparent border-b-transparent border-l-transparent border-r-[#2563EB]',
};

/* ─── Compute tooltip positioning from hotspot ─── */
function computeTooltipStyle(
  cx: number,
  cy: number,
  pos: 'left' | 'right' | 'top' | 'bottom',
  pad: number,
): React.CSSProperties {
  switch (pos) {
    case 'right':
      return { left: `${cx + pad}%`, top: `${cy}%`, transform: 'translateY(-50%)' };
    case 'left':
      return { right: `${100 - cx + pad}%`, top: `${cy}%`, transform: 'translateY(-50%)' };
    case 'bottom':
      return { left: `${cx}%`, top: `${cy + pad}%`, transform: 'translateX(-50%)' };
    case 'top':
    default:
      return { left: `${cx}%`, bottom: `${100 - cy + pad}%`, transform: 'translateX(-50%)' };
  }
}

/* ─── Compute mobile tooltip positioning (clamped to viewport) ─── */
function computeMobileTooltipStyle(
  cx: number,
  cy: number,
  pos: 'left' | 'right' | 'top' | 'bottom',
  pad: number,
): React.CSSProperties {
  const anchorRight = cx > 50;
  switch (pos) {
    case 'top':
      return anchorRight
        ? { right: `${Math.max(4, 100 - cx - 10)}%`, bottom: `${100 - cy + pad}%` }
        : { left: `${Math.max(4, cx - 10)}%`, bottom: `${100 - cy + pad}%` };
    case 'left':
      return { right: `${100 - cx + pad}%`, top: `${Math.max(5, Math.min(cy - 10, 70))}%` };
    case 'right':
      return cx > 60
        ? { right: '4%', top: `${Math.max(5, Math.min(cy - 10, 70))}%` }
        : { left: `${cx + pad}%`, top: `${Math.max(5, Math.min(cy - 10, 70))}%` };
    case 'bottom':
    default:
      return anchorRight
        ? { right: `${Math.max(4, 100 - cx - 10)}%`, top: `${cy + pad}%` }
        : { left: `${Math.max(4, cx - 10)}%`, top: `${cy + pad}%` };
  }
}

export const LandingMediaPanel = ({
  steps,
  mobileSteps,
  className,
  autoPlayMs = 0,
}: LandingMediaPanelProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = steps.length;

  // Mobile steps fallback to desktop steps
  const mSteps = mobileSteps ?? steps;
  const mTotal = mSteps.length;
  const mStep = mSteps[mobileActiveIndex];
  const mSpotlight = mStep?.spotlight;
  const mHotspotCx = mSpotlight ? mSpotlight.x + mSpotlight.width / 2 : 0;
  const mHotspotCy = mSpotlight ? mSpotlight.y + mSpotlight.height / 2 : 0;
  const mCardPos = mSpotlight?.cardPosition ?? 'bottom';

  const mGoNext = useCallback(() => {
    setMobileActiveIndex((i) => (i + 1) % mTotal);
  }, [mTotal]);
  const mGoBack = useCallback(() => {
    setMobileActiveIndex((i) => (i - 1 + mTotal) % mTotal);
  }, [mTotal]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goBack = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total < 2 || autoPlayMs <= 0) return;
    const timer = setTimeout(goNext, autoPlayMs);
    return () => clearTimeout(timer);
  }, [activeIndex, autoPlayMs, goNext, isPaused, total]);

  if (!total) return null;

  const step = steps[activeIndex];

  /* ─── Desktop hotspot center (percent) ─── */
  const hotspotCx = step.spotlight
    ? step.spotlight.x + step.spotlight.width / 2
    : 50;
  const hotspotCy = step.spotlight
    ? step.spotlight.y + step.spotlight.height / 2
    : 50;

  /* ─── Desktop tooltip position ─── */
  const cardPos =
    step.spotlight?.cardPosition ??
    (hotspotCx < 42
      ? 'right'
      : hotspotCx > 58
        ? 'left'
        : hotspotCy < 42
          ? 'bottom'
          : 'top');

  /* ─── Arrow direction is opposite of card placement ─── */
  const arrowDir =
    cardPos === 'right'
      ? 'left'
      : cardPos === 'left'
        ? 'right'
        : cardPos === 'bottom'
          ? 'top'
          : 'bottom';

  const mArrowDir =
    mCardPos === 'right'
      ? 'left'
      : mCardPos === 'left'
        ? 'right'
        : mCardPos === 'bottom'
          ? 'top'
          : 'bottom';

  /* ─── Arrow anchor on tooltip edge ─── */
  const getArrowPositionStyle = (dir: string): React.CSSProperties => {
    switch (dir) {
      case 'top':
        return { top: -8 };
      case 'bottom':
        return { bottom: -8 };
      case 'left':
        return { left: -8 };
      case 'right':
        return { right: -8 };
      default:
        return {};
    }
  };

  /* ═══════════════════════════════════════════
     Pulsing hotspot dot (shared between mobile/desktop)
     ═══════════════════════════════════════════ */
  const HotspotDot = ({
    cx,
    cy,
    id,
    sizeSm,
  }: {
    cx: number;
    cy: number;
    id: string;
    sizeSm?: boolean;
  }) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${id}-hotspot`}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.25 }}
        className="absolute z-10 pointer-events-none"
        style={{
          left: `${cx}%`,
          top: `${cy}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'absolute animate-ping rounded-full bg-blue-500/30',
              sizeSm ? 'h-8 w-8' : 'h-10 w-10',
            )}
          />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'rounded-full bg-blue-500/20',
              sizeSm
                ? 'h-5 w-5 shadow-[0_0_12px_3px_rgba(37,99,235,0.25)]'
                : 'h-7 w-7 shadow-[0_0_16px_4px_rgba(37,99,235,0.25)]',
            )}
          />
        </span>
        <span className="relative flex items-center justify-center">
          <span
            className={cn(
              'rounded-full bg-[#2563EB]',
              sizeSm
                ? 'h-3 w-3 shadow-[0_0_6px_2px_rgba(37,99,235,0.5)]'
                : 'h-4 w-4 shadow-[0_0_8px_2px_rgba(37,99,235,0.5)]',
            )}
          />
        </span>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      className={cn(
        'group/demo relative overflow-hidden rounded-2xl transition-shadow duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]',
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ═════ MOBILE: Fully inline demo (< 768px) ═════ */}
      <div className="block md:hidden">
        <div className="relative overflow-hidden rounded-2xl bg-slate-100">
          {/* Screenshot */}
          <AnimatePresence mode="wait">
            <motion.img
              key={mStep.id}
              src={mStep.imageSrc}
              alt={mStep.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-full select-none"
              draggable={false}
            />
          </AnimatePresence>

          {/* Pulsing hotspot */}
          {mSpotlight && (
            <HotspotDot cx={mHotspotCx} cy={mHotspotCy} id={mStep.id} sizeSm />
          )}

          {/* ─── Floating tooltip card (inline, not modal) ─── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mStep.id}-tip`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="absolute z-20 w-[240px]"
              style={computeMobileTooltipStyle(mHotspotCx, mHotspotCy, mCardPos, 5)}
            >
              <div className="rounded-xl bg-[#2563EB] px-3.5 py-3 shadow-[0_12px_32px_-6px_rgba(37,99,235,0.5)]">
                {/* Arrow */}
                <div
                  className={cn(
                    'absolute h-0 w-0 border-[6px] border-solid',
                    arrowClasses[mArrowDir],
                  )}
                  style={getArrowPositionStyle(mArrowDir)}
                />
                <p className="text-[12px] font-semibold leading-snug text-white">
                  {mStep.title}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-blue-100/80 line-clamp-2">
                  {mStep.description}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  {mobileActiveIndex > 0 && (
                    <button
                      type="button"
                      onClick={mGoBack}
                      className="rounded-md bg-white/15 px-3 py-1.5 text-[10px] font-semibold text-white transition-colors active:bg-white/25"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (mobileActiveIndex === mTotal - 1) {
                        setMobileActiveIndex(0);
                      } else {
                        mGoNext();
                      }
                    }}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white transition-colors active:bg-slate-800"
                  >
                    {mobileActiveIndex === mTotal - 1 ? 'Restart' : 'Next →'}
                  </button>
                  <span className="ml-auto text-[9px] font-medium text-blue-100/60 tabular-nums">
                    {mobileActiveIndex + 1}/{mTotal}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom progress dots */}
          <div className="absolute bottom-0 inset-x-0 z-20 px-4 pb-3 pt-6 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none">
            <div className="flex gap-1 pointer-events-auto">
              {mSteps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMobileActiveIndex(i)}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    i === mobileActiveIndex
                      ? 'bg-blue-500'
                      : i < mobileActiveIndex
                        ? 'bg-blue-500/40'
                        : 'bg-white/15',
                  )}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═════ DESKTOP SCREENSHOT + SPOTLIGHT (≥768px) ═════ */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden rounded-2xl bg-slate-100 transition-transform duration-500 group-hover/demo:scale-[1.005]">
          <AnimatePresence mode="wait">
            <motion.img
              key={step.id}
              src={step.imageSrc}
              alt={step.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-full select-none"
              draggable={false}
            />
          </AnimatePresence>

          {step.spotlight && (
            <HotspotDot cx={hotspotCx} cy={hotspotCy} id={step.id} />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${step.id}-tooltip`}
              initial={{ opacity: 0, y: cardPos === 'bottom' ? -8 : cardPos === 'top' ? 8 : 0, x: cardPos === 'right' ? -8 : cardPos === 'left' ? 8 : 0 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="absolute z-20 w-[320px] max-w-[70%]"
              style={computeTooltipStyle(hotspotCx, hotspotCy, cardPos, 4)}
            >
              <div className="relative rounded-xl bg-[#2563EB] px-5 py-4 shadow-[0_20px_40px_-12px_rgba(37,99,235,0.4)]">
                <div
                  className={cn(
                    'absolute h-0 w-0 border-[8px] border-solid',
                    arrowClasses[arrowDir],
                  )}
                  style={getArrowPositionStyle(arrowDir)}
                />
                <p className="text-[15px] font-semibold leading-snug text-white">
                  {step.title}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-blue-100/90">
                  {step.description}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  {activeIndex > 0 && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/15 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/25"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    {activeIndex === total - 1 ? 'Restart' : 'Next'}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-full bg-slate-900/85 px-4 py-2 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <button
                type="button"
                onClick={goBack}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Previous step"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      'h-2 w-2 rounded-full transition-all duration-300',
                      i === activeIndex
                        ? 'bg-white w-5'
                        : 'bg-white/30 hover:bg-white/50',
                    )}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
              <span className="text-[12px] font-medium text-white/60 tabular-nums">
                {activeIndex + 1} / {total}
              </span>
              <button
                type="button"
                onClick={goNext}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Next step"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
