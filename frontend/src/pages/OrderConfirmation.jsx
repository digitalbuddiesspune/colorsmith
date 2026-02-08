import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { orders as ordersApi } from '../api/client';
import { formatOrderId } from '../utility/formatedOrderId';
import { generateInvoicePDF } from '../utility/invoiceGenerator';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  useEffect(() => {
    if (!order && id) {
      ordersApi.get(id)
        .then((res) => {
          setOrder(res.data.order);
        })
        .catch(() => {
          setError('Order not found');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, order]);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setGeneratingInvoice(true);
    try {
      await generateInvoicePDF(order);
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-slate-600">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-red-600 mb-4">{error || 'Order not found'}</div>
        <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-slate-600">
          Thank you for your order. We've received your order and will process it soon.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-200">
          <div>
            <p className="text-sm text-slate-600">Order Number</p>
            <p className="text-lg font-semibold text-slate-900">{formatOrderId(order.orderNumber || order._id)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Order Date</p>
            <p className="text-slate-900">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div>
            <p className="text-sm text-slate-600 mb-1">Payment Method</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
              order.paymentMethod === 'COD'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {order.paymentMethod === 'COD' ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cash on Delivery
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Paid Online
                </>
              )}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Payment Status</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${
              order.paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : order.paymentStatus === 'pending'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {order.paymentStatus === 'paid' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Subtotal</span>
            <span className="text-slate-900">
              Rs{Number(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">SGST (9%)</span>
            <span className="text-slate-900">
              Rs{Number(order.sgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">CGST (9%)</span>
            <span className="text-slate-900">
              Rs{Number(order.cgstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Total GST (18%)</span>
            <span>
              Rs{Number(order.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-100">
            <span className="text-slate-900">Total</span>
            <span className="text-slate-900">
              Rs{Number(order.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h3 className="font-medium text-slate-900 mb-4">Order Status</h3>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            order.orderStatus === 'confirmed' ? 'bg-emerald-500' :
            order.orderStatus === 'processing' ? 'bg-blue-500' :
            order.orderStatus === 'shipped' ? 'bg-purple-500' :
            order.orderStatus === 'delivered' ? 'bg-emerald-600' :
            order.orderStatus === 'cancelled' ? 'bg-red-500' :
            'bg-amber-500'
          }`} />
          <span className="text-slate-900 font-medium capitalize">{order.orderStatus}</span>
        </div>
        {order.orderStatus === 'confirmed' && (
          <p className="text-sm text-slate-600 mt-2">
            Your order has been confirmed and will be processed shortly.
          </p>
        )}
      </div>

      {/* What's Next */}
      <div className="bg-slate-50 rounded-xl p-6 mb-6">
        <h3 className="font-medium text-slate-900 mb-3">What happens next?</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>You will receive an order confirmation email shortly.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Our team will process your order and prepare it for shipping.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>You can track your order status from the Orders page.</span>
          </li>
          {order.paymentMethod === 'COD' && (
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Please keep the exact amount ready for payment at delivery.</span>
            </li>
          )}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadInvoice}
          disabled={generatingInvoice}
          className="flex-1 px-4 py-3 rounded-lg bg-emerald-600 text-white font-medium text-center hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {generatingInvoice ? 'Generating...' : 'Download Invoice'}
        </button>
        <Link
          to="/orders"
          className="flex-1 px-4 py-3 rounded-lg bg-amber-500 text-white font-medium text-center hover:bg-amber-600"
        >
          View My Orders
        </Link>
        <Link
          to="/catalog"
          className="flex-1 px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-center hover:bg-slate-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
