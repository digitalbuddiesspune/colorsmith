import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orders as ordersApi } from '../../api/client';
import { formatOrderId } from '../../utility/formatedOrderId';
import { generateInvoicePDF } from '../../utility/invoiceGenerator';

// Order Status Badge Component
function StatusBadge({ status, type = 'order' }) {
  const orderColors = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  
  const paymentColors = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-slate-100 text-slate-800',
  };
  
  const colors = type === 'payment' ? paymentColors : orderColors;
  const label = type === 'payment' 
    ? (status === 'pending' ? 'Unpaid' : status === 'paid' ? 'Paid' : status)
    : status;

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colors[status] || 'bg-slate-100 text-slate-800'}`}>
      {label}
    </span>
  );
}

// Order Timeline Component
function OrderTimeline({ status, createdAt }) {
  const steps = [
    { key: 'confirmed', label: 'Ordered', icon: 'check' },
    { key: 'processing', label: 'Packed', icon: 'box' },
    { key: 'shipped', label: 'Shipped', icon: 'truck' },
    { key: 'delivered', label: 'Delivered', icon: 'home' },
    { key: 'cancelled', label: 'Cancelled', icon: 'x' },
  ];

  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="flex items-center justify-between px-8 py-8">
      {steps.map((step, index) => {
        const isCompleted = !isCancelled && currentIndex >= statusOrder.indexOf(step.key);
        const isCurrent = step.key === status;
        const isCancelledStep = step.key === 'cancelled';
        
        // Skip cancelled step if order is not cancelled
        if (isCancelledStep && !isCancelled) {
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-sm text-slate-400 mt-3">{step.label}</span>
            </div>
          );
        }

        // Show cancelled step if order is cancelled
        if (isCancelledStep && isCancelled) {
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-sm text-red-600 font-medium mt-3">{step.label}</span>
            </div>
          );
        }

        return (
          <div key={step.key} className="flex flex-col items-center flex-1 relative">
            {/* Connector line */}
            {index > 0 && index < 4 && (
              <div 
                className={`absolute right-1/2 top-5 h-0.5 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
                style={{ width: '100%', transform: 'translateX(50%)' }}
              />
            )}
            
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
              isCurrent ? 'bg-emerald-500' : isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
            }`}>
              {isCompleted || isCurrent ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-3 h-3 rounded-full bg-slate-400" />
              )}
            </div>
            <span className={`text-sm mt-3 ${isCurrent || isCompleted ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
              {step.label}
            </span>
            {isCurrent && createdAt && step.key === 'confirmed' && (
              <span className="text-xs text-slate-500 mt-1 text-center">
                {new Date(createdAt).toLocaleDateString('en-IN', { 
                  weekday: 'short', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                <br />
                at {new Date(createdAt).toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [invoiceDownloading, setInvoiceDownloading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      // Use admin list endpoint and find the order
      const res = await ordersApi.adminList({ limit: 1000 });
      const foundOrder = res.data.orders?.find(o => o._id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        setOrderStatus(foundOrder.orderStatus);
        setPaymentStatus(foundOrder.paymentStatus);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to load order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save when status changes
  const handleOrderStatusChange = async (newStatus) => {
    const previousStatus = orderStatus;
    setOrderStatus(newStatus);
    setUpdating(true);
    setSaveMessage('');
    
    try {
      await ordersApi.adminUpdate(order._id, { orderStatus: newStatus, paymentStatus });
      // Update local order state to reflect change immediately
      setOrder(prev => ({ ...prev, orderStatus: newStatus }));
      setSaveMessage('Status updated!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (err) {
      console.error('Failed to update order status:', err);
      setOrderStatus(previousStatus); // Revert on error
      setSaveMessage('Failed to update');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setInvoiceDownloading(true);
    try {
      await generateInvoicePDF(order);
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      setSaveMessage('Failed to download invoice');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setInvoiceDownloading(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus) => {
    const previousStatus = paymentStatus;
    setPaymentStatus(newStatus);
    setUpdating(true);
    setSaveMessage('');
    
    try {
      await ordersApi.adminUpdate(order._id, { orderStatus, paymentStatus: newStatus });
      // Update local order state to reflect change immediately
      setOrder(prev => ({ ...prev, paymentStatus: newStatus }));
      setSaveMessage('Status updated!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (err) {
      console.error('Failed to update payment status:', err);
      setPaymentStatus(previousStatus); // Revert on error
      setSaveMessage('Failed to update');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Order not found'}</div>
        <Link to="/admin/orders" className="text-amber-600 hover:text-amber-700 font-medium">
          Back to Orders
        </Link>
      </div>
    );
  }

  const shortUserId = order.user?._id?.slice(-5) || 'N/A';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </Link>
        {saveMessage && (
          <span className={`text-sm px-3 py-1 rounded-full ${saveMessage.includes('updated') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {saveMessage}
          </span>
        )}
      </div>

      {/* Order Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Order ID</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatOrderId(order.orderNumber || order._id)}</p>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => handleOrderStatusChange(e.target.value)}
                disabled={updating || orderStatus === 'cancelled' || orderStatus === 'delivered'}
                title={orderStatus === 'cancelled' || orderStatus === 'delivered' ? 'Status cannot be changed' : undefined}
                className="px-4 py-2 border border-amber-200 rounded-lg text-sm bg-amber-50 text-amber-800 font-medium min-w-[140px] disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                disabled={updating}
                className="px-4 py-2 border border-amber-200 rounded-lg text-sm bg-amber-50 text-amber-800 font-medium min-w-[140px] disabled:opacity-50"
              >
                <option value="pending">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={invoiceDownloading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {invoiceDownloading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Downloading…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Info Card */}
      <div className="bg-amber-50 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Date:</span> {formatDate(order.createdAt)}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Customer:</span> {order.user?.name || 'N/A'}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Email:</span> {order.user?.email || 'N/A'}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Address:</span> {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Payment:</span> {order.paymentMethod === 'COD' ? 'Cod' : 'Razorpay'}
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">Phone:</span> {order.shippingAddress?.phone || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Order Timeline - Now uses orderStatus state for live updates */}
      <div className="bg-white border border-slate-200 rounded-xl mb-6">
        <OrderTimeline status={orderStatus} createdAt={order.createdAt} />
      </div>

      {/* Order Details Grid - Now uses state values for live updates */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">User ID</p>
            <p className="text-sm font-medium text-slate-900 mt-1">{shortUserId}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Order Count</p>
            <p className="text-sm font-medium text-slate-900 mt-1">{order.items?.length || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Display Order ID</p>
            <p className="text-sm font-medium text-slate-900 mt-1">{formatOrderId(order.orderNumber || order._id)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Customer Name</p>
            <p className="text-sm font-medium text-amber-600 mt-1">{order.user?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Mobile Number</p>
            <p className="text-sm font-medium text-slate-900 mt-1">+91 {order.shippingAddress?.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
            <p className="text-sm font-medium text-slate-900 mt-1">{order.user?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Payment Status</p>
            <div className="mt-1">
              <StatusBadge status={paymentStatus} type="payment" />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Order Status</p>
            <div className="mt-1">
              <StatusBadge status={orderStatus} type="order" />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Code Applied</p>
            <p className="text-sm font-medium text-slate-900 mt-1">No</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Payment Mode</p>
            <p className="text-sm font-medium text-slate-900 mt-1">{order.paymentMethod === 'COD' ? 'Cash' : 'Online'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">GST Number</p>
            <p className="text-sm font-medium text-slate-900 mt-1">N/A</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Order Date & Time</p>
            <p className="text-sm font-medium text-slate-900 mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 text-lg">Order Items</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">GST</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items?.map((item, index) => {
              const gstAmount = (item.totalPrice || 0) * 0.18;
              return (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {item.productImage ? (
                        <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-slate-900">{item.productName}</span>
                        {item.grade?.name && (
                          <p className="text-xs text-slate-500 mt-0.5">Grade: {item.grade.name}</p>
                        )}
                        {item.colors?.length > 0 && (
                          <p className="text-xs text-slate-500">Colors: {item.colors.map(c => c.name).join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">
                    ₹{Number(item.unitPrice || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">
                    ₹{gstAmount.toFixed(2)}
                    <br />
                    <span className="text-xs text-slate-400">(18%)</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    ₹{Number(item.totalPrice || 0).toFixed(0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Order Summary */}
        <div className="border-t border-slate-200 px-6 py-6 bg-slate-50">
          <div className="flex justify-end">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900 font-medium">₹{Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">SGST (9%)</span>
                <span className="text-slate-900">₹{Number(order.sgstAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">CGST (9%)</span>
                <span className="text-slate-900">₹{Number(order.cgstAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total GST (18%)</span>
                <span className="text-slate-900">₹{Number(order.gstAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-900">Grand Total</span>
                <span className="font-bold text-lg text-slate-900">₹{Number(order.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
