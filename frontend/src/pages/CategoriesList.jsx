import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { categories } from '../api/client';
import { scrollToTop } from '../utility/scrollToTop';

// In-memory cache for categories list (avoids refetch on every visit)
const CACHE_KEY = 'colorsmith_categories_list';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedCategories() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function setCachedCategories(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

function CategoryCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-lg bg-slate-200" />
      <div className="mt-2 h-4 rounded bg-slate-200 w-3/4 mx-auto" />
      <div className="mt-1.5 h-3 rounded bg-slate-100 w-1/2 mx-auto" />
    </div>
  );
}

function CategoriesSkeleton() {
  const count = 10; // 2 rows on small, 5 on lg
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8 gap-4 mt-10 rounded-lg">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function CategoriesList() {
  const [list, setList] = useState(() => getCachedCategories());
  const [loading, setLoading] = useState(!getCachedCategories());
  const [error, setError] = useState('');

  useEffect(() => {
    const cached = getCachedCategories();
    if (cached && cached.length > 0) {
      setList(cached);
      setLoading(false);
      // Optional: refetch in background to keep cache fresh
      categories
        .list()
        .then(({ data }) => {
          const next = Array.isArray(data) ? data : [];
          if (next.length > 0) {
            setList(next);
            setCachedCategories(next);
          }
        })
        .catch(() => {});
      return;
    }

    let cancelled = false;
    setLoading(true);
    categories
      .list()
      .then(({ data }) => {
        const next = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setList(next);
          setError('');
          if (next.length > 0) setCachedCategories(next);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load categories');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="py-20">
        <div className="text-center">
          <h1 className="lg:text-3xl text-2xl font-semibold text-slate-900 mb-2 uppercase">Shop By Collection</h1>
        </div>
        <div className="mt-10 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError('');
              setLoading(true);
              categories.list().then(({ data }) => {
                const next = Array.isArray(data) ? data : [];
                setList(next);
                if (next.length > 0) setCachedCategories(next);
              }).catch((e) => setError(e.response?.data?.message || 'Failed')).finally(() => setLoading(false));
            }}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="text-center">
        <h1 className="lg:text-3xl text-2xl font-semibold text-slate-900 mb-2 uppercase">Shop By Collection</h1>
      </div>

      {loading ? (
        <CategoriesSkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8 gap-4 mt-10 rounded-lg">
          {list.map((category) => (
            <Link
              key={category._id}
              to={`/catalog?category=${category._id}`}
              state={{ categoryName: category.name }}
              onClick={scrollToTop}
              className="group"
            >
              <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="lg:text-xl uppercase text-center text-sm font-medium text-slate-900 transition-colors truncate mt-2">
                  {category.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && list.length === 0 && (
        <p className="text-center text-slate-500 mt-10">No categories yet.</p>
      )}
    </div>
  );
}
