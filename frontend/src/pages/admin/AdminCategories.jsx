import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../api/client';

export default function AdminCategories() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    categories.list().then(({ data }) => setList(data)).catch(() => setList([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categories.delete(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="text-slate-600">Loading…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-slate-900">Categories</h2>
        <Link
          to="/admin/categories/new"
          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Add category
        </Link>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((cat) => (
              <tr key={cat._id} className="border-t border-slate-200">
                <td className="px-4 py-3 text-slate-900">{cat.name}</td>
                <td className="px-4 py-3 text-slate-600">{cat.description || '—'}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/admin/categories/${cat._id}/edit`}
                    className="text-amber-600 hover:underline mr-3"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(cat._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
