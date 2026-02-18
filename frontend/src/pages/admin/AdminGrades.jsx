import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { products, grades } from '../../api/client';

export default function AdminGrades() {
  const [productList, setProductList] = useState([]);
  const [gradeList, setGradeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([products.list(), grades.list()])
      .then(([pRes, gRes]) => {
        const pData = pRes.data;
        const gData = gRes.data;
        setProductList(Array.isArray(pData) ? pData : (pData?.data ?? []));
        setGradeList(Array.isArray(gData) ? gData : (gData?.data ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const getProductName = (productId) => {
    if (!productId) return '—';
    const p = productList.find((x) => x._id === productId);
    return p?.name ?? productId;
  };

  const handleDelete = async (grade) => {
    if (!window.confirm(`Delete grade "${grade.name}"? This cannot be undone.`)) return;
    setDeletingId(grade._id);
    setError('');
    try {
      await grades.delete(grade._id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete grade');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-slate-600">Loading…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-slate-900">Grades</h2>
        <Link
          to="/admin/grades/new"
          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Add grade
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Grade name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gradeList.map((g) => (
              <tr key={g._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3 text-slate-900">
                  {getProductName(g.product?._id ?? g.product)}
                </td>
                <td className="px-4 py-3 text-slate-900">{g.name}</td>
                <td className="px-4 py-3 text-slate-600">{g.price}</td>
                <td className="px-4 py-3 text-slate-600">{g.isActive !== false ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/grades/${g._id}/edit`}
                    className="text-amber-600 hover:underline font-medium mr-3"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(g)}
                    disabled={deletingId === g._id}
                    className="text-red-600 hover:underline font-medium disabled:opacity-50"
                  >
                    {deletingId === g._id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gradeList.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500">
            No grades yet. <Link to="/admin/grades/new" className="text-amber-600 hover:underline">Add one</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
