import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { products } from '../api/client';

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
          const filtered = all.filter(
            (p) => (p.category?._id ?? p.category) === categoryId
          );
          setList(filtered);
        } else {
          setList(all);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load catalog');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [categoryId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-center py-12 text-slate-600">Loading catalog…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="py-12 text-center text-red-600">{error}</div>
      </div>
    );
  }

  const title = categoryId
    ? (categoryNameFromState ? `${categoryNameFromState} — Products` : 'Products in this category')
    : 'Product catalog';
  const subtitle = categoryId
    ? `Products in ${categoryNameFromState || 'this category'}.`
    : 'Cosmetics raw materials and finished products — multiple grades and colors per product.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="lg:text-3xl text-2xl font-semibold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-600 mb-10">{subtitle}</p>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {list.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="block p-4 lg:p-6 rounded-md bg-white border border-slate-200 shadow-sm hover:border-brand-500/50 hover:shadow transition-all"
          >
            {product.image ? (
              <img
                src={product.image}
                alt=""
                className="lg:h-40 h-32 w-fit object-contain rounded-xl"
              />
            ) : (
              <div className="h-32 rounded-lg bg-brand-100 flex items-center justify-center mb-4">
                <span className="text-brand-600 text-lg">◆</span>
              </div>
            )}
            <h2 className="text-sm lg:text-base font-medium text-slate-900 mb-1">{product.name}</h2>
           
          </Link>
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-slate-600 text-center py-12">
          {categoryId ? 'No products in this category yet.' : 'No products in catalog yet.'}
        </p>
      )}
    </div>
  );
}
