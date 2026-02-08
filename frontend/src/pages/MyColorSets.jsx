import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colorSets } from '../api/client';

export default function MyColorSets() {
  const { user } = useAuth();
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    colorSets
      .list()
      .then(({ data }) => setSets(data))
      .catch(() => setSets([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 mb-4">Log in to view and manage your color sets.</p>
        <Link to="/login?redirect=/my-color-sets" className="text-brand-600 hover:underline font-medium">
          Log in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-slate-600">Loading color sets…</div>
    );
  }

  const mySets = sets.filter((s) => !s.isAdminSet && s.createdBy?._id === user._id);
  const adminSets = sets.filter((s) => s.isAdminSet);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold text-slate-900 mb-2">My Color Sets</h1>
      <p className="text-slate-600 mb-8">
        Use admin-created sets or create your own from product colors for quick reference.
      </p>
      <Link
        to="/color-set/new/edit"
        className="inline-block mb-8 px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600"
      >
        Create color set
      </Link>

      <div className="mb-10">
        <h2 className="text-lg font-medium text-slate-700 mb-4">Admin color sets</h2>
        {adminSets.length ? (
          <div className="space-y-3">
            {adminSets.map((set) => (
              <Link
                key={set._id}
                to={`/color-set/${set._id}`}
                className="block p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-500/50 hover:shadow transition-all"
              >
                <div className="font-medium text-slate-900">{set.name}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {set.colors?.slice(0, 8).map((c) => (
                    <div
                      key={c._id}
                      className="w-6 h-6 rounded-full border border-slate-300"
                      style={{ backgroundColor: c.hexCode || '#666' }}
                      title={c.name}
                    />
                  ))}
                  {set.colors?.length > 8 && (
                    <span className="text-slate-500 text-sm">+{set.colors.length - 8} more</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No admin color sets yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-medium text-slate-700 mb-4">Your color sets</h2>
        {mySets.length ? (
          <div className="space-y-3">
            {mySets.map((set) => (
              <Link
                key={set._id}
                to={`/color-set/${set._id}`}
                className="block p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-500/50 hover:shadow transition-all"
              >
                <div className="font-medium text-slate-900">{set.name}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {set.colors?.slice(0, 8).map((c) => (
                    <div
                      key={c._id}
                      className="w-6 h-6 rounded-full border border-slate-300"
                      style={{ backgroundColor: c.hexCode || '#666' }}
                      title={c.name}
                    />
                  ))}
                  {set.colors?.length > 8 && (
                    <span className="text-slate-500 text-sm">+{set.colors.length - 8} more</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">You haven’t created any color sets yet.</p>
        )}
      </div>
    </div>
  );
}
