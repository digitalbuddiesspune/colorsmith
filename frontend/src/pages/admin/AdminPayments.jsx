import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { orders as ordersApi } from '../../api/client';
import { formatOrderId } from '../../utility/formatedOrderId';
import { useMessage } from '../../context/MessageContext';

const PAYMENT_COLORS = {
  paid:     'bg-emerald-100 text-emerald-700',
  pending:  'bg-amber-100 text-amber-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-700',
};

function PaymentBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${PAYMENT_COLORS[status] || 'bg-slate-100 text-slate-700'}`}>
      {status === 'pending' ? 'Unpaid' : status}
    </span>
  );
}

function Mono({ value }) {
  if (!value || value === '-') return <span className="text-slate-400">—</span>;
  return <span className="font-mono text-xs text-slate-600 select-all">{value}</span>;
}

const formatDate = (d) =>
  new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const formatAmount = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 });

export default function AdminPayments() {
  const { showMessage } = useMessage();
  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [pagination, setPagination]   = useState({ total: 0, pages: 1 });
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const limit = 15;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.paymentStatus = statusFilter;
      const res = await ordersApi.adminList(params);
      setPayments(res.data.orders || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [page, statusFilter]);

  // Client-side filter by search & method
  const filtered = payments.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      formatOrderId(o.orderNumber || o._id).toLowerCase().includes(q) ||
      (o.razorpayPaymentId || '').toLowerCase().includes(q) ||
      (o.razorpayOrderId || '').toLowerCase().includes(q) ||
      (o.user?.name || '').toLowerCase().includes(q) ||
      (o.user?.email || '').toLowerCase().includes(q);

    const matchMethod =
      !methodFilter ||
      (methodFilter === 'online' && o.paymentMethod !== 'COD') ||
      (methodFilter === 'cod' && o.paymentMethod === 'COD');

    return matchSearch && matchMethod;
  });

  // Summary stats (from current page)
  const totalPaid    = payments.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + Number(o.grandTotal || 0), 0);
  const totalPending = payments.filter(o => o.paymentStatus === 'pending').length;
  const totalFailed  = payments.filter(o => o.paymentStatus === 'failed').length;

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await ordersApi.adminList({ page: 1, limit: 10000 });
      const list = res.data.orders || [];
      const rows = list.map((o) => ({
        'Order ID':         formatOrderId(o.orderNumber || o._id),
        'Customer':         o.user?.name || 'N/A',
        'Email':            o.user?.email || '',
        'Amount':           Number(o.grandTotal || 0),
        'Method':           o.paymentMethod === 'COD' ? 'COD' : 'Online',
        'Status':           o.paymentStatus === 'pending' ? 'Unpaid' : o.paymentStatus || '',
        'Transaction ID':   o.razorpayPaymentId || '-',
        'Gateway Order ID': o.razorpayOrderId || '-',
        'Date':             formatDate(o.createdAt),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Payments');
      XLSX.writeFile(wb, `payments_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
      showMessage('Failed to export. Please try again.', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div>
      {/* Back */}
      <div className="mb-6">
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

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track payment details for all orders</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exportLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exportLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Exporting…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download XLS
            </>
          )}
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders',   value: pagination.total,                         color: 'text-slate-900' },
          { label: 'Paid Revenue',   value: formatAmount(totalPaid),                  color: 'text-emerald-700' },
          { label: 'Unpaid',         value: totalPending,                             color: 'text-amber-600' },
          { label: 'Failed',         value: totalFailed,                              color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search order no / transaction id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Unpaid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All Methods</option>
          <option value="online">Online</option>
          <option value="cod">COD</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading payments…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No payments found</div>
        ) : (
          <>
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Transaction ID', 'Gateway Order ID', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">
                      <Link
                        to={`/admin/orders/${o._id}`}
                        className="hover:text-amber-600 transition-colors"
                      >
                        {formatOrderId(o.orderNumber || o._id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800 leading-tight">{o.user?.name || 'N/A'}</p>
                      <p className="text-xs text-slate-400">{o.user?.email || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {formatAmount(o.grandTotal)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {o.paymentMethod === 'COD' ? 'COD' : 'Online'}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Mono value={o.razorpayPaymentId} />
                    </td>
                    <td className="px-4 py-3">
                      <Mono value={o.razorpayOrderId} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {page} of {pagination.pages} &nbsp;·&nbsp; {pagination.total} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
