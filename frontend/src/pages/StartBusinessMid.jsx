import React from 'react';
import { Link } from 'react-router-dom';

// Decorative SVG icons for background (makeup brush, dropper, sparkle)
const MakeupBrushIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 56 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M4 20V8c0-2.2 1.8-4 4-4h40c2.2 0 4 1.8 4 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
    <path d="M8 20c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85" />
    <ellipse cx="28" cy="14" rx="12" ry="4" fill="currentColor" opacity="0.6" />
  </svg>
);

const DropperIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M16 4v12l8 8c4.4 4.4 4.4 11.6 0 16s-11.6 4.4-16 0c-4.4-4.4-4.4-11.6 0-16l8-8V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.85" />
    <circle cx="16" cy="28" r="4" fill="currentColor" opacity="0.5" />
  </svg>
);

const SparkleIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M20 4l2.5 8 8 2.5-8 2.5-2.5 8-2.5-8-8-2.5 8-2.5L20 4z" fill="currentColor" opacity="0.7" />
    <path d="M8 28l1.5 4 4 1.5-4 1.5L8 40l-1.5-4L2 34.5l4-1.5L8 28z" fill="currentColor" opacity="0.5" />
    <path d="M32 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="currentColor" opacity="0.5" />
  </svg>
);

const startBusinessMidImage =
  'https://res.cloudinary.com/dygteqnrv/image/upload/v1770957379/mid-banner_plu7nm.jpg';

export default function StartBusinessMid() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-red-100/80 to-rose-200/70 min-h-[520px] lg:min-h-[560px]">
      {/* Background decorative icons — makeup brush, dropper, sparkle */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <MakeupBrushIcon className="absolute top-[12%] left-[6%] w-14 h-6 text-red-400/35 lg:w-20 lg:h-8 text-red-400/30" />
        <DropperIcon className="absolute top-[18%] right-[10%] w-8 h-12 text-rose-400/40 lg:w-10 lg:h-14 text-rose-400/35" />
        <SparkleIcon className="absolute bottom-[22%] left-[12%] w-10 h-10 text-red-300/35 lg:w-12 lg:h-12" />
        <MakeupBrushIcon className="absolute bottom-[18%] right-[6%] w-12 h-5 text-rose-400/30 rotate-12 lg:w-16 lg:h-7" />
        <DropperIcon className="absolute top-1/2 -translate-y-1/2 left-[2%] w-6 h-9 text-red-300/25 hidden xl:block -rotate-12" />
        <SparkleIcon className="absolute top-1/2 -translate-y-1/2 right-[4%] w-8 h-8 text-rose-300/25 hidden xl:block" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text side */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
              Start Your Business in 4 Steps
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-6 lg:mb-8">
              From sourcing raw materials to launching your own beauty brand — we guide you through formulation,
              branding, and scaling with quality-tested products and compliance support.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-6 py-3 text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Get started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Image side */}
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-slate-200/80 ring-1 ring-slate-200/60 aspect-[4/3] lg:aspect-[5/4] max-h-[320px] lg:max-h-[400px]">
              <img
                src={startBusinessMidImage}
                alt="Start your cosmetics business with Colorsmith"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
