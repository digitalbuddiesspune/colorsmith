import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const heroImages = [
  {
    src: 'https://res.cloudinary.com/dygteqnrv/image/upload/v1770457617/makeup-products-color-background-top-view.jpg_1_ziaf6n.jpg',
    alt: 'Colorful nail polish bottles',
  },
  {
    src: 'https://res.cloudinary.com/dygteqnrv/image/upload/v1770457463/set-decorative-cosmetics-pink-pastel-background-created-with-generative-ai-technology.jpg_1_1_inig8e.jpg',
    alt: 'Lipstick shades collection',
  }
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
    <section id="hero" className="relative overflow-hidden  bg-slate-900 mb-12 min-h-[520px] sm:min-h-[560px] lg:min-h-[600px]">
      {/* Full-width background slideshow */}
      <div className="absolute inset-0">
        {heroImages.map((img, i) => (
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
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/20" />
      </div>

      {/* Text content */}
      <div className="relative z-10 flex flex-col justify-center h-full min-h-[520px] sm:min-h-[560px] lg:min-h-[600px] px-8 sm:px-12 lg:px-16 py-16 lg:py-20 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 w-fit backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-sm font-medium text-white/90">Premium B2B Supplier</span>
        </div>

      
        <p className="text-lg text-slate-200 mb-8 max-w-md leading-relaxed">
          Premium cosmetics raw materials & finished products. Nail lacquers, lipsticks, lip gloss, primers, eyeliners, mascara & more.
        </p>

        <div className="flex flex-wrap gap-4 mb-8 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Multiple grades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Custom colors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Bulk orders</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:-translate-y-0.5"
          >
            Browse catalog
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm"
          >
            Register as buyer
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); goToPrev(); }}
        className="absolute hidden sm:block left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full  text-white/80 hover:bg-black/50 hover:text-white transition-colors flex items-center justify-center"
        aria-label="Previous image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); goToNext(); }}
          className="absolute hidden sm:block right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full  text-white/80 hover:bg-black/50 hover:text-white transition-colors flex items-center justify-center"
          aria-label="Next image"
        >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
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
                ? 'w-8 h-2.5 bg-amber-400'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
