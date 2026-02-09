const points = [
  {
    title: 'Multiple Grades per Product',
    description: 'Choose the right grade for your formulation and budget.',
    icon: 'grades',
  },
  {
    title: 'Ready & Custom Color Sets',
    description: 'Use our curated sets or build your own from our color library.',
    icon: 'palette',
  },
  {
    title: 'Bulk Ordering',
    description: 'Scale with volume pricing and dedicated support for large orders.',
    icon: 'bulk',
  },
  {
    title: 'Regulatory Documents',
    description: 'Access COAs, TDS, and compliance documentation when you need it.',
    icon: 'docs',
  },
  {
    title: 'Consistent Batch Quality',
    description: 'Strict QC and batch tracking for repeatable results.',
    icon: 'quality',
  },
];

function Icon({ name }) {
  const base = 'w-10 h-10 rounded-xl flex items-center justify-center';
  if (name === 'grades') {
    return (
      <div className={`${base} bg-brand-100 text-brand-600`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
      </div>
    );
  }
  if (name === 'palette') {
    return (
      <div className={`${base} bg-brand-100 text-brand-600`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4m0 0h12a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2m0 0h4a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-4-1h8m-4-1H4" /></svg>
      </div>
    );
  }
  if (name === 'bulk') {
    return (
      <div className={`${base} bg-brand-100 text-brand-600`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      </div>
    );
  }
  if (name === 'docs') {
    return (
      <div className={`${base} bg-brand-100 text-brand-600`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      </div>
    );
  }
  if (name === 'quality') {
    return (
      <div className={`${base} bg-brand-100 text-brand-600`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
      </div>
    );
  }
  return null;
}

export default function WhyColorSmith() {
  return (
    <section id="why-color-smith" className="scroll-mt-20">
      <div className='text-center'>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Why Color Smith</h2>
      <p className="text-slate-600 mb-10 w-full max-w-2xl mx-auto">
        We support brands and manufacturers with a full range of cosmetics raw materials and finished products, from multiple grades to custom color sets.
      </p>
      </div>
     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {points.map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow transition-shadow"
          >
            <Icon name={item.icon} />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-slate-600 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
