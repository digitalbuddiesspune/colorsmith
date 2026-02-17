import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const startBusinessMidImages = [
  'https://res.cloudinary.com/dygteqnrv/image/upload/v1770706065/Nail_j13dku.jpg',
  'https://res.cloudinary.com/dygteqnrv/image/upload/v1770457617/makeup-products-color-background-top-view.jpg_1_ziaf6n.jpg',
];

/* ── Thin hairline divider icon ─────────────────────────────────────────── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 mb-6">
    <div className="h-px w-10 bg-black/20" />
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <rect x="5" y="0.5" width="6.36" height="6.36" transform="rotate(45 5 0.5)" fill="black" opacity="0.25" />
    </svg>
    <div className="h-px w-10 bg-black/20" />
  </div>
);

/* ── Step badge ─────────────────────────────────────────────────────────── */
const StepBadge = ({ number, label, delay }) => (
  <div
    className="group flex items-center gap-3 py-3 border-b border-black/8 last:border-0 transition-all duration-300 cursor-default"
    style={{ animationDelay: `${delay}ms` }}
  >
    <span
      className="flex-shrink-0 w-7 h-7 rounded-full border border-black/20 flex items-center justify-center
                 text-[11px] font-semibold tracking-widest text-black/40
                 group-hover:border-black group-hover:text-black transition-all duration-300"
    >
      {String(number).padStart(2, '0')}
    </span>
    <span className="text-sm text-black/55 group-hover:text-black transition-colors duration-300 font-medium tracking-wide">
      {label}
    </span>
    <svg
      className="ml-auto w-3 h-3 text-black/20 group-hover:text-black group-hover:translate-x-0.5 transition-all duration-300"
      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  </div>
);

/* ── Decorative background typography ───────────────────────────────────── */
const GhostText = () => (
  <div
    className="pointer-events-none absolute -top-4 -left-2 select-none"
    aria-hidden
    style={{
      fontSize: 'clamp(80px, 14vw, 160px)',
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 900,
      fontStyle: 'italic',
      color: 'rgba(0,0,0, 0.5)',
      WebkitTextStroke: '1px rgba(0,0,0,0.12)',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      letterSpacing: '-0.03em',
    }}
  >
    Beauty
  </div>
);

export default function StartBusinessMid() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 0);
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % startBusinessMidImages.length);
        setIsTransitioning(false);
      }, 400);
    }, 4500);
    return () => {
      clearTimeout(id);
      clearInterval(intervalRef.current);
    };
  }, []);

  const goTo = (idx) => {
    if (idx === currentImageIndex) return;
    clearInterval(intervalRef.current);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(idx);
      setIsTransitioning(false);
    }, 350);
  };

  const steps = [
    'Source premium raw materials',
    'Formulate & test your product',
    'Brand & package with confidence',
    'Launch & scale your line',
  ];

  return (
    <>
      {/* Google Font load */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500&display=swap');

        .sbm-section * { box-sizing: border-box; }

        .sbm-image-wrap {
          clip-path: inset(0 0 0 0 round 4px);
          transition: clip-path 0.5s ease;
        }

        .sbm-btn {
          position: relative;
          overflow: hidden;
        }
        .sbm-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: white;
          transform: translateX(-101%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          z-index: 0;
        }
        .sbm-btn:hover::before { transform: translateX(0); }
        .sbm-btn span { position: relative; z-index: 1; }
        .sbm-btn svg  { position: relative; z-index: 1; }
        .sbm-btn:hover { color: black; }

        @keyframes sbm-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sbm-animate {
          opacity: 0;
          animation: sbm-fade-up 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>

      <section
        className="sbm-section relative bg-gradient-to-br from-red-50 via-red-100/80 to-rose-200/70"
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        {/* ── Top rule ─────────────────────────────────────────────────── */}
        <div className="h-px w-full bg-black/8" />

        {/* ── Decorative background (clipped so main content can overflow) ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden style={{ zIndex: 0 }}>
          {/* <GhostText /> */}
          {/* faint dot-grid texture */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              opacity: 0.4,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-28 pb-24 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* ── LEFT — image carousel ─────────────────────────────────── */}
            <div
              className={`order-1 sbm-animate min-w-0 ${loaded ? '' : ''}`}
              style={{ animationDelay: '0ms', animationDuration: '0.7s' }}
            >
              {/* Offset decorative block */}
              <div className="relative min-h-0">
                <div
                  className="absolute -top-4 -left-4 w-full h-full border border-black/10 rounded-sm pointer-events-none"
                  aria-hidden
                />

                {/* Main image frame */}
                <div className="sbm-image-wrap relative rounded-sm overflow-hidden aspect-[4/3] lg:aspect-[5/4] bg-black/5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] w-full">
                  {startBusinessMidImages.map((url, index) => (
                    <img
                      key={url}
                      src={url}
                      alt={`Start your cosmetics business — step ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      style={{
                        opacity: index === currentImageIndex ? (isTransitioning ? 0 : 1) : 0,
                        transition: 'opacity 0.45s ease',
                        zIndex: index === currentImageIndex ? 1 : 0,
                      }}
                    />
                  ))}

                  {/* Subtle vignette */}
                  <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 50%)' }}
                  />

                  {/* Caption strip */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-4 pt-8">
                    <p className="text-white/90 text-xs tracking-[0.18em] uppercase font-medium">
                      Colorsmith Studio
                    </p>
                  </div>
                </div>

                {/* Dots */}
                <div className="flex items-center gap-2 mt-5 pl-1">
                  {startBusinessMidImages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => goTo(index)}
                      className="relative h-px transition-all duration-400 focus:outline-none"
                      style={{
                        width: index === currentImageIndex ? 40 : 20,
                        background: index === currentImageIndex ? 'black' : 'rgba(0,0,0,0.2)',
                        transition: 'width 0.4s ease, background 0.4s ease',
                      }}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                  <span className="ml-2 text-[11px] text-black/30 font-medium tracking-widest">
                    {String(currentImageIndex + 1).padStart(2,'0')} / {String(startBusinessMidImages.length).padStart(2,'0')}
                  </span>
                </div>
              </div>
            </div>

            {/* ── RIGHT — text ──────────────────────────────────────────── */}
            <div
              className={`order-2 text-center lg:text-left sbm-animate`}
              style={{ animationDelay: '150ms', animationDuration: '0.7s' }}
            >
              <DiamondDivider />

              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-black/35 mb-3">
                Your roadmap to launch
              </p>

              <h2
                className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-black leading-[1.05] tracking-tight mb-6"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Start Your<br />
                <em className="font-bold not-italic" style={{ fontStyle: 'italic' }}>
                  Cosmetics Business
                </em>
              </h2>

              <p
                className="text-black/50 text-[15px] leading-relaxed max-w-md mx-auto lg:mx-0 mb-8"
              >
                From sourcing raw materials to launching your own beauty brand — we guide you through
                formulation, branding, and scaling with quality-tested products and compliance support.
              </p>

              {/* Step list */}
              <div className="mb-10 max-w-sm mx-auto lg:mx-0">
                {steps.map((label, i) => (
                  <StepBadge key={i} number={i + 1} label={label} delay={i * 60} />
                ))}
              </div>

              {/* CTA */}
              <Link
                to="/register"
                className="sbm-btn inline-flex items-center justify-center gap-3 border border-black rounded-none
                           bg-black text-white px-8 py-3.5 text-[13px] font-medium tracking-widest uppercase
                           transition-colors duration-300 shadow-none"
              >
                <span>Get started</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              {/* Social proof note */}
              <p className="mt-5 text-[11px] text-black/30 tracking-wide">
                Join 2,400+ founders already building with Colorsmith
              </p>
            </div>

          </div>
        </div>

        {/* ── Bottom rule ──────────────────────────────────────────────── */}
        <div className="h-px w-full bg-black/8" />
      </section>
    </>
  );
}