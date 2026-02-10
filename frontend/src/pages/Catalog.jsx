import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { products } from '../api/client';

// Random soft accent per card for visual variety
const accents = [
  { bg: 'bg-rose-50', ring: 'hover:ring-rose-300', tag: 'bg-rose-100 text-rose-700' },
  { bg: 'bg-violet-50', ring: 'hover:ring-violet-300', tag: 'bg-violet-100 text-violet-700' },
  { bg: 'bg-amber-50', ring: 'hover:ring-amber-300', tag: 'bg-amber-100 text-amber-700' },
  { bg: 'bg-sky-50', ring: 'hover:ring-sky-300', tag: 'bg-sky-100 text-sky-700' },
  { bg: 'bg-emerald-50', ring: 'hover:ring-emerald-300', tag: 'bg-emerald-100 text-emerald-700' },
  { bg: 'bg-fuchsia-50', ring: 'hover:ring-fuchsia-300', tag: 'bg-fuchsia-100 text-fuchsia-700' },
  { bg: 'bg-teal-50', ring: 'hover:ring-teal-300', tag: 'bg-teal-100 text-teal-700' },
  { bg: 'bg-orange-50', ring: 'hover:ring-orange-300', tag: 'bg-orange-100 text-orange-700' },
];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const categoryId = searchParams.get('category');
  const categoryNameFromState = location.state?.categoryName;

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    products
      .list()
      .then((res) => {
        const data = res.data;
        const all = Array.isArray(data) ? data : (data?.data ?? []);
        if (cancelled) return;
        if (categoryId) {
          setList(all.filter((p) => (p.category?._id ?? p.category) === categoryId));
        } else {
          setList(all);
        }
      })
      .catch(() => { if (!cancelled) setError('Failed to load catalog'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [categoryId]);

  /* ---- loading ---- */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        <span className="text-neutral-400 text-sm">Loading catalog…</span>
      </div>
    );
  }

  /* ---- error ---- */
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-red-600">{error}</div>
    );
  }

  const title = categoryId
    ? (categoryNameFromState ? categoryNameFromState : 'Products')
    : 'Product Catalog';
  const subtitle = categoryId
    ? `Explore ${categoryNameFromState || 'this category'} — multiple grades & colors per product.`
    : 'Cosmetics raw materials & finished products — multiple grades and colors per product.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* header */}
      <div className="mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">{title}</h1>
        <p className="text-neutral-500 max-w-2xl">{subtitle}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
          <span className="inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
            {list.length} product{list.length !== 1 && 's'}
          </span>
        </div>
      </div>

      {/* grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {list.map((product, i) => {
          const accent = accents[i % accents.length];
          const gradesCount = Array.isArray(product.grades) ? product.grades.length : 0;
          const colorsCount = Array.isArray(product.colors) ? product.colors.length : 0;
          const categoryName = product.category?.name;

          return (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className={`group relative flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm`}
            >
              {/* image area */}
              <div className={`relative flex items-center justify-center aspect-square overflow-hidden`}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full w-auto object-contain"
                  />
                ) : (
                  <div className="text-neutral-300">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                  </div>
                )}

                {/* category badge */}
                {categoryName && (
                  <span className={`absolute top-3 left-3 px-2.5 rounded-full text-[10px] sm:text-xs font-semibold ${accent.tag}`}>
                    {categoryName}
                  </span>
                )}
              </div>

              {/* info */}
              <div className="flex flex-col flex-1 p-3 sm:p-4">
                <h2 className="text-sm sm:text-base font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-neutral-700 transition-colors">
                  {product.name}
                </h2>

                <div className="mt-auto flex flex-wrap gap-1.5">
                  {gradesCount > 0 && (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium">
                      {gradesCount} grade{gradesCount !== 1 && 's'}
                    </span>
                  )}
                  {colorsCount > 0 && (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium">
                      {colorsCount} color{colorsCount !== 1 && 's'}
                    </span>
                  )}
                </div>
              </div>

              {/* bottom accent bar — grows on hover */}
              <div className={`h-1 ${accent.tag.split(' ')[0]} w-0 group-hover:w-full transition-all duration-500`} />
            </Link>
          );
        })}
      </div>

      {/* empty state */}
      {list.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
          </div>
          <p className="text-neutral-500 mb-2">{categoryId ? 'No products in this category yet.' : 'No products in catalog yet.'}</p>
          <Link to="/" className="text-sm font-medium text-neutral-900 hover:underline">← Back to home</Link>
        </div>
      )}
    </div>
  );
}
