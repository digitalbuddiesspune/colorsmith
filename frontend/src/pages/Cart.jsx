import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

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
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-slate-600 hover:text-red-600"
        >
          Clear cart
        </button>
      </div>

      <div className="space-y-4">
        {cart.map((item) => {
          const color = item.colors?.[0];
          return (
            <div
              key={item.lineId}
              className="flex flex-wrap gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
            >
              {/* Color swatch or product image */}
              <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                {color?.hexCode ? (
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: color.hexCode }}
                  />
                ) : item.productImage ? (
                  <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.productId}`} className="font-medium text-slate-900 hover:text-amber-600">
                  {item.productName}
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  {item.grade && (
                    <span className="text-sm text-slate-600">
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

              {/* Quantity + Price + Remove */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.lineId, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.lineId, e.target.value)}
                    className="w-16 h-8 px-2 rounded-md border border-slate-300 text-slate-900 text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                    className="w-8 h-8 rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-slate-400 text-xs ml-0.5">kg</span>
                </div>
                <span className="font-medium text-slate-900 w-28 text-right">
                  Rs{Number(item.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.lineId)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Remove"
                  aria-label="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <Link to="/catalog" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
            ← Continue shopping
          </Link>
          <div className="text-right space-y-1">
            <div className="flex justify-between gap-6 text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="text-slate-800">
                Rs{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-6 text-sm">
              <span className="text-slate-600">SGST (9%):</span>
              <span className="text-slate-800">
                Rs{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-6 text-sm">
              <span className="text-slate-600">CGST (9%):</span>
              <span className="text-slate-800">
                Rs{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-6 text-sm text-slate-500">
              <span>Total GST (18%):</span>
              <span>
                Rs{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-6 pt-2 border-t border-slate-200">
              <span className="text-slate-700 font-medium">Grand Total:</span>
              <span className="text-xl font-semibold text-slate-900">
                Rs{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Link
            to="/checkout"
            className="px-5 py-2.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
