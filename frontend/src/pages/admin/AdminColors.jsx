import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { products, colors } from '../../api/client';

export default function AdminColors() {
  const [productList, setProductList] = useState([]);
  const [colorList, setColorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([products.list(), colors.list()])
      .then(([pRes, cRes]) => {
        const pData = pRes.data;
        const cData = cRes.data;
        setProductList(Array.isArray(pData) ? pData : (pData?.data ?? []));
        setColorList(Array.isArray(cData) ? cData : (cData?.data ?? []));
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

  const deleteColor = async (id) => {
    if (!confirm('Delete this color?')) return;
    setError('');
    try {
      await colors.delete(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="text-slate-600">Loading…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-slate-900">Colors</h2>
        <Link
          to="/admin/colors/new"
          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Add color
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
              <th className="px-4 py-3 font-medium w-14">Swatch</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Hex</th>
              <th className="px-4 py-3 font-medium w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {colorList.map((c) => (
              <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-300 shrink-0"
                    style={{ backgroundColor: c.hexCode || '#888' }}
                    title={c.hexCode}
                  />
                </td>
                <td className="px-4 py-3 text-slate-900">
                  {getProductName(c.product?._id ?? c.product)}
                </td>
                <td className="px-4 py-3 text-slate-900">{c.name}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{c.hexCode}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/colors/${c._id}/edit`}
                    className="text-amber-600 hover:underline font-medium mr-3"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteColor(c._id)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {colorList.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500">
            No colors yet. <Link to="/admin/colors/new" className="text-amber-600 hover:underline">Add one</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
