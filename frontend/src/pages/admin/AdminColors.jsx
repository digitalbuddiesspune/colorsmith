import { useEffect, useState } from 'react';
import { products, colors } from '../../api/client';

export default function AdminColors() {
  const [productList, setProductList] = useState([]);
  const [colorList, setColorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    product: '',
    name: '',
    hexCode: '#000000',
  });
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

  const openCreate = () => {
    setEditingId(null);
    setForm({
      product: productList[0]?._id ?? '',
      name: '',
      hexCode: '#000000',
    });
    setError('');
  };

  const openEdit = (color) => {
    setEditingId(color._id);
    setForm({
      product: color.product?._id ?? color.product ?? '',
      name: color.name ?? '',
      hexCode: color.hexCode ?? '#000000',
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
    const hex = form.hexCode?.trim() || '#000000';
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setError('Hex code must be like #FF5733 (6 hex digits).');
      return;
    }
    setError('');
    try {
      if (editingId) {
        await colors.update(editingId, {
          name: form.name.trim(),
          hexCode: hex,
          product: form.product,
        });
      } else {
        await colors.create({
          product: form.product,
          name: form.name.trim(),
          hexCode: hex,
        });
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save color');
    }
  };

  const deleteColor = async (id) => {
    if (!confirm('Delete this color?')) return;
    setError('');
    try {
      await colors.delete(id);
      if (editingId === id) setEditingId(null);
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
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Add color
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-slate-900 font-medium mb-4">
          {editingId ? 'Edit color' : 'Add color'}
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
              placeholder="e.g. Ruby Red"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hex code *</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.hexCode}
                onChange={(e) => setForm((f) => ({ ...f, hexCode: e.target.value }))}
                className="h-10 w-14 rounded border border-slate-300 cursor-pointer"
              />
              <input
                type="text"
                value={form.hexCode}
                onChange={(e) => setForm((f) => ({ ...f, hexCode: e.target.value }))}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
                placeholder="#FF5733"
              />
            </div>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
            >
              {editingId ? 'Update' : 'Add color'}
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
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="text-amber-600 hover:underline font-medium mr-3"
                  >
                    Edit
                  </button>
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
          <div className="px-4 py-8 text-center text-slate-500">No colors yet. Add one above.</div>
        )}
      </div>
    </div>
  );
}
