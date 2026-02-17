import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { categories, products, grades, colors, uploadImage } from '../../api/client';

function AddAvailabilityRow({ grades: gradesList, colors: colorsList, onAdd }) {
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
        {gradesList.map((g) => (
          <option key={g._id} value={g._id}>{g.name}</option>
        ))}
      </select>
      <select
        value={colorId}
        onChange={(e) => setColorId(e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm"
      >
        <option value="">Color</option>
        {colorsList.map((c) => (
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

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState([]);
  const [productDetail, setProductDetail] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    image: '',
    isActive: true,
    minimumOrderQuantity: 1,
  });
  const [gradesForProduct, setGradesForProduct] = useState([]);
  const [colorsForProduct, setColorsForProduct] = useState([]);
  const [gradeForm, setGradeForm] = useState({ name: '', price: '' });
  const [colorForm, setColorForm] = useState({ name: '', hexCode: '#000000' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const imageFileInputRef = useRef(null);

  useEffect(() => {
    categories.list().then((res) => {
      const data = res.data;
      setCategoryList(Array.isArray(data) ? data : (data?.data ?? []));
    }).catch(() => setCategoryList([]));
  }, []);

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      setForm({
        name: '',
        category: categoryList[0]?._id || '',
        description: '',
        image: '',
        isActive: true,
        minimumOrderQuantity: 1,
      });
      return;
    }
    setLoading(true);
    Promise.all([
      products.get(id).then(({ data }) => data?.data ?? data),
      grades.list().then((res) => {
        const data = res.data?.data ?? res.data;
        const all = Array.isArray(data) ? data : [];
        return all.filter((g) => {
          const gProductId = g.product && (typeof g.product === 'object' ? g.product._id : g.product);
          return gProductId != null && String(gProductId) === id;
        });
      }),
      colors.list().then((res) => {
        const data = res.data?.data ?? res.data;
        const all = Array.isArray(data) ? data : [];
        return all.filter((c) => {
          const cProductId = c.product && (typeof c.product === 'object' ? c.product._id : c.product);
          return cProductId != null && String(cProductId) === id;
        });
      }),
    ])
      .then(([product, gradesList, colorsList]) => {
        if (product) {
          setProductDetail(product);
          setForm({
            name: product.name || '',
            category: product.category?._id ?? product.category ?? '',
            description: product.description || '',
            image: product.image || '',
            isActive: product.isActive !== false,
            minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
          });
        } else {
          setError('Product not found');
        }
        setGradesForProduct(gradesList);
        setColorsForProduct(colorsList);
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    if (form.category === '' && categoryList.length > 0) {
      setForm((f) => ({ ...f, category: categoryList[0]._id }));
    }
  }, [categoryList]);

  const refreshProductDetail = (productId) => {
    if (productId !== (createdId || id)) return;
    products.get(productId).then(({ data }) => setProductDetail(data?.data ?? data)).catch(() => {});
  };

  const loadGradesAndColors = (productId) => {
    const productIdStr = String(productId);
    grades.list().then((res) => {
      const data = res.data?.data ?? res.data;
      const all = Array.isArray(data) ? data : [];
      setGradesForProduct(all.filter((g) => {
        const gProductId = g.product && (typeof g.product === 'object' ? g.product._id : g.product);
        return gProductId != null && String(gProductId) === productIdStr;
      }));
    }).catch(() => {});
    colors.list().then((res) => {
      const data = res.data?.data ?? res.data;
      const all = Array.isArray(data) ? data : [];
      setColorsForProduct(all.filter((c) => {
        const cProductId = c.product && (typeof c.product === 'object' ? c.product._id : c.product);
        return cProductId != null && String(cProductId) === productIdStr;
      }));
    }).catch(() => {});
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
    setSaving(true);
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
      const newId = created?._id ?? created?.id;
      if (newId) {
        setCreatedId(newId);
        setProductDetail(created);
        loadGradesAndColors(newId);
      } else {
        navigate('/admin/products');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = async () => {
    if (!isEdit) return;
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
    setSaving(true);
    try {
      await products.update(id, {
        name: form.name.trim(),
        category: form.category,
        description: form.description?.trim() || undefined,
        image: form.image.trim(),
        isActive: form.isActive,
        grades: productDetail?.grades ?? [],
        colors: productDetail?.colors ?? [],
        minimumOrderQuantity: moq,
      });
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
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
      loadGradesAndColors(productId);
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
      loadGradesAndColors(productId);
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

  const productId = createdId || id;
  const showGradesColors = (isEdit && productDetail) || createdId;

  if (loading) {
    return (
      <div className="text-slate-600">Loading product…</div>
    );
  }

  if (isEdit && error === 'Product not found') {
    return (
      <div>
        <p className="text-red-600 mb-4">Product not found.</p>
        <Link to="/admin/products" className="text-amber-600 hover:underline">Back to Products</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </Link>
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? 'Edit product' : createdId ? 'Add grades, colors & availability' : 'New product'}
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {(isEdit || !createdId) && (
        <div className="mb-6 p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
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
                <p className="mt-1 text-xs text-amber-600">Add categories first in Admin → Categories.</p>
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
              <label className="block text-sm text-slate-700 mb-1">Image *</label>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={imageFileInputRef}
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
                        if (imageFileInputRef.current) imageFileInputRef.current.value = '';
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={imageUploading}
                    onClick={() => imageFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
                  >
                    {imageUploading ? 'Uploading…' : 'Upload from device'}
                  </button>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: '' }))}
                      className="text-xs text-slate-500 hover:text-red-600 underline"
                    >
                      Clear image
                    </button>
                  )}
                  <span className="text-xs text-slate-500">JPEG, PNG, GIF or WebP (max 5 MB)</span>
                </div>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-900"
                  placeholder="Or paste image URL"
                />
                {form.image && (
                  <img src={form.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-slate-200" />
                )}
              </div>
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
              <label htmlFor="productIsActive" className="text-sm text-slate-700">Active (visible in catalog)</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {isEdit ? (
              <>
                <button type="button" onClick={updateProduct} disabled={saving} className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Update'}
                </button>
                <Link to="/admin/products" className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium inline-block">Cancel</Link>
              </>
            ) : !createdId ? (
              <>
                <button type="button" onClick={createProduct} disabled={saving} className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50">
                  {saving ? 'Creating…' : 'Create'}
                </button>
                <Link to="/admin/products" className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium inline-block">Cancel</Link>
              </>
            ) : null}
          </div>
        </div>
      )}

      {showGradesColors && productDetail && (
        <div className="mt-6 p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-6">
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
                <button type="button" onClick={() => addGradeForProduct(productId)} className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm hover:bg-amber-200">Add grade</button>
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
                <button type="button" onClick={() => addColorForProduct(productId)} className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm hover:bg-amber-200">Add color</button>
              </div>
            </section>
          </div>
          <section>
            <h5 className="text-xs font-medium text-slate-500 mb-2">Availability (Grade × Color)</h5>
            <AddAvailabilityRow
              grades={gradesForProduct}
              colors={colorsForProduct}
              onAdd={(gradeId, colorId, status) => addAvailability(productId, gradeId, colorId, status)}
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
          {createdId && (
            <div className="pt-4">
              <Link to="/admin/products" className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 inline-block">Done</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
