import { Link } from 'react-router-dom';
import rosePetalsBg from '../assets/radiant-gradient.svg';

const steps = [
  {
    num: 1,
    title: 'Source Raw Materials',
    desc: 'Access a curated network of ethical suppliers for botanical extracts, oils, and active ingredients.',
    link: { label: 'Explore Catalog', to: '/catalog' },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 5.608a1.5 1.5 0 01-1.45 1.892h-1.5M5 14.5l-1.402 5.608a1.5 1.5 0 001.45 1.892h1.5" />
      </svg>
    ),
  },
  {
    num: 2,
    title: 'Formulation & Testing',
    desc: 'Work with expert chemists to create custom formulas or select from our pre-tested, stability-proven base ranges.',
    link: { label: 'Lab Services', to: '/catalog' },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 5.608a1.5 1.5 0 01-1.45 1.892h-1.5M5 14.5l-1.402 5.608a1.5 1.5 0 001.45 1.892h1.5" />
      </svg>
    ),
  },
  {
    num: 3,
    title: 'Branding & Packaging',
    desc: 'Design your unique brand identity with custom packaging, labels, and premium finishes that stand out.',
    link: { label: 'Design Studio', to: '/catalog' },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    num: 4,
    title: 'Launch & Scale',
    desc: 'Get quality-tested products with COAs, TDS & compliance — ready to sell under your own beauty brand.',
    link: { label: 'Get Started', to: '/register' },
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
];

export default function StartBusiness() {
  return (
    <section
      className="relative mt-16 -mx-4 sm:-mx-6 lg:-mx-8"
      style={{
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
      }}
    >
      {/* rose petals SVG background — fixed parallax */}
      <div className="absolute inset-0" style={{ clipPath: 'inset(0)' }}>
        <img
          src={rosePetalsBg}
          alt=""
          aria-hidden="true"
          className="fixed top-0 left-0 w-screen h-screen object-cover pointer-events-none"
        />
      </div>

      {/* scrolling content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 py-20 sm:py-28 lg:py-36">
        {/* header */}
        <div className="mb-14">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5">
            <span className="text-white">Start your cosmetics</span>
            <br />
            <span className="text-amber-300">business in 4 steps</span>
          </h2>
          <p className="text-neutral-300/80 text-base sm:text-lg leading-relaxed max-w-4xl">
            From raw materials to finished products — everything you need to launch or scale your beauty brand, all in one place.
          </p>
        </div>

        {/* steps */}
        <div className="space-y-4 mb-14">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group relative flex items-start gap-5 sm:gap-6 bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-md border border-white/[0.08] hover:border-amber-300/20 rounded-2xl p-5 sm:p-6 transition-all duration-300"
            >
              {/* step number */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-neutral-900 text-sm font-bold shadow-lg shadow-amber-400/30">
                {step.num}
              </div>

              {/* content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                  {step.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-2.5">
                  {step.desc}
                </p>
                <Link
                  to={step.link.to}
                    className="inline-flex items-center gap-1.5 text-amber-300 text-sm font-medium hover:text-amber-200 transition-colors"
                >
                  {step.link.label}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

              {/* icon */}
              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-amber-400/10 items-center justify-center text-amber-300/50 group-hover:text-amber-300 transition-colors">
                {step.icon}
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <Link
          to="/register"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-900 font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40 hover:-translate-y-0.5"
        >
          Get Started Now
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>

        {/* trust badge */}
        <p className="text-center text-neutral-400/60 text-xs tracking-[0.2em] uppercase font-medium mt-10">
          Trusted by 5,000+ beauty entrepreneurs
        </p>
      </div>
    </section>
  );
}
