'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

const ProductImageZoom = ({ src, alt, className }: ProductImageZoomProps) => {
  const [zoomed, setZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState('50% 50%');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setZoomed((prev) => !prev);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  const handleMouseLeave = () => {
    if (zoomed) {
      setTransformOrigin('50% 50%');
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-xl bg-secondary',
        zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
        className
      )}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={zoomed ? 'Click to zoom out' : 'Click to zoom in'}
    >
      <div
        className="w-full h-full transition-transform duration-300"
        style={{
          transform: zoomed ? 'scale(2)' : 'scale(1)',
          transformOrigin,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {!zoomed && (
        <div className="absolute bottom-3 right-3 bg-card/80 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none">
          Click to zoom
        </div>
      )}
    </div>
  );
};

export default ProductImageZoom;
