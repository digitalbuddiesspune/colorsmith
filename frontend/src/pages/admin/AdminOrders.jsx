import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orders as ordersApi } from '../../api/client';
import { formatOrderId } from '../../utility/formatedOrderId';

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

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      const res = await ordersApi.adminList(params);
      setOrders(res.data.orders || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const pendingCount = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed').length;
  const deliveredCount = orders.filter(o => o.orderStatus === 'delivered').length;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRowClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-600">Total: <span className="font-medium text-slate-900">{pagination.total}</span></span>
          <span className="text-slate-600">Pending: <span className="font-medium text-amber-600">{pendingCount}</span></span>
          <span className="text-slate-600">Delivered: <span className="font-medium text-emerald-600">{deliveredCount}</span></span>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No orders found</div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Order Count</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Order Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => handleRowClick(order._id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-slate-900" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset rounded"
                      >
                        {formatOrderId(order.orderNumber || order._id)}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-900">{order.user?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{order.shippingAddress?.phone || ''}</div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
                      ₹{Number(order.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={order.orderStatus} type="order" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={order.paymentStatus} type="payment" />
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-slate-600">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page {page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
