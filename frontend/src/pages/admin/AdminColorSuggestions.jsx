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
  const [actionPopup, setActionPopup] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [colorName, setColorName] = useState('');
  const [colorCode, setColorCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchList = () => {
    setLoading(true);
    colorSuggestions.adminList()
      .then((res) => setList(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, []);

  const handleAction = async (id, payload) => {
    setSubmitting(true);
    try {
      await colorSuggestions.adminUpdate(id, payload);
      fetchList();
      setActionPopup(null);
      setAdminNotes('');
      setColorName('');
      setColorCode('');
    } catch { }
    finally {
      setSubmitting(false);
    }
  };

  const openApprovePopup = (s) => {
    setActionPopup({ suggestion: s, action: 'approved' });
    setAdminNotes('');
    setColorName(s.name || '');
    setColorCode(s.colorCode || s.hexCode || '');
  };
  const openRejectPopup = (s) => {
    setActionPopup({ suggestion: s, action: 'rejected' });
    setAdminNotes('');
    setColorName('');
    setColorCode('');
  };
  const closePopup = () => {
    if (!submitting) {
      setActionPopup(null);
      setAdminNotes('');
      setColorName('');
      setColorCode('');
    }
  };
  const submitAction = () => {
    if (!actionPopup) return;
    if (actionPopup.action === 'approved') {
      const nameTrim = colorName.trim();
      const codeTrim = colorCode.trim();
      if (!nameTrim || !codeTrim) return;
      handleAction(actionPopup.suggestion._id, {
        status: 'approved',
        adminNotes: adminNotes.trim() || undefined,
        name: nameTrim,
        colorCode: codeTrim,
      });
    } else {
      handleAction(actionPopup.suggestion._id, {
        status: 'rejected',
        adminNotes: adminNotes.trim() || undefined,
      });
    }
  };

  const filtered = filter === 'all' ? list : list.filter((s) => s.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Color Suggestions</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage color suggestions from clients. Approving a suggestion sends a WhatsApp notification to the user if they have a number on file.</p>
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
                <th className="px-4 py-3 font-semibold text-slate-600">Code</th>
                <th className="px-4 py-3 font-semibold text-slate-600">User</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Product</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Notes</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Image</th>
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
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                    {[s.colorCode, s.hexCode].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="block">{s.user?.name ?? '—'}</span>
                    {s.user?.phone && <span className="block text-xs text-slate-400">WhatsApp: {s.user.phone}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.product?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{s.notes || '—'}</td>
                  <td className="px-4 py-3">
                    {s.imageUrl ? (
                      <a
                        href={s.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        View image
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {s.status === 'pending' && (
                        <>
                          <button onClick={() => openApprovePopup(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">Approve</button>
                          <button onClick={() => openRejectPopup(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors">Reject</button>
                        </>
                      )}
                      {s.status !== 'pending' && (
                        <button onClick={() => handleAction(s._id, { status: 'pending' })} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Set pending</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve / Reject popup */}
      {actionPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closePopup} aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200" role="dialog" aria-modal="true" aria-labelledby="action-popup-title">
            <h2 id="action-popup-title" className="text-lg font-semibold text-slate-900 mb-4">
              {actionPopup.action === 'approved' ? 'Approve suggestion' : 'Reject suggestion'}
            </h2>
            <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-slate-200 shrink-0" style={{ backgroundColor: actionPopup.suggestion.hexCode }} title={actionPopup.suggestion.hexCode} />
                <div>
                  <p className="text-xs text-slate-500 font-mono">{actionPopup.suggestion.hexCode}</p>
                  {actionPopup.suggestion.user?.name && <p className="text-sm text-slate-600 mt-0.5">By {actionPopup.suggestion.user.name}</p>}
                </div>
              </div>
            </div>
            {actionPopup.action === 'approved' && (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color name *</label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="e.g. Sunset Coral"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 mb-3"
                  disabled={submitting}
                />
                <label className="block text-sm font-medium text-slate-700 mb-1">Color code *</label>
                <input
                  type="text"
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                  placeholder="e.g. BC-001 or hex"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 mb-3"
                  disabled={submitting}
                />
              </>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {actionPopup.action === 'approved' ? 'Optional note to include in notification' : 'Optional reason for rejection'}
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={actionPopup.action === 'approved' ? 'e.g. Great choice! We’ll add it to the catalog soon.' : 'e.g. Color does not meet current range.'}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 resize-none"
              disabled={submitting}
            />
            <div className="flex gap-2 mt-5 justify-end">
              <button
                type="button"
                onClick={closePopup}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAction}
                disabled={submitting || (actionPopup.action === 'approved' && (!colorName.trim() || !colorCode.trim()))}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${actionPopup.action === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {submitting ? 'Saving…' : actionPopup.action === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
