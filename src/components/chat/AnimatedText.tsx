import { useState, useEffect, useRef } from 'react';

interface AnimatedTextProps {
  targetText: string;
  isComplete: boolean;
  speed?: number; // characters per second
}

export const AnimatedText = ({ targetText, isComplete, speed = 50 }: AnimatedTextProps) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const displayedLengthRef = useRef(0);

  useEffect(() => {
    // If complete, show all text immediately
    if (isComplete) {
      setDisplayedLength(targetText.length);
      displayedLengthRef.current = targetText.length;
      return;
    }

    // If we're already caught up, no need to animate
    if (displayedLengthRef.current >= targetText.length) {
      return;
    }

    const msPerChar = 1000 / speed;
    let animationId: number;
    let lastTime = performance.now();

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastTime;
      
      if (elapsed >= msPerChar) {
        const charsToAdd = Math.floor(elapsed / msPerChar);
        const newLength = Math.min(displayedLengthRef.current + charsToAdd, targetText.length);
        
        if (newLength !== displayedLengthRef.current) {
          displayedLengthRef.current = newLength;
          setDisplayedLength(newLength);
        }
        
        lastTime = timestamp;
      }

      // Continue animating if not caught up
      if (displayedLengthRef.current < targetText.length) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [targetText, isComplete, speed]);

  const displayedText = targetText.slice(0, displayedLength);
  const showCursor = !isComplete && displayedLength < targetText.length;

  return (
    <span>
      {displayedText}
      {showCursor && (
        <span className="inline-block w-[2px] h-[1em] bg-current ml-0.5 animate-pulse" />
      )}
    </span>
  );
};
