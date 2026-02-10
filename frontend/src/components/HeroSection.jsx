import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const heroImages = [
  {
    src: 'https://res.cloudinary.com/dygteqnrv/image/upload/v1770744032/Peach_Elegant_3D_Realistic_Illustrated_Promotional_Cosmetic_Products_Banner_1920_x_600_px_ggidpv.png',
    alt: 'Colorful nail polish bottles',
  },
  {
    src: 'https://res.cloudinary.com/dygteqnrv/image/upload/v1770457463/set-decorative-cosmetics-pink-pastel-background-created-with-generative-ai-technology.jpg_1_1_inig8e.jpg',
    alt: 'Lipstick shades collection',
  },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
      setIsTransitioning(false);
    }, 500);
  }, []);

  const goToPrev = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
      setIsTransitioning(false);
    }, 500);
  }, []);

  // Auto-change every 5 seconds
  useEffect(() => {
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [goToNext]);

  return (
    <section id="hero" className="relative overflow-hidden bg-neutral-900">
      {/* Aspect-ratio container — matches banner proportions */}
      <div className="relative w-full" style={{ aspectRatio: '16 / 5' }}>
        {/* Slideshow images */}
        {heroImages.map((img, i) => (
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

        {/* Navigation arrows */}
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
          {heroImages.map((_, i) => (
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
      </div>
    </section>
  );
}
