import { cn } from '@/lib/utils';

interface GutBrainLogoProps {
  className?: string;
  rounded?: boolean;
}

export function GutBrainLogo({ className, rounded = true }: GutBrainLogoProps) {
  return (
    <img
      src="/brand/gutbrain-logo.png"
      alt="GutBrain"
      className={cn(
        'h-5 w-5 object-cover',
        rounded ? 'rounded-md' : '',
        className,
      )}
    />
  );
}
