import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, products } from '../../api/client';

export default function AdminProducts() {
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    // Load categories and products independently so one failure doesn't block the other
    categories
      .list()
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setCategoryList(list);
      })
      .catch(() => setCategoryList([]));
    products
      .list()
      .then((res) => {
        const data = res.data;
        setProductList(Array.isArray(data) ? data : (data?.data ?? []));
      })
      .catch(() => setProductList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '—';
    const cat = categoryList.find((c) => c._id === categoryId);
    return cat?.name ?? categoryId;
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setError('');
    try {
      await products.delete(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="text-slate-600">Loading…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-slate-900">Products</h2>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Add product
        </Link>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
              <th className="px-4 py-3 font-medium w-20">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Min. order</th>
              <th className="px-4 py-3 font-medium w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((p) => (
              <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        className="relative z-10 w-12 h-12 object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400 text-xs">—</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-4 py-3 text-slate-600">{getCategoryName(p.category?._id ?? p.category)}</td>
                <td className="px-4 py-3 text-slate-600">{p.minimumOrderQuantity ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/products/${p._id}/edit`}
                    className="text-amber-600 hover:underline font-medium mr-3"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteProduct(p._id)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productList.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500">No products yet. Add one above.</div>
        )}
      </div>

    </div>
  );
}
