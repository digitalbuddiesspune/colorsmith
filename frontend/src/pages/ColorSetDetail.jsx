import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colorSets } from '../api/client';

export default function ColorSetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [setData, setSetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setError('Log in to view color sets');
      setLoading(false);
      return;
    }
    colorSets
      .get(id)
      .then(({ data }) => setSetData(data))
      .catch(() => setError('Color set not found'))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-slate-600">Loading…</div>
    );
  }

  if (error || !setData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-red-600">
        {error || 'Not found'}
        <Link to="/my-color-sets" className="block mt-4 text-brand-600 hover:underline font-medium">
          Back to My Color Sets
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || (setData.createdBy?._id === user?._id && !setData.isAdminSet);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/my-color-sets" className="text-slate-600 hover:text-slate-900 text-sm mb-6 inline-block">
        ← My Color Sets
      </Link>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{setData.name}</h1>
          <p className="text-slate-600 text-sm mt-1">
            {setData.isAdminSet ? 'Admin color set' : `By ${setData.createdBy?.name}`}
            {setData.product?.name && ` · ${setData.product.name}`}
          </p>
        </div>
        {canEdit && (
          <Link
            to={`/color-set/${id}/edit`}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm font-medium"
          >
            Edit
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {setData.colors?.length ? setData.colors.map((c) => (
          <div
            key={c._id}
            className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-200 shadow-sm"
          >
            <div
              className="w-14 h-14 rounded-full border-2 border-slate-300 mb-2"
              style={{ backgroundColor: c.hexCode || '#666' }}
            />
            <span className="text-slate-700 text-sm">{c.name}</span>
            <span className="text-slate-500 text-xs">{c.hexCode}</span>
          </div>
        )) : (
          <p className="text-slate-600">No colors in this set</p>
        )}
      </div>
    </div>
  );
}
