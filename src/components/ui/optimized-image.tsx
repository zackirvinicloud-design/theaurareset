import { useState, useEffect } from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  lowResSrc?: string;
  className?: string;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  lowResSrc, 
  className = '',
  ...props 
}: OptimizedImageProps) => {
  const { ref, isVisible } = useLazyLoad({ threshold: 0.1, rootMargin: '200px' });
  const [imageSrc, setImageSrc] = useState(lowResSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isVisible && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
    }
  }, [isVisible, src]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-50'
          } ${className}`}
          {...props}
        />
      )}
      {!isLoaded && lowResSrc && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
};
