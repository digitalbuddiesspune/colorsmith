import { Link } from 'react-router-dom';

const heroImages = [
  { src: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80', alt: 'Nail lacquers and polish' },
  { src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', alt: 'Liquid lipsticks' },
  { src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', alt: 'Cosmetics and makeup' },
  { src: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80', alt: 'Beauty products' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-brand-100/50 z-10 pointer-events-none" />
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[420px] lg:min-h-[480px]">
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 lg:py-16 order-2 lg:order-1">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Color Smith
          </h1>
          <p className="text-lg text-slate-600 mb-6 max-w-md">
            B2B cosmetics raw materials & finished products. Nail lacquers, lipsticks, lip gloss, primers, eyeliners, mascara & more — multiple grades and colors.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/catalog"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
            >
              Browse catalog
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Register as buyer
            </Link>
          </div>
        </div>
        <div className="relative order-1 lg:order-2 grid grid-cols-2 gap-1 p-2 sm:p-4 lg:p-6 min-h-[240px] lg:min-h-full">
          {heroImages.map((img, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden bg-slate-100">
              <img src={img.src} alt={img.alt} className="absolute inset-0 w-full h-full object-cover" loading={i < 2 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
