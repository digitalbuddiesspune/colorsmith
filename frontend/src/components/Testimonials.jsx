import { useState, useRef, useEffect, useCallback } from 'react';

const reviews = [
  {
    name: 'Priya Sharma',
    role: 'Head of R&D, Glow Cosmetics',
    quote: "Color Smith's multiple grades let us match quality to each SKU. Batch consistency has been excellent — no surprises in production.",
    rating: 5,
  },
  {
    name: 'Angad Singh',
    role: 'Founder, Angad Cosmetics',
    quote: 'We use their custom color sets for our lip range. Saves us hours of sampling. Regulatory docs are always ready when we need them.',
    rating: 5,
  },
  {
    name: 'Raunak Agrawal',
    role: 'Founder, Agrawal Cosmetics',
    quote: 'Bulk ordering and consistent quality made scaling our nail lacquer line straightforward. Support is responsive and technical.',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Quality Manager, Cosmetics Company',
    quote: "COAs and TDS are clear and up to date. We've been able to streamline our compliance process thanks to Color Smith.",
    rating: 5,
  },
  {
    name: 'Anita Patel',
    role: 'Product Development, Saffron Beauty',
    quote: 'From raw materials to finished shades, we get one reliable partner. The grade options help us control cost without compromising on quality.',
    rating: 5,
  },
  {
    name: 'Amit Patel',
    role: 'Founder, ShadeUp Cosmetics',
    quote: "Color Smith's wide range of colors and grades let us create new SKUs quickly. We've never had an issue with consistency or delivery.",
    rating: 5,
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col h-full">
      <StarRating rating={review.rating} />
      <blockquote className="mt-4 text-slate-700 flex-1">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="font-medium text-slate-900">{review.name}</p>
        <p className="text-sm text-slate-500">{review.role}</p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const autoplayRef = useRef(null);

  const scrollToIndex = useCallback((index) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[index];
    if (!card) return;
    container.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' });
  }, []);

  // Track which card is in view via scroll position
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft + 16;
      let closest = 0;
      let minDist = Infinity;
      Array.from(container.children).forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft - scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-play on mobile
  useEffect(() => {
    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          const next = (prev + 1) % reviews.length;
          scrollToIndex(next);
          return next;
        });
      }, 4000);
    };

    // Only autoplay when screen is small (below md breakpoint)
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => {
      clearInterval(autoplayRef.current);
      if (e.matches) startAutoplay();
    };

    if (mql.matches) startAutoplay();
    mql.addEventListener('change', onChange);

    return () => {
      clearInterval(autoplayRef.current);
      mql.removeEventListener('change', onChange);
    };
  }, [scrollToIndex]);

  // Pause autoplay on touch
  const pauseAutoplay = () => clearInterval(autoplayRef.current);
  const resumeAutoplay = () => {
    clearInterval(autoplayRef.current);
    if (window.innerWidth < 768) {
      autoplayRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          const next = (prev + 1) % reviews.length;
          scrollToIndex(next);
          return next;
        });
      }, 4000);
    }
  };

  return (
    <section className="mt-16 pt-16 border-t border-slate-200">
      <div className='text-center'> <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">What our clients say</h2>
      <p className="text-slate-600 mb-10 w-full max-w-2xl mx-auto">
        Brands and manufacturers trust Color Smith for raw materials and finished products.
      </p>
      </div>
     
      {/* Desktop: grid layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, i) => (
          <ReviewCard key={i} review={review} />
        ))}
      </div>

      {/* Mobile: horizontal scroll carousel */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-2 px-2"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          onTouchStart={pauseAutoplay}
          onTouchEnd={resumeAutoplay}
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              className="snap-center shrink-0 w-[85vw] max-w-sm"
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-7 h-2.5 bg-amber-400'
                  : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
