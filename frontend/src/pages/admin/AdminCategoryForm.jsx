import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { categories, uploadImage } from '../../api/client';

export default function AdminCategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== 'new';

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
    subCategories: [],
  });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    categories
      .list()
      .then(({ data }) => {
        const cat = data.find((c) => c._id === id);
        if (cat) {
          setForm({
            name: cat.name || '',
            description: cat.description || '',
            image: cat.image || '',
            isActive: cat.isActive !== false,
            subCategories: Array.isArray(cat.subCategories)
              ? cat.subCategories.map((s) => ({ name: s.name || '' }))
              : [],
          });
        } else {
          setError('Category not found');
        }
      })
      .catch(() => setError('Failed to load category'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        image: form.image || undefined,
        isActive: form.isActive,
        subCategories: form.subCategories.filter((s) => s.name?.trim()).map((s) => ({ name: s.name.trim() })),
      };
      if (isEdit) {
        await categories.update(id, payload);
      } else {
        await categories.create(payload);
      }
      navigate('/admin/categories');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-slate-600">Loading category…</div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/admin/categories"
          className="text-slate-500 hover:text-slate-700"
        >
          ← Back to categories
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isEdit ? 'Edit category' : 'Add category'}
        </h2>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="e.g. Nail lacquers"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Image
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 cursor-pointer disabled:opacity-50">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    disabled={imageUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageUploading(true);
                      setError('');
                      try {
                        const res = await uploadImage(file);
                        const url = res.data?.url;
                        if (url) setForm((f) => ({ ...f, image: url }));
                      } catch (err) {
                        setError(err.response?.data?.message || 'Image upload failed');
                      } finally {
                        setImageUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                  {imageUploading ? 'Uploading…' : 'Upload from device'}
                </label>
                <span className="text-xs text-slate-500">JPEG, PNG, GIF or WebP (max 5 MB)</span>
              </div>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Or paste image URL"
              />
              {form.image && (
                <img src={form.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-slate-200" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700">
              Active (visible in catalog)
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subcategories
            </label>
            <p className="text-slate-500 text-xs mb-2">Add subcategory names (e.g. Gloss, Matte)</p>
            <div className="space-y-2">
              {form.subCategories.map((sub, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={sub.name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        subCategories: f.subCategories.map((s, i) =>
                          i === index ? { name: e.target.value } : s
                        ),
                      }))
                    }
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Subcategory name"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        subCategories: f.subCategories.filter((_, i) => i !== index),
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    subCategories: [...f.subCategories, { name: '' }],
                  }))
                }
                className="px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 text-sm"
              >
                + Add subcategory
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <Link
              to="/admin/categories"
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
