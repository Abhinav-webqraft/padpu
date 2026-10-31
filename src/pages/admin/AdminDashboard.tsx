import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, ShoppingBag, AlertCircle, Package, ArrowUpRight, RefreshCw } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  processing: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  packed: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  dispatched: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/admin/dashboard')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const { stats, recentOrders, revenueChartData, ordersChartData } = data || {
    stats: { totalRevenue: 0, totalOrders: 0, pendingOrders: 0, lowStockProducts: 0 },
    recentOrders: [],
    revenueChartData: [],
    ordersChartData: []
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Overview</span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-0.5">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl text-xs font-semibold text-stone-300 transition-colors border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            Refresh
          </button>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 amber-gradient text-stone-950 rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            Manage Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {[
          {
            label: 'Total Revenue',
            value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
            sub: 'Paid orders',
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: 'Total Orders',
            value: stats.totalOrders,
            sub: 'All time',
            icon: ShoppingBag,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
          },
          {
            label: 'Pending Orders',
            value: stats.pendingOrders,
            sub: 'Needs action',
            icon: AlertCircle,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10 border-orange-500/20',
          },
          {
            label: 'Out of Stock',
            value: stats.lowStockProducts,
            sub: 'Products',
            icon: Package,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/20',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-3xl bg-white/[0.04] border border-white/10 p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">{stat.value}</h3>
                <p className="text-[11px] text-stone-500 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-7 rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white">Revenue Trend</h2>
              <p className="text-[11px] text-stone-400">Last 6 months performance</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Monthly
            </span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121610', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fbbf24', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="lg:col-span-5 rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white">Weekly Orders</h2>
              <p className="text-[11px] text-stone-400">Last 7 days volume</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              7 Days
            </span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ backgroundColor: '#121610', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#34d399', fontWeight: 600 }}
                />
                <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Recent Orders</h2>
            <p className="text-[11px] text-stone-400">Latest customer purchases</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-stone-500 text-xs">No recent orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  <th className="py-3 pr-4">Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pr-4 font-sans font-bold text-amber-400">#{order.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white truncate max-w-[140px] sm:max-w-none">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500 truncate max-w-[140px] sm:max-w-none">{order.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 font-sans hidden sm:table-cell">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${STATUS_BADGE[order.orderStatus] || STATUS_BADGE.confirmed}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right font-sans font-bold text-white">
                      ₹{Number(order.total).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
