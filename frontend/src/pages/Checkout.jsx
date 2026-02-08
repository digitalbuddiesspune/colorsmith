import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { address as addressApi, orders as ordersApi } from '../api/client';

const emptyForm = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'India',
  phone: '',
};

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { cart, loading: cartLoading, subtotal, sgstAmount, cgstAmount, gstAmount, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [user, navigate]);

  // Fetch addresses
  useEffect(() => {
    if (!user) return;
    addressApi
      .list()
      .then((res) => {
        const list = res.data?.addresses ?? res.data?.data ?? [];
        setAddresses(list);
        // Auto-select default or first address
        const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      })
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.state || !form.zip || !form.phone) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const res = await addressApi.create(form);
      const newAddr = res.data?.address ?? res.data?.data ?? res.data;
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddressId(newAddr._id);
      setShowAddForm(false);
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  // Handle placing order with COD
  const handlePlaceOrderCOD = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }
    setError('');
    setPlacingOrder(true);
    try {
      const orderData = {
        items: cart,
        shippingAddress: {
          name: selectedAddress.name || '',
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: selectedAddress.country || 'India',
          phone: selectedAddress.phone,
        },
        subtotal,
        sgstAmount,
        cgstAmount,
        gstAmount,
        grandTotal,
        paymentMethod: 'COD',
      };

      const res = await ordersApi.create(orderData);
      await clearCart();
      navigate(`/order-confirmation/${res.data.order._id}`, { 
        state: { order: res.data.order } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Handle placing order with Razorpay
  const handlePlaceOrderRazorpay = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }
    setError('');
    setPlacingOrder(true);

    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setPlacingOrder(false);
        return;
      }

      // Create Razorpay order
      const { data: razorpayOrder } = await ordersApi.createRazorpayOrder(grandTotal);

      // Open Razorpay checkout
      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Color Smith',
        description: 'Order Payment',
        order_id: razorpayOrder.orderId,
        handler: async function (response) {
          try {
            // Create order with payment details
            const orderData = {
              items: cart,
              shippingAddress: {
                name: selectedAddress.name || '',
                address: selectedAddress.address,
                city: selectedAddress.city,
                state: selectedAddress.state,
                zip: selectedAddress.zip,
                country: selectedAddress.country || 'India',
                phone: selectedAddress.phone,
              },
              subtotal,
              sgstAmount,
              cgstAmount,
              gstAmount,
              grandTotal,
              paymentMethod: 'Razorpay',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            const res = await ordersApi.create(orderData);
            await clearCart();
            navigate(`/order-confirmation/${res.data.order._id}`, { 
              state: { order: res.data.order } 
            });
          } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete order. Please contact support.');
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: selectedAddress.phone || '',
        },
        theme: {
          color: '#F59E0B',
        },
        modal: {
          ondismiss: function () {
            setPlacingOrder(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setPlacingOrder(false);
      });
      razorpayInstance.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setPlacingOrder(false);
    }
  };

  // Handle place order based on selected payment method
  const handlePlaceOrder = () => {
    if (paymentMethod === 'COD') {
      handlePlaceOrderCOD();
    } else {
      handlePlaceOrderRazorpay();
    }
  };

  if (cartLoading || loadingAddresses) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-600 mb-6">Add products before checkout.</p>
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
      <h1 className="text-2xl font-semibold text-slate-900 mb-8">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Address Section */}
        <section className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-medium text-slate-900">Delivery Address</h2>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {addresses.length > 0 && !showAddForm && (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedAddressId === addr._id
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr._id}
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                    className="mt-1 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="flex-1 text-sm">
                    <p className="text-slate-900 font-medium">{addr.name}</p>
                    <p className="text-slate-600">{addr.address}</p>
                    <p className="text-slate-600">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                    <p className="text-slate-600">{addr.country}</p>
                    <p className="text-slate-600 mt-1">Phone: {addr.phone}</p>
                    {addr.isDefault && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                        Default
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              + Add new address
            </button>
          )}

          {showAddForm && (
            <form onSubmit={handleAddAddress} className="p-4 rounded-xl bg-white border border-slate-200 space-y-4">
              <h3 className="font-medium text-slate-900">Add Address</h3>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm"
                  placeholder="Recipient full name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm"
                  placeholder="House no., Street, Area"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm"
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={form.zip}
                    onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm"
                    placeholder="6-digit PIN"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm"
                    placeholder="Country"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm"
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setForm(emptyForm);
                    setError('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Order Summary */}
        <aside className="lg:col-span-2">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm sticky top-24">
            <h2 className="font-medium text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {cart.map((item) => (
                <div key={item.lineId} className="flex justify-between gap-2">
                  <span className="text-slate-600 truncate">{item.productName}</span>
                  <span className="text-slate-900 shrink-0">
                    Rs{Number(item.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-800">
                  Rs{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">SGST (9%)</span>
                <span className="text-slate-800">
                  Rs{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">CGST (9%)</span>
                <span className="text-slate-800">
                  Rs{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Total GST (18%)</span>
                <span>
                  Rs{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium pt-2 border-t border-slate-100">
                <span className="text-slate-700">Total</span>
                <span className="text-slate-900">
                  Rs{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {selectedAddress && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 text-xs text-slate-600">
                <span className="font-medium text-slate-700">Deliver to:</span>
                {selectedAddress.name && <p className="mt-1 font-medium text-slate-800">{selectedAddress.name}</p>}
                <p className={selectedAddress.name ? '' : 'mt-1'}>{selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}</p>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3 text-sm">Payment Method</h3>
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === 'COD'
                      ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-900">Cash on Delivery</span>
                    <p className="text-xs text-slate-500 mt-0.5">Pay when you receive your order</p>
                  </div>
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === 'Razorpay'
                      ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-900">Pay Online</span>
                    <p className="text-xs text-slate-500 mt-0.5">Cards, UPI, Net Banking, Wallets</p>
                  </div>
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={!selectedAddressId || placingOrder}
              className="w-full mt-4 px-4 py-3 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {placingOrder ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay Now'}
                </>
              )}
            </button>
            {!selectedAddressId && (
              <p className="text-xs text-slate-500 mt-2 text-center">Please select or add a delivery address</p>
            )}

            <Link to="/cart" className="block text-center text-sm text-slate-600 hover:text-slate-900 mt-3">
              ← Back to cart
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
