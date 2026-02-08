import { useEffect, useState } from 'react';
import { categories, products, grades, colors } from '../../api/client';

function AddAvailabilityRow({ grades, colors, onAdd }) {
  const [gradeId, setGradeId] = useState('');
  const [colorId, setColorId] = useState('');
  const [status, setStatus] = useState('available');
  const canAdd = gradeId && colorId;
  return (
    <div className="flex flex-wrap items-end gap-2 mb-2">
      <select
        value={gradeId}
        onChange={(e) => setGradeId(e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm"
      >
        <option value="">Grade</option>
        {grades.map((g) => (
          <option key={g._id} value={g._id}>{g.name}</option>
        ))}
      </select>
      <select
        value={colorId}
        onChange={(e) => setColorId(e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm"
      >
        <option value="">Color</option>
        {colors.map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm"
      >
        <option value="available">Available</option>
        <option value="out_of_stock">Out of stock</option>
        <option value="discontinued">Discontinued</option>
      </select>
      <button
        type="button"
        disabled={!canAdd}
        onClick={() => { onAdd(gradeId, colorId, status); setGradeId(''); setColorId(''); }}
        className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm hover:bg-amber-200 disabled:opacity-50"
      >
        Add
      </button>
    </div>
  );
}

export default function AdminProducts() {
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDetail, setProductDetail] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState(null);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    image: '',
    isActive: true,
    minimumOrderQuantity: 1,
  });
  const [error, setError] = useState('');
  const [gradesForProduct, setGradesForProduct] = useState([]);
  const [gradeForm, setGradeForm] = useState({ name: '', price: '' });
  const [colorsForProduct, setColorsForProduct] = useState([]);
  const [colorForm, setColorForm] = useState({ name: '', hexCode: '#000000' });

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

  const detailProductId = editingId || newlyCreatedId;
  useEffect(() => {
    if (!detailProductId) {
      setProductDetail(null);
      setGradesForProduct([]);
      setColorsForProduct([]);
      return;
    }
    products
      .get(detailProductId)
      .then(({ data }) => setProductDetail(data?.data ?? data))
      .catch(() => setProductDetail(null));
    grades
      .list()
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const all = Array.isArray(data) ? data : [];
        const productIdStr = detailProductId ? String(detailProductId) : '';
        const filtered = all.filter((g) => {
          const gProductId = g.product && (typeof g.product === 'object' ? g.product._id : g.product);
          return gProductId != null && String(gProductId) === productIdStr;
        });
        setGradesForProduct(filtered);
      })
      .catch(() => setGradesForProduct([]));
    colors
      .list()
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const all = Array.isArray(data) ? data : [];
        const productIdStr = detailProductId ? String(detailProductId) : '';
        const filtered = all.filter((c) => {
          const cProductId = c.product && (typeof c.product === 'object' ? c.product._id : c.product);
          return cProductId != null && String(cProductId) === productIdStr;
        });
        setColorsForProduct(filtered);
      })
      .catch(() => setColorsForProduct([]));
  }, [detailProductId]);

  const openCreate = () => {
    setForm({
      name: '',
      category: categoryList[0]?._id || '',
      description: '',
      image: '',
      isActive: true,
      minimumOrderQuantity: 1,
    });
    setAddFormOpen(true);
    setNewlyCreatedId(null);
    setProductDetail(null);
    setError('');
  };
  const closeAddForm = () => {
    setAddFormOpen(false);
    setNewlyCreatedId(null);
    setProductDetail(null);
  };

  const createProduct = async () => {
    if (!form.name?.trim() || !form.category || !form.image?.trim()) {
      setError('Name, category and image are required.');
      return;
    }
    const moq = Number(form.minimumOrderQuantity);
    if (!Number.isInteger(moq) || moq < 1) {
      setError('Minimum order quantity must be a positive integer.');
      return;
    }
    setError('');
    try {
      const res = await products.create({
        name: form.name.trim(),
        category: form.category,
        description: form.description?.trim() || undefined,
        image: form.image.trim(),
        isActive: form.isActive,
        grades: [],
        colors: [],
        minimumOrderQuantity: moq,
      });
      const created = res.data?.data ?? res.data;
      const id = created?._id ?? created?.id;
      if (id) {
        setNewlyCreatedId(id);
        load();
      } else {
        load();
        closeAddForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const refreshProductDetail = (productId) => {
    if (productId !== detailProductId) return;
    products.get(productId).then(({ data }) => setProductDetail(data?.data ?? data)).catch(() => {});
  };

  const addGradeForProduct = async (productId) => {
    if (!gradeForm.name?.trim()) {
      setError('Grade name is required.');
      return;
    }
    const price = Number(gradeForm.price);
    if (Number.isNaN(price) || price < 0) {
      setError('Price must be a valid number.');
      return;
    }
    setError('');
    try {
      await grades.create({
        product: productId,
        name: gradeForm.name.trim(),
        price,
        isActive: true,
      });
      setGradeForm({ name: '', price: '' });
      const productIdStr = productId ? String(productId) : '';
      grades.list().then((res) => {
        const data = res.data?.data ?? res.data;
        const all = Array.isArray(data) ? data : [];
        const filtered = all.filter((g) => {
          const gProductId = g.product && (typeof g.product === 'object' ? g.product._id : g.product);
          return gProductId != null && String(gProductId) === productIdStr;
        });
        setGradesForProduct(filtered);
      });
      refreshProductDetail(productId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const addColorForProduct = async (productId) => {
    if (!colorForm.name?.trim()) {
      setError('Color name is required.');
      return;
    }
    const hex = (colorForm.hexCode || '#000000').trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setError('Hex code must be like #FF5733 (6 hex digits).');
      return;
    }
    setError('');
    try {
      await colors.create({
        product: productId,
        name: colorForm.name.trim(),
        hexCode: hex,
      });
      setColorForm({ name: '', hexCode: '#000000' });
      const productIdStr = productId ? String(productId) : '';
      colors.list().then((res) => {
        const data = res.data?.data ?? res.data;
        const all = Array.isArray(data) ? data : [];
        const filtered = all.filter((c) => {
          const cProductId = c.product && (typeof c.product === 'object' ? c.product._id : c.product);
          return cProductId != null && String(cProductId) === productIdStr;
        });
        setColorsForProduct(filtered);
      });
      refreshProductDetail(productId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const addAvailability = async (productId, gradeId, colorId, status = 'available') => {
    try {
      await products.availability(productId).create({ grade: gradeId, color: colorId, status });
      refreshProductDetail(productId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return '—';
    const cat = categoryList.find((c) => c._id === categoryId);
    return cat?.name ?? categoryId;
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || '',
      category: p.category?._id ?? p.category ?? '',
      description: p.description || '',
      image: p.image || '',
      isActive: p.isActive !== false,
      minimumOrderQuantity: p.minimumOrderQuantity ?? 1,
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const updateProduct = async () => {
    if (!editingId) return;
    if (!form.name?.trim() || !form.category || !form.image?.trim()) {
      setError('Name, category and image are required.');
      return;
    }
    const moq = Number(form.minimumOrderQuantity);
    if (!Number.isInteger(moq) || moq < 1) {
      setError('Minimum order quantity must be a positive integer.');
      return;
    }
    setError('');
    try {
      await products.update(editingId, {
        name: form.name.trim(),
        category: form.category,
        description: form.description?.trim() || undefined,
        image: form.image.trim(),
        isActive: form.isActive,
        grades: productList.find((x) => x._id === editingId)?.grades ?? [],
        colors: productList.find((x) => x._id === editingId)?.colors ?? [],
        minimumOrderQuantity: moq,
      });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setError('');
    try {
      await products.delete(id);
      if (editingId === id) setEditingId(null);
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
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Add product
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {addFormOpen && (
        <div className="mb-6 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
          <h3 className="text-slate-900 font-medium mb-4">{newlyCreatedId ? 'Add grades, colors & availability' : 'New product'}</h3>
          {!newlyCreatedId && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
                placeholder="e.g. Nail lacquers"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
              >
                <option value="">Select category</option>
                {categoryList.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {categoryList.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">No categories yet. Add categories in Admin → Categories first.</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
                placeholder="Optional"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-700 mb-1">Image URL *</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Minimum order quantity *</label>
              <input
                type="number"
                min={1}
                value={form.minimumOrderQuantity}
                onChange={(e) => setForm((f) => ({ ...f, minimumOrderQuantity: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2 sm:items-end">
              <input
                type="checkbox"
                id="productIsActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="productIsActive" className="text-sm text-slate-700">
                Active (visible in catalog)
              </label>
            </div>
          </div>
          )}
          {newlyCreatedId && productDetail && productDetail._id === newlyCreatedId ? (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
              <div className="flex gap-4 flex-wrap">
                <section className="min-w-[280px]">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Grades</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {gradesForProduct.map((g) => (
                      <span key={g._id} className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-sm">
                        {g.name} {g.price != null && <span className="text-slate-500">({g.price})</span>}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <input
                      type="text"
                      value={gradeForm.name}
                      onChange={(e) => setGradeForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Grade name"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-sm w-32"
                    />
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={gradeForm.price}
                      onChange={(e) => setGradeForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="Price"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-sm w-24"
                    />
                    <button
                      type="button"
                      onClick={() => addGradeForProduct(newlyCreatedId)}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm hover:bg-amber-200"
                    >
                      Add grade
                    </button>
                  </div>
                </section>
                <section className="min-w-[280px]">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Colors</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {colorsForProduct.map((c) => (
                      <span key={c._id} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-sm">
                        <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: c.hexCode || '#888' }} />
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <input
                      type="text"
                      value={colorForm.name}
                      onChange={(e) => setColorForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Color name"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-sm w-28"
                    />
                    <input
                      type="text"
                      value={colorForm.hexCode}
                      onChange={(e) => setColorForm((f) => ({ ...f, hexCode: e.target.value }))}
                      placeholder="#000000"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-sm w-24 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => addColorForProduct(newlyCreatedId)}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm hover:bg-amber-200"
                    >
                      Add color
                    </button>
                  </div>
                </section>
              </div>
              <section>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Availability (Grade × Color)</h4>
                <AddAvailabilityRow
                  grades={gradesForProduct}
                  colors={colorsForProduct}
                  onAdd={(gradeId, colorId, status) => addAvailability(newlyCreatedId, gradeId, colorId, status)}
                />
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-600 text-left">
                        <th className="px-2 py-1">Grade</th>
                        <th className="px-2 py-1">Color</th>
                        <th className="px-2 py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(productDetail.availability || []).map((a) => (
                        <tr key={a._id}>
                          <td className="px-2 py-1 text-slate-700">{a.grade?.name}</td>
                          <td className="px-2 py-1 text-slate-700">{a.color?.name}</td>
                          <td className="px-2 py-1">{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : null}
          <div className="flex gap-2 mt-4">
            {newlyCreatedId ? (
              <button type="button" onClick={closeAddForm} className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600">Done</button>
            ) : (
              <>
                <button type="button" onClick={createProduct} className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600">Create</button>
                <button type="button" onClick={closeAddForm} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>
              </>
            )}
          </div>
        </div>
      )}

      {editingId && (
        <div className="mb-6 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
          <h3 className="text-slate-900 font-medium mb-4">Edit product</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
                placeholder="e.g. Nail lacquers"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
              >
                <option value="">Select category</option>
                {categoryList.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
                placeholder="Optional"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-slate-700 mb-1">Image URL *</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Minimum order quantity *</label>
              <input
                type="number"
                min={1}
                value={form.minimumOrderQuantity}
                onChange={(e) => setForm((f) => ({ ...f, minimumOrderQuantity: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2 sm:items-end">
              <input
                type="checkbox"
                id="editProductIsActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="editProductIsActive" className="text-sm text-slate-700">
                Active (visible in catalog)
              </label>
            </div>
          </div>
          {productDetail && productDetail._id === editingId && (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
              <h4 className="text-sm font-medium text-slate-700">Grades, colors & availability</h4>
              <div className="flex gap-4 flex-wrap">
                <section className="min-w-[280px]">
                  <h5 className="text-xs font-medium text-slate-500 mb-2">Grades</h5>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {gradesForProduct.map((g) => (
                      <span key={g._id} className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-sm">
                        {g.name} {g.price != null && <span className="text-slate-500">({g.price})</span>}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <input
                      type="text"
                      value={gradeForm.name}
                      onChange={(e) => setGradeForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Grade name"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-sm w-32"
                    />
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={gradeForm.price}
                      onChange={(e) => setGradeForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="Price"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-sm w-24"
                    />
                    <button
                      type="button"
                      onClick={() => addGradeForProduct(editingId)}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm hover:bg-amber-200"
                    >
                      Add grade
                    </button>
                  </div>
                </section>
                <section className="min-w-[280px]">
                  <h5 className="text-xs font-medium text-slate-500 mb-2">Colors</h5>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {colorsForProduct.map((c) => (
                      <span key={c._id} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-sm">
                        <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: c.hexCode || '#888' }} />
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <input
                      type="text"
                      value={colorForm.name}
                      onChange={(e) => setColorForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Color name"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-sm w-28"
                    />
                    <input
                      type="text"
                      value={colorForm.hexCode}
                      onChange={(e) => setColorForm((f) => ({ ...f, hexCode: e.target.value }))}
                      placeholder="#000000"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 text-sm w-24 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => addColorForProduct(editingId)}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm hover:bg-amber-200"
                    >
                      Add color
                    </button>
                  </div>
                </section>
              </div>
              <section>
                <h5 className="text-xs font-medium text-slate-500 mb-2">Availability (Grade × Color)</h5>
                <AddAvailabilityRow
                  grades={gradesForProduct}
                  colors={colorsForProduct}
                  onAdd={(gradeId, colorId, status) => addAvailability(editingId, gradeId, colorId, status)}
                />
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-600 text-left">
                        <th className="px-2 py-1">Grade</th>
                        <th className="px-2 py-1">Color</th>
                        <th className="px-2 py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(productDetail.availability || []).map((a) => (
                        <tr key={a._id}>
                          <td className="px-2 py-1 text-slate-700">{a.grade?.name}</td>
                          <td className="px-2 py-1 text-slate-700">{a.color?.name}</td>
                          <td className="px-2 py-1">{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={updateProduct} className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600">Update</button>
            <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300">Cancel</button>
          </div>
        </div>
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
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="text-amber-600 hover:underline font-medium mr-3"
                  >
                    Edit
                  </button>
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
