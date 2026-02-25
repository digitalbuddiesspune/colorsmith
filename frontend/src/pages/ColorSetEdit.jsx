import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colorSets, products } from '../api/client';

export default function ColorSetEdit() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [addFromProductId, setAddFromProductId] = useState('');
  const [addFromColors, setAddFromColors] = useState([]);
  const [pendingAddIds, setPendingAddIds] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    products.list().then((res) => {
      const data = res.data?.data ?? res.data ?? [];
      setProductList(Array.isArray(data) ? data : []);
    }).catch(() => {});
    if (!isNew) {
      colorSets
        .get(id)
        .then(({ data }) => {
          setName(data.name ?? '');
          setProductId(data.product?._id || '');
          setSelectedColors(Array.isArray(data.colors) ? data.colors : []);
        })
        .catch(() => setError('Color set not found'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, isNew, user]);

  useEffect(() => {
    if (!addFromProductId) {
      setAddFromColors([]);
      setPendingAddIds([]);
      return;
    }
    colorSets
      .productColors(addFromProductId)
      .then(({ data }) => {
        setAddFromColors(Array.isArray(data) ? data : []);
        setPendingAddIds([]);
      })
      .catch(() => {
        setAddFromColors([]);
        setPendingAddIds([]);
      });
  }, [addFromProductId]);

  const addSelectedToSet = () => {
    const toAdd = addFromColors.filter((c) => pendingAddIds.includes(c._id));
    const existingIds = new Set(selectedColors.map((c) => c._id));
    const newColors = toAdd.filter((c) => !existingIds.has(c._id));
    setSelectedColors((prev) => [...prev, ...newColors]);
    setPendingAddIds([]);
  };

  const removeColorFromSet = (colorId) => {
    setSelectedColors((prev) => prev.filter((c) => c._id !== colorId));
  };

  const togglePendingAdd = (colorId) => {
    setPendingAddIds((prev) =>
      prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const colorIds = selectedColors.map((c) => c._id);
      if (isNew) {
        const { data } = await colorSets.create({
          name,
          product: productId || undefined,
          colorIds,
          isAdminSet: user?.role === 'admin',
        });
        navigate(`/color-set/${data._id}`);
      } else {
        await colorSets.update(id, {
          name,
          product: productId || undefined,
          colorIds,
        });
        navigate(`/color-set/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-600">
        Log in to create or edit color sets.
        <Link to="/login" className="block mt-2 text-brand-600 font-medium">Log in</Link>
      </div>
    );
  }

  if (loading && !isNew) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-slate-600">Loading…</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/my-color-sets" className="text-slate-600 hover:text-slate-900 text-sm mb-6 inline-block">
        ← My Color Sets
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900 mb-8">
        {isNew ? 'New color set' : 'Edit color set'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Product (optional – for reference)</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">— None —</option>
            {productList.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Colors in this set</label>
          {selectedColors.length ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedColors.map((c) => (
                <span
                  key={c._id}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <span
                    className="w-5 h-5 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: c.hexCode || '#666' }}
                  />
                  <span className="text-sm text-slate-700">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => removeColorFromSet(c._id)}
                    className="text-slate-400 hover:text-red-600 p-0.5"
                    title="Remove from set"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No colors yet. Add colors from a product below.</p>
          )}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Add colors from a product</label>
          <p className="text-slate-500 text-sm mb-3">Select a product, then choose colors to add to this set. You can add colors from multiple products.</p>
          <select
            value={addFromProductId}
            onChange={(e) => setAddFromProductId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-brand-500 mb-3"
          >
            <option value="">— Choose product —</option>
            {productList.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          {addFromColors.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {addFromColors.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => togglePendingAdd(c._id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      pendingAddIds.includes(c._id)
                        ? 'border-brand-500 bg-brand-100 text-brand-800'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-slate-300"
                      style={{ backgroundColor: c.hexCode || '#666' }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={addSelectedToSet}
                disabled={pendingAddIds.length === 0}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Add {pendingAddIds.length > 0 ? `${pendingAddIds.length} ` : ''}selected to set
              </button>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
          </button>
          <Link
            to={isNew ? '/my-color-sets' : `/color-set/${id}`}
            className="px-6 py-2.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
