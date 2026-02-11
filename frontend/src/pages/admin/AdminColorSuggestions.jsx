import { useEffect, useState } from 'react';
import { colorSuggestions } from '../../api/client';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminColorSuggestions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchList = () => {
    setLoading(true);
    colorSuggestions.adminList()
      .then((res) => setList(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, []);

  const handleAction = async (id, status) => {
    try {
      await colorSuggestions.adminUpdate(id, { status });
      fetchList();
    } catch { }
  };

  const filtered = filter === 'all' ? list : list.filter((s) => s.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Color Suggestions</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage color suggestions from clients</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-10">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400 text-center py-10">No suggestions found.</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Color</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Product</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Notes</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="w-8 h-8 rounded-lg border border-slate-200" style={{ backgroundColor: s.hexCode }} title={s.hexCode} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="block text-xs text-slate-400 font-mono">{s.hexCode}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.user?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.product?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{s.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {s.status === 'pending' ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => handleAction(s._id, 'approved')} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">Approve</button>
                        <button onClick={() => handleAction(s._id, 'rejected')} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Reject</button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
