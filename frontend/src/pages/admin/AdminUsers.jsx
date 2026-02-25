import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { users as usersApi } from '../../api/client';

const LIMIT = 20;

function Avatar({ name }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold shrink-0">
      {initials}
    </span>
  );
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

export default function AdminUsers() {
  const [userList, setUserList]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [search, setSearch]         = useState('');
  const [inputVal, setInputVal]     = useState('');
  const [deleting, setDeleting]     = useState(null);
  const debounceRef                 = useRef(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page, limit: LIMIT, search });
      setUserList(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleSearchInput = (val) => {
    setInputVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await usersApi.delete(id);
      setUserList((prev) => prev.filter((u) => u._id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch {
      alert('Failed to delete user.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Back */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination.total} registered {pagination.total === 1 ? 'user' : 'users'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email or company…"
            value={inputVal}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading users…</div>
        ) : userList.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No users found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['#', 'User', 'Company', 'Role', 'Joined', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userList.map((user, idx) => (
                    <tr key={user._id} className="hover:bg-[#FAF9F7] transition-colors">
                      {/* Row number */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 w-10">
                        {(page - 1) * LIMIT + idx + 1}
                      </td>

                      {/* Name + email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div>
                            <p className="text-sm font-medium text-slate-900 leading-tight">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {user.company || <span className="text-slate-300">—</span>}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 capitalize">
                          {user.role || 'client'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(user._id, user.name)}
                          disabled={deleting === user._id}
                          className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {deleting === user._id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-slate-500">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} of{' '}
                <span className="font-medium text-slate-700">{pagination.total}</span> users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {/* Page number pills */}
                <div className="flex gap-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '…' ? (
                        <span key={`dots-${i}`} className="px-2 py-1 text-sm text-slate-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                            p === page
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
