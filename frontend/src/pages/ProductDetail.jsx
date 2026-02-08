import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../api/client';
import { useCart } from '../context/CartContext';

const statusLabels = { available: 'Available', out_of_stock: 'Out of stock', discontinued: 'Discontinued' };
const statusClass = {
  available: 'bg-emerald-100 text-emerald-800',
  out_of_stock: 'bg-amber-100 text-amber-800',
  discontinued: 'bg-slate-200 text-slate-600',
};

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
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedColorIds, setSelectedColorIds] = useState([]);
  // Per-color quantity map: { colorId: quantity }
  const [colorQuantities, setColorQuantities] = useState({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCart();

  // Fetch product data
  useEffect(() => {
    products
      .get(id)
      .then((res) => setData(res.data?.data ?? res.data))
      .catch(() => setError('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Reset selection when navigating to a different product
  useEffect(() => {
    setSelectedGradeId(null);
    setSelectedColorIds([]);
    setColorQuantities({});
    setAddedToCart(false);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-red-600">
        {error || 'Product not found'}
        <Link to="/catalog" className="block mt-4 text-brand-600 hover:underline">Back to catalog</Link>
      </div>
    );
  }

  const product = data?.product ?? data;
  const gradesRaw = Array.isArray(product?.grades) ? product.grades : [];
  const colorsRaw = Array.isArray(product?.colors) ? product.colors : [];

  // Normalize to objects with _id, name, price/hexCode so selection works
  const grades = gradesRaw.map((g) => (typeof g === 'object' && g != null ? g : { _id: g, name: '—', price: null }));
  const colors = colorsRaw.map((c) => (typeof c === 'object' && c != null ? c : { _id: c, name: '—', hexCode: '#888' }));

  const minimumOrderQuantity = product?.minimumOrderQuantity ?? 1;

  const toggleColor = (colorId) => {
    setAddedToCart(false);
    setSelectedColorIds((prev) => {
      if (prev.includes(colorId)) {
        // Remove color and its quantity
        setColorQuantities((q) => {
          const next = { ...q };
          delete next[colorId];
          return next;
        });
        return prev.filter((cid) => cid !== colorId);
      } else {
        // Add color with minimum quantity
        setColorQuantities((q) => ({ ...q, [colorId]: minimumOrderQuantity }));
        return [...prev, colorId];
      }
    });
  };

  const getColorQty = (colorId) => colorQuantities[colorId] ?? minimumOrderQuantity;

  const updateColorQty = (colorId, value) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= minimumOrderQuantity) {
      setColorQuantities((q) => ({ ...q, [colorId]: parsed }));
      setAddedToCart(false);
    }
  };

  const incrementColorQty = (colorId) => {
    setColorQuantities((q) => ({ ...q, [colorId]: (q[colorId] ?? minimumOrderQuantity) + 1 }));
    setAddedToCart(false);
  };

  const decrementColorQty = (colorId) => {
    const current = colorQuantities[colorId] ?? minimumOrderQuantity;
    if (current > minimumOrderQuantity) {
      setColorQuantities((q) => ({ ...q, [colorId]: current - 1 }));
      setAddedToCart(false);
    }
  };

  const selectedGrade = grades.find((g) => getGradeId(g) === selectedGradeId);
  const selectedColors = colors.filter((c) => selectedColorIds.includes(getColorId(c)));

  // Calculate totals from per-color quantities
  const totalQuantity = selectedColors.reduce((sum, c) => sum + getColorQty(getColorId(c)), 0);
  const basePrice =
    selectedGrade?.price != null && totalQuantity > 0
      ? Number(selectedGrade.price) * totalQuantity
      : null;

  // GST calculation
  const SGST_RATE = 0.09;
  const CGST_RATE = 0.09;
  const sgstAmount = basePrice != null ? basePrice * SGST_RATE : null;
  const cgstAmount = basePrice != null ? basePrice * CGST_RATE : null;
  const gstAmount = sgstAmount != null && cgstAmount != null ? sgstAmount + cgstAmount : null;
  const totalPrice = basePrice != null && gstAmount != null ? basePrice + gstAmount : null;
  const canAddToCart = selectedGrade && selectedColors.length > 0 && totalPrice != null;

  // Add each color as a separate cart line item
  const handleAddToCart = async () => {
    if (!canAddToCart || addingToCart) return;
    setAddingToCart(true);
    try {
      for (const color of selectedColors) {
        const cid = getColorId(color);
        const qty = getColorQty(cid);
        const colorPrice = Number(selectedGrade.price) * qty;
        await addItem({
          productId: product._id,
          productName: product?.name ?? '',
          productImage: product?.image ?? null,
          grade: { id: getGradeId(selectedGrade), name: selectedGrade.name, price: selectedGrade.price },
          colors: [{ id: cid, name: color?.name ?? '', hexCode: color?.hexCode ?? '#888' }],
          quantity: qty,
          unitPrice: selectedGrade?.price ?? 0,
          totalPrice: colorPrice,
        });
      }
      setAddedToCart(true);
    } catch (err) {
      setError('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/catalog" className="text-slate-600 hover:text-slate-900 text-sm mb-6 inline-block">
        ← Back to catalog
      </Link>
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-slate-900 mb-1">{product?.name ?? 'Product'}</h1>
        <p className="text-slate-600">{product?.category?.name ?? ''}</p>
        <p className="text-slate-600 mt-1">
          Minimum order quantity per color: <span className="font-medium text-slate-800">{minimumOrderQuantity}</span> kg
        </p>
        {product?.description && (
          <p className="text-slate-600 mt-2">{product.description}</p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-medium text-slate-900 mb-2">Choose grade (one)</h2>
          <p className="text-slate-600 text-sm mb-4">Select a single grade for this product.</p>
          {grades.length ? (
            <ul className="space-y-2">
              {grades.map((g) => {
                const gid = getGradeId(g);
                const isSelected = selectedGradeId === gid;
                return (
                  <li key={gid}>
                    <button
                      type="button"
                      onClick={() => { setSelectedGradeId(gid); setAddedToCart(false); }}
                      className={`w-full px-4 py-3 rounded-lg border text-left flex justify-between items-center transition-colors ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-slate-900 ring-2 ring-amber-500/30'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-slate-700 text-xs lg:text-sm">{g?.name ?? '—'}</span>
                      {g?.price != null && (
                        <span className="text-slate-600 text-xs lg:text-sm">Rs{Number(g.price)} / KG <span className="text-slate-400">(excl. GST)</span></span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-slate-600">No grades defined for this product.</p>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium text-slate-900 mb-2">Choose colors (multiple)</h2>
          <p className="text-slate-600 text-sm mb-4">Select one or more colors. You can set quantity for each color individually.</p>
          {colors.length ? (
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => {
                const cid = getColorId(c);
                const isSelected = selectedColorIds.includes(cid);
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => toggleColor(cid)}
                    title={c?.hexCode}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: c?.hexCode || '#888' }}
                    />
                    <span className="text-slate-700 text-sm">{c?.name ?? '—'}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-600">No colors defined for this product.</p>
          )}
        </section>
      </div>

      {/* Selection Summary with Per-Color Quantity Controls */}
      {selectedGrade && selectedColors.length > 0 && (
        <section className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Your selection</h3>

          <div className="mb-3">
            <span className="text-slate-600 text-sm">Grade: </span>
            <span className="font-medium text-slate-800">{selectedGrade.name}</span>
            {selectedGrade.price != null && (
              <span className="text-slate-600 text-sm ml-1">(Rs{Number(selectedGrade.price).toFixed(2)} / kg)</span>
            )}
          </div>

          {/* Per-color quantity table */}
          <div className="space-y-2">
            {selectedColors.map((c) => {
              const cid = getColorId(c);
              const qty = getColorQty(cid);
              const colorSubtotal = selectedGrade?.price != null ? Number(selectedGrade.price) * qty : 0;
              return (
                <div
                  key={cid}
                  className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-3 py-2"
                >
                  {/* Color swatch + name */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span
                      className="w-5 h-5 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: c?.hexCode || '#888' }}
                    />
                    <span className="text-sm font-medium text-slate-800">{c?.name ?? '—'}</span>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => decrementColorQty(cid)}
                      disabled={qty <= minimumOrderQuantity}
                      className="w-8 h-8 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => updateColorQty(cid, e.target.value)}
                      min={minimumOrderQuantity}
                      className="w-20 h-8 px-2 rounded-md border border-slate-300 text-center text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => incrementColorQty(cid)}
                      className="w-8 h-8 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-slate-500 text-xs ml-1">kg</span>
                  </div>

                  {/* Subtotal for this color */}
                  <div className="ml-auto text-right">
                    <span className="text-sm font-medium text-slate-800">
                      Rs{colorSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Remove this color */}
                  <button
                    type="button"
                    onClick={() => toggleColor(cid)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                    title="Remove color"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Price Breakdown */}
          {basePrice != null && (
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-1 bg-white rounded-lg p-3 border border-slate-100">
              <p className="text-slate-600 text-sm">
                Total quantity: <span className="font-medium text-slate-800">{totalQuantity} kg</span>
                <span className="text-slate-400 ml-1">({selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''})</span>
              </p>
              <p className="text-slate-600 text-sm">
                Subtotal: <span className="font-medium text-slate-800">Rs{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>
              <p className="text-slate-600 text-sm">
                SGST (9%): <span className="font-medium text-slate-800">Rs{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>
              <p className="text-slate-600 text-sm">
                CGST (9%): <span className="font-medium text-slate-800">Rs{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>
              <p className="text-slate-500 text-xs">
                Total GST (18%): <span className="font-medium text-slate-600">Rs{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>
              <p className="text-slate-700 text-sm font-medium pt-2 border-t border-slate-100">
                Total (incl. GST): <span className="text-lg font-semibold text-slate-900">Rs{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </p>
            </div>
          )}

          {canAddToCart && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {addingToCart ? 'Adding…' : addedToCart ? 'Added to cart' : 'Add to cart'}
              </button>
              {addedToCart && (
                <Link to="/cart" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
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
