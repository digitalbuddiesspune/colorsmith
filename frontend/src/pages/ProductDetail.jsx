import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../api/client';
import { useCart } from '../context/CartContext';

function getGradeId(g) {
  return typeof g === 'object' && g != null ? g._id : g;
}
function getColorId(c) {
  return typeof c === 'object' && c != null ? c._id : c;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Current grade being configured in the UI (all grades remain selectable)
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  // Per-grade selections: { [gradeId]: { colorIds: [], colorQuantities: { [colorId]: qty } } }
  const [selectionsByGrade, setSelectionsByGrade] = useState({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    products
      .get(id)
      .then((res) => setData(res.data?.data ?? res.data))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setSelectedGradeId(null);
    setSelectionsByGrade({});
    setAddedToCart(false);
  }, [id]);

  /* ---------- loading / error ---------- */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        <span className="text-neutral-500 text-sm">Loading product…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
        <Link to="/catalog" className="text-sm font-medium text-neutral-900 hover:underline">← Back to catalog</Link>
      </div>
    );
  }

  const product = data?.product ?? data;
  const gradesRaw = Array.isArray(product?.grades) ? product.grades : [];
  const colorsRaw = Array.isArray(product?.colors) ? product.colors : [];
  const grades = gradesRaw.map((g) => (typeof g === 'object' && g != null ? g : { _id: g, name: '—', price: null }));
  const colors = colorsRaw.map((c) => (typeof c === 'object' && c != null ? c : { _id: c, name: '—', hexCode: '#888' }));
  const minimumOrderQuantity = product?.minimumOrderQuantity ?? 1;

  /* ---------- per-grade selection helpers ---------- */
  const getSelectionForGrade = (gradeId) => selectionsByGrade[gradeId] ?? { colorIds: [], colorQuantities: {} };

  const toggleColor = (colorId) => {
    if (!selectedGradeId) return;
    setAddedToCart(false);
    setSelectionsByGrade((prev) => {
      const sel = prev[selectedGradeId] ?? { colorIds: [], colorQuantities: {} };
      if (sel.colorIds.includes(colorId)) {
        const nextQty = { ...sel.colorQuantities };
        delete nextQty[colorId];
        return {
          ...prev,
          [selectedGradeId]: {
            colorIds: sel.colorIds.filter((cid) => cid !== colorId),
            colorQuantities: nextQty,
          },
        };
      }
      return {
        ...prev,
        [selectedGradeId]: {
          colorIds: [...sel.colorIds, colorId],
          colorQuantities: { ...sel.colorQuantities, [colorId]: minimumOrderQuantity },
        },
      };
    });
  };

  const getColorQty = (gradeId, colorId) => {
    const sel = getSelectionForGrade(gradeId);
    return sel.colorQuantities[colorId] ?? minimumOrderQuantity;
  };

  const updateColorQty = (gradeId, colorId, value) => {
    const p = parseInt(value, 10);
    if (isNaN(p) || p < minimumOrderQuantity) return;
    setAddedToCart(false);
    setSelectionsByGrade((prev) => {
      const sel = prev[gradeId] ?? { colorIds: [], colorQuantities: {} };
      if (!sel.colorIds.includes(colorId)) return prev;
      return {
        ...prev,
        [gradeId]: { ...sel, colorQuantities: { ...sel.colorQuantities, [colorId]: p } },
      };
    });
  };

  const incrementColorQty = (gradeId, colorId) => {
    setAddedToCart(false);
    setSelectionsByGrade((prev) => {
      const sel = prev[gradeId] ?? { colorIds: [], colorQuantities: {} };
      const cur = sel.colorQuantities[colorId] ?? minimumOrderQuantity;
      return {
        ...prev,
        [gradeId]: { ...sel, colorQuantities: { ...sel.colorQuantities, [colorId]: cur + 1 } },
      };
    });
  };

  const decrementColorQty = (gradeId, colorId) => {
    const cur = getColorQty(gradeId, colorId);
    if (cur <= minimumOrderQuantity) return;
    setAddedToCart(false);
    setSelectionsByGrade((prev) => {
      const sel = prev[gradeId] ?? { colorIds: [], colorQuantities: {} };
      return {
        ...prev,
        [gradeId]: { ...sel, colorQuantities: { ...sel.colorQuantities, [colorId]: cur - 1 } },
      };
    });
  };

  const removeColorFromGrade = (gradeId, colorId) => {
    setAddedToCart(false);
    setSelectionsByGrade((prev) => {
      const sel = prev[gradeId] ?? { colorIds: [], colorQuantities: {} };
      const nextQty = { ...sel.colorQuantities };
      delete nextQty[colorId];
      return {
        ...prev,
        [gradeId]: {
          colorIds: sel.colorIds.filter((cid) => cid !== colorId),
          colorQuantities: nextQty,
        },
      };
    });
  };

  // Current grade (for price preview and color UI)
  const selectedGrade = grades.find((g) => getGradeId(g) === selectedGradeId) ?? null;
  const currentSelection = getSelectionForGrade(selectedGradeId);
  const selectedColorIds = currentSelection.colorIds;

  // All grade+color lines for summary and cart (flatten selectionsByGrade)
  const orderLines = [];
  grades.forEach((g) => {
    const gid = getGradeId(g);
    const sel = getSelectionForGrade(gid);
    sel.colorIds.forEach((cid) => {
      const color = colors.find((c) => getColorId(c) === cid);
      if (color) orderLines.push({ grade: g, gradeId: gid, color, colorId: cid, qty: getColorQty(gid, cid) });
    });
  });

  const totalQuantity = orderLines.reduce((sum, line) => sum + line.qty, 0);
  const basePrice = orderLines.length > 0 ? orderLines.reduce((sum, line) => sum + Number(line.grade?.price ?? 0) * line.qty, 0) : null;
  const SGST_RATE = 0.09;
  const CGST_RATE = 0.09;
  const sgstAmount = basePrice != null ? basePrice * SGST_RATE : null;
  const cgstAmount = basePrice != null ? basePrice * CGST_RATE : null;
  const gstAmount = sgstAmount != null && cgstAmount != null ? sgstAmount + cgstAmount : null;
  const totalPrice = basePrice != null && gstAmount != null ? basePrice + gstAmount : null;
  const canAddToCart = orderLines.length > 0 && totalPrice != null;

  const handleAddToCart = async () => {
    if (!canAddToCart || addingToCart) return;
    setAddingToCart(true);
    try {
      for (const line of orderLines) {
        await addItem({
          productId: product._id,
          productName: product?.name ?? '',
          productImage: product?.image ?? null,
          grade: { id: line.gradeId, name: line.grade?.name, price: line.grade?.price },
          colors: [{ id: line.colorId, name: line.color?.name ?? '', hexCode: line.color?.hexCode ?? '#888' }],
          quantity: line.qty,
          unitPrice: line.grade?.price ?? 0,
          totalPrice: Number(line.grade?.price ?? 0) * line.qty,
        });
      }
      setAddedToCart(true);
    } catch {
      setError('Failed to add to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const fmt = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ======================================== JSX ======================================== */
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0 py-8 sm:py-12">
      {/* breadcrumb */}
      <Link to="/catalog" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8 group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to catalog
      </Link>

      {/* ---- hero row ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-12">
        {/* product image */}
        <div className="rounded-2xl bg-white border border-neutral-200 flex items-center justify-center  aspect-square lg:aspect-auto lg:min-h-[420px]">
          {product.image ? (
            <img src={product.image} alt={product.name} className="max-h-[380px] w-auto object-contain rounded-2xl" />
          ) : (
            <div className="text-neutral-300">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            </div>
          )}
        </div>

        {/* product info */}
        <div className="flex flex-col justify-center">
          {product?.category?.name && (
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">{product.category.name}</span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">{product?.name ?? 'Product'}</h1>
          {product?.description && (
            <p className="text-neutral-500 leading-relaxed mb-6">{product.description}</p>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
              {grades.length} grade{grades.length !== 1 && 's'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 10-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94-.19-1.28-.53a1.81 1.81 0 010-2.56l8.47-8.47M15 11.25L12 8.25" /></svg>
              {colors.length} color{colors.length !== 1 && 's'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>
              MOQ {minimumOrderQuantity} kg / color
            </span>
          </div>

          {/* quick price preview */}
          {selectedGrade?.price != null && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">₹{Number(selectedGrade.price)}</span>
              <span className="text-sm text-neutral-400">per kg · excl. GST</span>
            </div>
          )}
        </div>
      </div>

      {/* ---- configure section ---- */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* grades */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h2 className="text-lg font-semibold text-neutral-900">Select grade</h2>
          </div>
          {grades.length ? (
            <div className="space-y-2">
              {grades.map((g) => {
                const gid = getGradeId(g);
                const sel = selectedGradeId === gid;
                return (
                  <button
                    key={gid}
                    type="button"
                    onClick={() => { setSelectedGradeId(gid); }}
                    className={`w-full px-5 py-4 rounded-xl border text-left flex justify-between items-center gap-4 transition-all ${
                      sel
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg shadow-neutral-900/10'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:shadow-sm'
                    }`}
                  >
                    <span className="font-medium text-sm">{g?.name ?? '—'}</span>
                    {g?.price != null && (
                      <span className={`text-sm whitespace-nowrap ${sel ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        ₹{Number(g.price)} / kg
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-neutral-400 text-sm">No grades available.</p>
          )}
        </section>

        {/* colors */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="text-lg font-semibold text-neutral-900">Select colors</h2>
            {selectedGradeId && (
              <span className="text-xs text-neutral-500">(for selected grade)</span>
            )}
          </div>
          {!selectedGradeId ? (
            <p className="text-neutral-400 text-sm">Select a grade above, then choose colors. You can change grade and add different shades for each.</p>
          ) : colors.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {colors.map((c) => {
                const cid = getColorId(c);
                const sel = selectedColorIds.includes(cid);
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => toggleColor(cid)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all ${
                      sel
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/20'
                        : 'border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full shrink-0 border-2 transition-all ${sel ? 'border-neutral-900 scale-110' : 'border-neutral-200'}`}
                      style={{ backgroundColor: c?.hexCode || '#888' }}
                    />
                    <span className="text-sm text-neutral-700 truncate">{c?.name ?? '—'}</span>
                    {sel && (
                      <svg className="w-4 h-4 text-neutral-900 ml-auto shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-neutral-400 text-sm">No colors available.</p>
          )}
        </section>
      </div>

      {/* ---- summary ---- */}
      {orderLines.length > 0 && (
        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 sm:px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
            <h3 className="font-semibold">Order summary</h3>
            <span className="text-sm text-neutral-400">{orderLines.length} shade{orderLines.length !== 1 && 's'} across {Object.keys(selectionsByGrade).filter((gid) => getSelectionForGrade(gid).colorIds.length > 0).length} grade{Object.keys(selectionsByGrade).filter((gid) => getSelectionForGrade(gid).colorIds.length > 0).length !== 1 && 's'}</span>
          </div>

          <div className="divide-y divide-neutral-100">
            {orderLines.map((line) => {
              const { grade, gradeId, color, colorId, qty } = line;
              const sub = grade?.price != null ? Number(grade.price) * qty : 0;
              return (
                <div key={`${gradeId}-${colorId}`} className="flex items-center gap-4 px-5 sm:px-6 py-3.5">
                  <span className="w-8 h-8 rounded-full shrink-0 border border-neutral-200" style={{ backgroundColor: color?.hexCode || '#888' }} />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-neutral-800 block">{color?.name ?? '—'}</span>
                    <span className="text-xs text-neutral-500">{grade?.name ?? '—'}</span>
                  </div>

                  {/* qty controls */}
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => decrementColorQty(gradeId, colorId)} disabled={qty <= minimumOrderQuantity} className="w-8 h-8 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 flex items-center justify-center text-sm font-medium">−</button>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => updateColorQty(gradeId, colorId, e.target.value)}
                      min={minimumOrderQuantity}
                      className="w-16 h-8 rounded-lg border border-neutral-200 text-center text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900"
                    />
                    <button type="button" onClick={() => incrementColorQty(gradeId, colorId)} className="w-8 h-8 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 flex items-center justify-center text-sm font-medium">+</button>
                    <span className="text-xs text-neutral-400 ml-1">kg</span>
                  </div>

                  <span className="ml-auto text-sm font-semibold text-neutral-900 tabular-nums">₹{fmt(sub)}</span>

                  <button type="button" onClick={() => removeColorFromGrade(gradeId, colorId)} className="p-1 text-neutral-300 hover:text-red-500 transition-colors" title="Remove">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* totals */}
          {basePrice != null && (
            <div className="px-5 sm:px-6 py-5 bg-neutral-50 border-t border-neutral-200">
              <div className="flex justify-between text-sm text-neutral-500 mb-1.5">
                <span>Subtotal ({totalQuantity} kg)</span>
                <span className="tabular-nums">₹{fmt(basePrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500 mb-1.5">
                <span>SGST (9%)</span>
                <span className="tabular-nums">₹{fmt(sgstAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-500 mb-3">
                <span>CGST (9%)</span>
                <span className="tabular-nums">₹{fmt(cgstAmount)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-neutral-200">
                <span className="text-base font-semibold text-neutral-900">Total (incl. GST)</span>
                <span className="text-2xl font-bold text-neutral-900 tabular-nums">₹{fmt(totalPrice)}</span>
              </div>
            </div>
          )}

          {/* actions */}
          {canAddToCart && (
            <div className="px-5 sm:px-6 py-4 border-t border-neutral-200 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  addedToCart
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg shadow-neutral-900/10 hover:shadow-xl hover:-translate-y-0.5'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addingToCart ? 'Adding…' : addedToCart ? '✓ Added to cart' : 'Add to cart'}
              </button>
              {addedToCart && (
                <Link to="/cart" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                  View cart →
                </Link>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
