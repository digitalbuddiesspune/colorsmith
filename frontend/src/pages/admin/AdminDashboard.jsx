import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import adminApi from '../../api/admin.js';
import { orders } from '../../api/client.js';
import { formatOrderId } from '../../utility/formatedOrderId.js';

const PAYMENT_COLORS = {
  paid:     'bg-emerald-100 text-emerald-700',
  pending:  'bg-amber-100 text-amber-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-600',
};

const ORDER_COLORS = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-cyan-100 text-cyan-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState({
    admins: null,
    categories: null,
    products: null,
    colorSets: null,
  });

  const [orderStats, setOrderStats] = useState({
    todayOrders: 0,
    todayConfirmedOrders: 0,
    todayCancelledOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    monthlySales: [],
  });

  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    // Fetch admin count
    adminApi.getAdmins()
      .then((res) => setKpis((p) => ({ ...p, admins: res.data?.data?.length ?? 0 })))
      .catch(() => setKpis((p) => ({ ...p, admins: 0 })));

    // Fetch dashboard stats
    orders.getDashboardStats()
      .then((res) => {
        if (res.data?.success) {
          setOrderStats(res.data.stats);
        }
      })
      .catch((err) => console.error('Failed to fetch dashboard stats:', err))
      .finally(() => setLoading(false));

    // Fetch today's orders for the recent orders table
    orders.adminList({ today: true, limit: 50 })
      .then((res) => setRecentOrders(res.data.orders || []))
      .catch((err) => console.error('Failed to fetch recent orders:', err))
      .finally(() => setRecentLoading(false));
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const todayCards = [
    {
      title: "Today's Orders",
      value: orderStats.todayOrders,
      sub: 'All orders placed today',
      accent: 'border-l-slate-400',
      badge: 'bg-slate-100 text-slate-700',
      link: '/admin/orders',
    },
    {
      title: "Today's Confirmed",
      value: orderStats.todayConfirmedOrders,
      sub: 'Confirmed today',
      accent: 'border-l-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700',
      link: '/admin/orders?status=confirmed',
    },
    {
      title: "Today's Cancelled",
      value: orderStats.todayCancelledOrders,
      sub: 'Cancelled today',
      accent: 'border-l-red-400',
      badge: 'bg-red-100 text-red-700',
      link: '/admin/orders?status=cancelled',
    },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your Color Smith admin data</p>
      </header>

      {/* Revenue Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Today's Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">
                {loading ? '—' : formatCurrency(orderStats.todayRevenue)}
              </p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>
        <div className="rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">
                {loading ? '—' : formatCurrency(orderStats.totalRevenue)}
              </p>
            </div>
            <div className="text-4xl opacity-80">📈</div>
          </div>
        </div>
      </section>

      {/* Today's Order Cards */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Today's Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {todayCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className={`group bg-[#FAF9F7] border border-slate-200 border-l-4 ${card.accent} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.badge}`}>
                  Today
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900">
                {loading ? '—' : card.value}
              </p>
              <p className="text-xs text-slate-400 mt-2 group-hover:text-slate-600 transition-colors">
                {card.sub} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Monthly Sales Chart */}
      <section className="mb-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Sales Analysis</h2>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-slate-400">
              Loading chart data...
            </div>
          ) : orderStats.monthlySales.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={orderStats.monthlySales}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                    formatter={(value, name) => {
                      if (name === 'sales') return [formatCurrency(value), 'Revenue'];
                      return [value, 'Orders'];
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="sales" 
                    name="Revenue" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="orders" 
                    name="Orders" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              No sales data available
            </div>
          )}
        </div>
      </section>

      {/* Recent Orders Table */}
      <section className="mb-8">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
              <p className="text-xs text-slate-400 mt-0.5">Orders placed today</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              View all →
            </Link>
          </div>

          {recentLoading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading orders…</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">No orders today yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Order ID', 'Customer', 'Amount', 'Method', 'Order Status', 'Payment', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      className="hover:bg-[#FAF9F7] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 whitespace-nowrap">
                        {formatOrderId(order.orderNumber || order._id)}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-800 leading-tight">{order.user?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{order.user?.email || ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-900 whitespace-nowrap">
                        ₹{Number(order.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {order.paymentMethod === 'COD' ? 'COD' : 'Online'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ORDER_COLORS[order.orderStatus] || 'bg-slate-100 text-slate-700'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${PAYMENT_COLORS[order.paymentStatus] || 'bg-slate-100 text-slate-600'}`}>
                          {order.paymentStatus === 'pending' ? 'Unpaid' : order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
