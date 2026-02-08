import { useEffect, useState } from 'react';
import { products, grades } from '../../api/client';

export default function AdminGrades() {
  const [productList, setProductList] = useState([]);
  const [gradeList, setGradeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    product: '',
    name: '',
    price: '',
    isActive: true,
  });
  const [error, setError] = useState('');

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

  const openCreate = () => {
    setEditingId(null);
    setForm({
      product: productList[0]?._id ?? '',
      name: '',
      price: '',
      isActive: true,
    });
    setError('');
  };

  const openEdit = (grade) => {
    setEditingId(grade._id);
    setForm({
      product: grade.product?._id ?? grade.product ?? '',
      name: grade.name ?? '',
      price: grade.price ?? '',
      isActive: grade.isActive !== false,
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    openCreate();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.name?.trim()) {
      setError('Product and name are required.');
      return;
    }
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      setError('Price must be a valid number.');
      return;
    }
    setError('');
    try {
      if (editingId) {
        await grades.update(editingId, {
          name: form.name.trim(),
          price,
          isActive: form.isActive,
        });
      } else {
        await grades.create({
          product: form.product,
          name: form.name.trim(),
          price,
          isActive: form.isActive,
        });
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save grade');
    }
  };

  if (loading) return <div className="text-slate-600">Loading…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-slate-900">Grades</h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Add grade
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-slate-900 font-medium mb-4">
          {editingId ? 'Edit grade' : 'Add grade'}
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
            <select
              value={form.product}
              onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900"
              required
              disabled={!!editingId}
            >
              <option value="">Select product</option>
              {productList.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {editingId && (
              <p className="mt-1 text-xs text-slate-500">Product cannot be changed when editing.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900"
              placeholder="e.g. Premium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900"
              placeholder="0.00"
              required
            />
          </div>
          <div className="flex items-center gap-2 sm:items-end">
            <input
              type="checkbox"
              id="gradeIsActive"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="gradeIsActive" className="text-sm text-slate-700">
              Active
            </label>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
            >
              {editingId ? 'Update' : 'Add grade'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

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
                  <button
                    type="button"
                    onClick={() => openEdit(g)}
                    className="text-amber-600 hover:underline font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {gradeList.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-500">No grades yet. Add one above.</div>
        )}
      </div>
    </div>
  );
}
