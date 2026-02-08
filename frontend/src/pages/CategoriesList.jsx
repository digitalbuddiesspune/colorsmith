import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { categories } from '../api/client';

export default function CategoriesList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    categories
      .list()
      .then(({ data }) => {
        if (!cancelled) setList(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="py-10 text-slate-600">Loading…</div>;
  if (error) return <div className="py-10 text-red-600">{error}</div>;

  return (
    <div className="py-10">
      <h1 className="lg:text-3xl text-2xl font-semibold text-slate-900 mb-2">Categories</h1>
      <p className="text-slate-600 mb-10">
        Browse our range of cosmetics finished products and raw materials by category.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {list.map((category) => (
          <Link
            key={category._id}
            to={`/catalog?category=${category._id}`}
            state={{ categoryName: category.name }}
            className="items-center gap-4 lg:gap-6 shadow-sm rounded-md lg:p-6 p-4 bg-white border border-slate-200  hover:border-brand-500/50 transition-all group"
          >
            <div>
              <img src={category.image} alt={category.name} className="lg:h-40 h-32 w-fit object-contain rounded-xl" />
            </div>
            <div>
              <h2 className="lg:text-base text-sm font-medium text-slate-900 group-hover:text-brand-600 transition-colors text-center truncate">
                {category.name}
              </h2>
              {/* <p className="text-slate-500 text-sm">View products</p> */}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
