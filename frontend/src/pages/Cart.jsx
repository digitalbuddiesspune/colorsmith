import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { scrollToTop } from '../utility/scrollToTop';

export default function Cart() {
  const { cart, loading, itemCount, subtotal, sgstAmount, cgstAmount, gstAmount, grandTotal, removeItem, updateQuantity, clearCart } = useCart();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-slate-600">
        Loading cart…
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-600 mb-6">Add products from the catalog to get started.</p>
        <Link
          to="/catalog"
          onClick={scrollToTop}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Browse catalog
        </Link>
      </div>
    );
  }

  const fmt = (n) =>
    'Rs' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Cart <span className="text-slate-400 font-normal text-lg">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          Clear cart
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT: Cart items ── */}
        <div className="flex-1 min-w-0 space-y-3">
          {cart.map((item) => {
            const color = item.colors?.[0];
            const moq = item.minimumOrderQuantity ?? 1;
            return (
              <div
                key={item.lineId}
                className="flex flex-wrap gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
              >
                {/* Swatch / image */}
                <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {color?.hexCode ? (
                    <div
                      className="w-9 h-9 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: color.hexCode }}
                    />
                  ) : item.productImage ? (
                    <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200" />
                  )}
                </div>

                {/* Name + grade + color */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.productId}`}
                    onClick={scrollToTop}
                    className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
                  >
                    {item.productName}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    {item.grade && (
                      <span className="text-sm text-slate-500">
                        {item.grade.name} · Rs{Number(item.grade.price).toFixed(2)}/kg
                      </span>
                    )}
                    {color && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-300"
                          style={{ backgroundColor: color.hexCode || '#888' }}
                        />
                        {color.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Qty + price + remove */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineId, item.quantity - moq)}
                      disabled={item.quantity <= moq}
                      className="w-8 h-8 rounded-md border border-slate-300 bg-white text-slate-700 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                    >−</button>
                    <input
                      type="number"
                      min={moq}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.lineId, e.target.value)}
                      className="w-14 h-8 px-1 rounded-md border border-slate-300 text-slate-900 text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineId, item.quantity + moq)}
                      className="w-8 h-8 rounded-md border border-slate-300 bg-white text-slate-700 text-sm hover:bg-slate-50 flex items-center justify-center"
                    >+</button>
                    <span className="text-slate-400 text-xs ml-0.5">kg</span>
                  </div>
                  <span className="font-semibold text-slate-900 w-24 text-right text-sm">
                    {fmt(item.totalPrice)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.lineId)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Continue shopping */}
          <div className="pt-2">
            <Link
              to="/catalog"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue shopping
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Order summary ── */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sticky top-24">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Order Summary</h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-800">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SGST (9%)</span>
                <span className="text-slate-800">{fmt(sgstAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CGST (9%)</span>
                <span className="text-slate-800">{fmt(cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total GST (18%)</span>
                <span>{fmt(gstAmount)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="font-semibold text-slate-900">Grand Total</span>
                <span className="text-xl font-bold text-slate-900">{fmt(grandTotal)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={scrollToTop}
              className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors shadow-sm"
            >
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
