import { useState, useEffect, useRef } from 'react';

interface AnimatedTextProps {
  targetText: string;
  isComplete: boolean;
  speed?: number; // characters per second
}

export const AnimatedText = ({ targetText, isComplete, speed = 40 }: AnimatedTextProps) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    // If complete, show all text immediately
    if (isComplete) {
      setDisplayedLength(targetText.length);
      return;
    }

    const msPerChar = 1000 / speed;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      
      if (elapsed >= msPerChar) {
        const charsToAdd = Math.floor(elapsed / msPerChar);
        setDisplayedLength(prev => {
          const newLength = Math.min(prev + charsToAdd, targetText.length);
          return newLength;
        });
        lastTimeRef.current = timestamp;
      }

      if (displayedLength < targetText.length) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetText, isComplete, speed, displayedLength]);

  // Reset animation when targetText grows (new streaming content)
  useEffect(() => {
    if (targetText.length > displayedLength && !isComplete) {
      // Continue animation from current position
      lastTimeRef.current = 0;
    }
  }, [targetText.length]);

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
