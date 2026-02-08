import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import adminApi from '../../api/admin.js';
import { orders } from '../../api/client.js';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState({
    admins: null,
    categories: null,
    products: null,
    colorSets: null,
  });

  const [orderStats, setOrderStats] = useState({
    todayOrders: 0,
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
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Order status cards
  const orderCards = [
    { 
      title: "Today's Orders", 
      value: orderStats.todayOrders, 
      icon: '📦',
      color: 'bg-blue-600 border-blue-500',
      link: '/admin/orders'
    },
    { 
      title: 'Pending', 
      value: orderStats.pendingOrders, 
      icon: '⏳',
      color: 'bg-yellow-600 border-yellow-500',
      link: '/admin/orders?status=pending'
    },
    { 
      title: 'Confirmed', 
      value: orderStats.confirmedOrders, 
      icon: '✓',
      color: 'bg-indigo-600 border-indigo-500',
      link: '/admin/orders?status=confirmed'
    },
    { 
      title: 'Processing', 
      value: orderStats.processingOrders, 
      icon: '⚙️',
      color: 'bg-purple-600 border-purple-500',
      link: '/admin/orders?status=processing'
    },
    { 
      title: 'Shipped', 
      value: orderStats.shippedOrders, 
      icon: '🚚',
      color: 'bg-cyan-600 border-cyan-500',
      link: '/admin/orders?status=shipped'
    },
    { 
      title: 'Delivered', 
      value: orderStats.deliveredOrders, 
      icon: '✅',
      color: 'bg-emerald-600 border-emerald-500',
      link: '/admin/orders?status=delivered'
    },
    { 
      title: 'Cancelled', 
      value: orderStats.cancelledOrders, 
      icon: '❌',
      color: 'bg-red-600 border-red-500',
      link: '/admin/orders?status=cancelled'
    },
    { 
      title: 'Total Orders', 
      value: orderStats.totalOrders, 
      icon: '📊',
      color: 'bg-slate-700 border-slate-600',
      link: '/admin/orders'
    },
  ];

  const kpiCards = [
    { title: 'Admins', value: kpis.admins ?? '—', link: null, color: 'bg-slate-700 border-slate-600' },
    { title: 'Categories', value: kpis.categories ?? '—', link: '/admin/categories', color: 'bg-indigo-600 border-indigo-500' },
    { title: 'Products', value: kpis.products ?? '—', link: '/admin/products', color: 'bg-emerald-600 border-emerald-500' },
    { title: 'Color Sets', value: kpis.colorSets ?? '—', link: '/admin/color-sets', color: 'bg-amber-500 border-amber-400' },
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

      {/* Order Status Cards */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {orderCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className={`rounded-xl border ${card.color} p-4 shadow-sm hover:opacity-90 transition-opacity`}
            >
              <div className="text-2xl mb-2">{card.icon}</div>
              <p className="text-white/80 text-xs font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-1">
                {loading ? '—' : card.value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Monthly Sales Chart */}
      <section className="mb-8">
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

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-xl border ${card.color} p-5 shadow-sm`}
          >
            <p className="text-slate-400 text-sm font-medium">{card.title}</p>
            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
            {card.link && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={card.link}
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  View →
                </Link>
                {card.title === 'Categories' && (
                  <Link
                    to="/admin/categories/new"
                    className="text-sm font-medium text-amber-300 hover:text-amber-200"
                  >
                    Add category
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Tiles grid - Power BI style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick actions</h2>
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Link
                to="/admin/orders"
                className="px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                View all orders
              </Link>
              <Link
                to="/admin/orders?status=pending"
                className="px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium"
              >
                Pending orders
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                to="/admin/categories"
                className="px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium"
              >
                Manage categories
              </Link>
              <Link
                to="/admin/categories/new"
                className="px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium"
              >
                Add category
              </Link>
            </div>
            <Link
              to="/admin/products"
              className="block px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium"
            >
              Manage products
            </Link>
            <Link
              to="/admin/color-sets"
              className="block px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium"
            >
              Manage color sets
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 border border-slate-200">
              <span className="text-slate-700 font-medium">Orders Today</span>
              <span className="font-bold text-slate-900 bg-white px-3 py-0.5 rounded-full text-sm">{orderStats.todayOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-100 border border-amber-300">
              <span className="text-amber-800 font-medium">Awaiting Action</span>
              <span className="font-bold text-white bg-amber-500 px-3 py-0.5 rounded-full text-sm">
                {orderStats.pendingOrders + orderStats.confirmedOrders}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-100 border border-blue-300">
              <span className="text-blue-800 font-medium">In Transit</span>
              <span className="font-bold text-white bg-blue-500 px-3 py-0.5 rounded-full text-sm">{orderStats.shippedOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-100 border border-emerald-300">
              <span className="text-emerald-800 font-medium">Completed</span>
              <span className="font-bold text-white bg-emerald-500 px-3 py-0.5 rounded-full text-sm">{orderStats.deliveredOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width widget row */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="pb-3 font-medium">Section</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3 text-slate-900 font-medium">Orders</td>
                <td className="py-3 text-slate-600">Manage customer orders and track deliveries</td>
                <td className="py-3 flex gap-3">
                  <Link to="/admin/orders" className="text-indigo-600 hover:underline font-medium">View All</Link>
                  <Link to="/admin/orders?status=pending" className="text-amber-600 hover:underline font-medium">Pending</Link>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 text-slate-900 font-medium">Categories</td>
                <td className="py-3 text-slate-600">Product categories (e.g. Nail lacquers, Lip gloss)</td>
                <td className="py-3 flex gap-3">
                  <Link to="/admin/categories" className="text-indigo-600 hover:underline font-medium">Open</Link>
                  <Link to="/admin/categories/new" className="text-amber-600 hover:underline font-medium">Add</Link>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 text-slate-900 font-medium">Products</td>
                <td className="py-3 text-slate-600">Products with grades, colors, and availability</td>
                <td className="py-3">
                  <Link to="/admin/products" className="text-indigo-600 hover:underline font-medium">Open</Link>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 text-slate-900 font-medium">Color Sets</td>
                <td className="py-3 text-slate-600">Admin and client color sets</td>
                <td className="py-3">
                  <Link to="/admin/color-sets" className="text-indigo-600 hover:underline font-medium">Open</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
