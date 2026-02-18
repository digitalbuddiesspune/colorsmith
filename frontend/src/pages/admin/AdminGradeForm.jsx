import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { products, grades } from '../../api/client';

export default function AdminGradeForm() {
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
    price: '',
    isActive: true,
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
          const gRes = await grades.get(id);
          const grade = gRes.data?.data ?? gRes.data;
          if (grade) {
            setForm({
              product: grade.product?._id ?? grade.product ?? '',
              name: grade.name ?? '',
              price: grade.price ?? '',
              isActive: grade.isActive !== false,
            });
          }
        } else if (list.length > 0) {
          setForm((f) => ({ ...f, product: f.product || list[0]._id }));
        }
      } catch {
        if (isEdit) setError('Failed to load grade');
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
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      setError('Price must be a valid number.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await grades.update(id, {
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
      navigate('/admin/grades');
    } catch (err) {
      setError(err.response?.data?.message || (isEdit ? 'Failed to update grade' : 'Failed to add grade'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-600">Loading…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/grades" className="text-slate-500 hover:text-slate-700">
          ← Back to grades
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isEdit ? 'Edit grade' : 'Add grade'}
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
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? (isEdit ? 'Updating…' : 'Adding…') : (isEdit ? 'Update' : 'Add grade')}
            </button>
            <Link
              to="/admin/grades"
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
