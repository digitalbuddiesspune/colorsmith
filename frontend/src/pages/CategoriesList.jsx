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
    <div className="py-10 ">
      <div className='text-center'>
      <h1 className="lg:text-3xl text-2xl font-semibold text-slate-900 mb-2 uppercase">Shop By Colllection</h1>
      
      </div>
    
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8 gap-4 mt-10 rounded-lg">
        {list.map((category) => (
          <Link
            key={category._id}
            to={`/catalog?category=${category._id}`}
            state={{ categoryName: category.name }}
            className=""
          >
            <div>
              <img src={category.image} alt={category.name} className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h2 className="lg:text-xl uppercase text-center col-span-2 text-sm font-medium text-slate-900  transition-colors text-center truncate">
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
