import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colorSets } from '../../api/client';

export default function AdminColorSets() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    colorSets
      .list()
      .then(({ data }) => setSets(data))
      .catch(() => setSets([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-600">Loading…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-slate-900">All color sets</h2>
        <Link
          to="/color-set/new/edit"
          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Create color set
        </Link>
      </div>
      <div className="space-y-3">
        {sets.map((s) => (
          <div
            key={s._id}
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div>
                <span className="font-medium text-slate-900">{s.name}</span>
                {s.isAdminSet && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-800">Admin</span>
                )}
              </div>
              <div className="flex gap-1">
                {s.colors?.slice(0, 6).map((c) => (
                  <div
                    key={c._id}
                    className="w-6 h-6 rounded-full border border-slate-300"
                    style={{ backgroundColor: c.hexCode || '#666' }}
                    title={c.name}
                  />
                ))}
                {s.colors?.length > 6 && (
                  <span className="text-slate-500 text-sm">+{s.colors.length - 6}</span>
                )}
              </div>
            </div>
            <Link
              to={`/color-set/${s._id}`}
              className="text-amber-600 hover:underline text-sm font-medium"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
