import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { products, colors } from '../../api/client';

export default function AdminColorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    product: '',
    name: '',
    hexCode: '#000000',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const pRes = await products.list();
        const pData = pRes.data;
        const list = Array.isArray(pData) ? pData : pData?.data ?? [];
        setProductList(list);
        if (isEdit) {
          const cRes = await colors.get(id);
          const color = cRes.data?.data ?? cRes.data;
          if (color) {
            setForm({
              product: color.product?._id ?? color.product ?? '',
              name: color.name ?? '',
              hexCode: color.hexCode ?? '#000000',
            });
          }
        } else if (list.length > 0) {
          setForm((f) => ({ ...f, product: f.product || list[0]._id }));
        }
      } catch {
        if (isEdit) setError('Failed to load color');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

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
    setSaving(true);
    try {
      if (isEdit) {
        await colors.update(id, {
          product: form.product,
          name: form.name.trim(),
          hexCode: hex,
        });
      } else {
        await colors.create({
          product: form.product,
          name: form.name.trim(),
          hexCode: hex,
        });
      }
      navigate('/admin/colors');
    } catch (err) {
      setError(err.response?.data?.message || (isEdit ? 'Failed to update color' : 'Failed to add color'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-600">Loading…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/admin/colors"
          className="text-slate-500 hover:text-slate-700"
        >
          ← Back to colors
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isEdit ? 'Edit color' : 'Add color'}
        </h2>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product *</label>
            <select
              value={form.product}
              onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-60"
              required
              disabled={isEdit}
            >
              <option value="">Select product</option>
              {productList.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {isEdit && (
              <p className="mt-1 text-xs text-slate-500">Product cannot be changed when editing.</p>
            )}
            {!isEdit && productList.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">Add products first in Admin → Products.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="e.g. Ruby Red"
              required
            />
          </div>
          <div className="sm:col-span-2">
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
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="#FF5733"
              />
            </div>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? (isEdit ? 'Updating…' : 'Adding…') : (isEdit ? 'Update' : 'Add color')}
            </button>
            <Link
              to="/admin/colors"
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
