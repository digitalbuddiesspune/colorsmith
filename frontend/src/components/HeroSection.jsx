import { useState, useEffect, useCallback } from 'react';

// Wide banners for desktop (16:5 ratio)
const desktopImages = [
  {
    src: 'https://res.cloudinary.com/dygteqnrv/image/upload/v1770744032/Peach_Elegant_3D_Realistic_Illustrated_Promotional_Cosmetic_Products_Banner_1920_x_600_px_ggidpv.png',
    alt: 'Colorful nail polish bottles',
  },
  {
    src: 'https://res.cloudinary.com/dygteqnrv/image/upload/v1770900899/Brown_Modern_Minimalist_Eyelash_Beauty_Salon_Banner_1920_x_600_px_zjkmqu.png',
    alt: 'Colorful nail polish bottles',
  },
  
];

// Square banners for mobile (1:1 ratio)
const mobileImages = [
  
  {
    src: 'https://res.cloudinary.com/dygteqnrv/image/upload/v1770900933/Brown_Modern_Minimalist_Eyelash_Beauty_Salon_Banner_1920_x_600_px_1080_x_1080_px_isgkus.png',
    alt: 'Lipstick shades collection',
  },
  {
    src: 'https://res.cloudinary.com/dygteqnrv/image/upload/v1770744031/Peach_Elegant_3D_Realistic_Illustrated_Promotional_Cosmetic_Products_Banner_1920_x_600_px_1080_x_1080_px_owik1i.png',
    alt: 'Colorful nail polish bottles',
  }
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const maxLen = Math.max(desktopImages.length, mobileImages.length);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % maxLen);
      setIsTransitioning(false);
    }, 500);
  }, [maxLen]);

  const goToPrev = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + maxLen) % maxLen);
      setIsTransitioning(false);
    }, 500);
  }, [maxLen]);

  // Auto-change every 5 seconds
  useEffect(() => {
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [goToNext]);

  return (
    <section id="hero" className="relative overflow-hidden bg-neutral-900">
      {/* Desktop banners — wide 16:5 ratio, hidden on mobile */}
      <div className="relative w-full hidden sm:block" style={{ aspectRatio: '16 / 5' }}>
        {desktopImages.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt}
            className={`absolute inset-0 w-full h-full object-fill transition-opacity duration-700 ${
              i === currentIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
            }`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* Mobile banners — square 1:1 ratio, hidden on desktop */}
      <div className="relative w-full sm:hidden" style={{ aspectRatio: '1 / 1' }}>
        {mobileImages.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === currentIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
            }`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* Navigation arrows — desktop only */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); goToPrev(); }}
        className="absolute hidden sm:flex left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white/80 hover:bg-black/40 hover:text-white transition-colors items-center justify-center"
        aria-label="Previous image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); goToNext(); }}
        className="absolute hidden sm:flex right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm text-white/80 hover:bg-black/40 hover:text-white transition-colors items-center justify-center"
        aria-label="Next image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {Array.from({ length: maxLen }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(i);
                setIsTransitioning(false);
              }, 300);
            }}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-8 h-2.5 bg-white'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
