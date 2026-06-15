

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ownerAPI } from '../../services/api';
import {
  HiHome, HiCalendar, HiStar, HiTable, HiBell, HiUserGroup, HiCog, HiArrowRight,
  HiTrendingUp, HiCurrencyDollar, HiCheck, HiX, HiEye, HiRefresh, HiChartBar,
  HiExclamation, HiInformationCircle, HiClock, HiPhone, HiMail, HiLocationMarker,
  HiCollection, HiPhotograph, HiDocumentText, HiChat
} from 'react-icons/hi';
import Swal from 'sweetalert2';
import AreaChart from '../../components/common/AreaChart';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try { const { data } = await ownerAPI.getStats(); setStats(data.data); }
    catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleApproveReject = async (id, status) => {
    try {
      await ownerAPI.updateReservationStatus(id, { status });
      Swal.fire({ icon: 'success', title: `Reservation ${status}!` });
      fetchStats();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Failed to update status' }); }
  };

  if (loading) return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = stats?.stats || {};
  const monthly = stats?.monthlyReservations || [];
  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const popularTables = stats?.popularTables || [];
  const customerTrends = stats?.customerTrends || [];

  const getMonthLabel = (id) => {
    const idx = parseInt(id?.split('-')[1]);
    return idx >= 1 && idx <= 12 ? monthlyLabels[idx - 1] : (id || '');
  };

  const totalReservations = monthly.reduce((s, m) => s + (m.count || 0), 0);
  const totalRevenue = monthly.reduce((s, m) => s + (m.revenue || 0), 0);

  const statCards = [
    { label: 'Total Reservations', value: s.totalReservations || 0, icon: HiCalendar, bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: "Today's", value: s.todayReservations || 0, icon: HiClock, bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Pending', value: s.pendingReservations || 0, icon: HiExclamation, bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Revenue', value: `৳${s.totalRevenue?.toLocaleString() || 0}`, icon: HiCurrencyDollar, bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Customers', value: s.totalCustomers || 0, icon: HiUserGroup, bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { label: 'Avg. Rating', value: s.averageRating || 0, icon: HiStar, bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Restaurants', value: s.totalRestaurants || 0, icon: HiHome, bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Tables', value: s.totalTables || 0, icon: HiTable, bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Reviews', value: s.totalReviews || 0, icon: HiChat, bg: 'bg-teal-50 dark:bg-teal-900/20' },
  ];

  const statusData = [
    { label: 'Confirmed', value: s.confirmedReservations || 0, color: '#22c55e' },
    { label: 'Pending', value: s.pendingReservations || 0, color: '#f97316' },
    { label: 'Completed', value: s.completedReservations || 0, color: '#3b82f6' },
    { label: 'Cancelled', value: s.cancelledReservations || 0, color: '#ef4444' },
  ];

  const totalStatus = statusData.reduce((sum, d) => sum + d.value, 0);
  let cumPct = 0;
  const donutSegments = statusData.map((d) => {
    const pct = totalStatus > 0 ? (d.value / totalStatus) * 100 : 0;
    const seg = { ...d, start: cumPct, pct }; cumPct += pct; return seg;
  });
  const donutGradient = donutSegments.length > 0
    ? `conic-gradient(${donutSegments.map((d) => `${d.color} ${d.start}% ${d.start + d.pct}%`).join(', ')})`
    : 'conic-gradient(#e5e7eb 0% 100%)';

  const quickLinks = [
    { to: '/owner/restaurants', label: 'Restaurants', desc: 'Manage locations & hours', icon: HiHome, color: 'bg-rose-500' },
    { to: '/owner/reservations', label: 'Reservations', desc: 'Approve & reject bookings', icon: HiCalendar, color: 'bg-blue-500' },
    { to: '/owner/tables', label: 'Tables', desc: 'Add & edit capacity', icon: HiTable, color: 'bg-indigo-500' },
    { to: '/owner/menus', label: 'Menus', desc: 'Add items & prices', icon: HiDocumentText, color: 'bg-green-500' },
    { to: '/owner/reviews', label: 'Reviews', desc: 'View & reply to reviews', icon: HiChat, color: 'bg-yellow-500' },
    { to: '/owner/subscription', label: 'Subscription', desc: 'Manage your plan', icon: HiCurrencyDollar, color: 'bg-purple-500' },
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold">Restaurant Owner Dashboard</h1><p className="text-gray-500">Manage your restaurant, reservations, and customers</p></div>
          <button onClick={fetchStats} className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50"><HiRefresh className="w-4 h-4" /> Refresh</button>
        </div>

        {s.pendingReservations > 0 && (
          <div className="flex items-center justify-between p-4 mb-4 border border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"><HiExclamation className="w-5 h-5 text-orange-500" /></div>
              <div><p className="font-medium text-orange-800">{s.pendingReservations} pending approval</p><Link to="/owner/reservations" className="text-sm text-orange-600 hover:underline">Review now →</Link></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className={`${card.bg} rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700`}>
              <card.icon className="w-5 h-5 text-gray-500 mb-2" />
              <p className="text-xl font-bold">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row - 3 Area Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Reservation Status Donut */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Reservation Status</h3>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full" style={{ background: donutGradient }} />
                <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center"><span className="text-lg font-bold">{totalStatus}</span></div></div>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              {statusData.map((d) => (<div key={d.label} className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />{d.label}</div>))}
            </div>
          </div>

          {/* Monthly Reservations - Area Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Monthly Reservations</h3>
            <div className="flex items-center justify-between mb-2">
              <div><p className="text-2xl font-bold text-purple-600">{totalReservations}</p><p className="text-xs text-gray-500">Total reservations</p></div>
              <div className="text-right"><p className="text-xs text-gray-400">Revenue</p><p className="text-sm font-bold text-green-600">৳{totalRevenue.toLocaleString()}</p></div>
            </div>
            <AreaChart data={monthly.map(m => ({ value: m.count || 0, label: getMonthLabel(m._id) }))} height={130} color="#8b5cf6" gradientId="ownerReservationArea" />
          </div>

          {/* Popular Tables - Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Most Popular Tables</h3>
            {popularTables.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No data yet</p> : (
              <div className="space-y-3">
                {popularTables.map((pt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-500 w-5">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1"><span className="font-medium">Table {pt.table?.tableNumber || 'N/A'}</span><span className="text-xs text-gray-500">{pt.reservations} bookings</span></div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((pt.reservations / Math.max(...popularTables.map(t => t.reservations || 0), 1)) * 100, 100)}%` }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Trends & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Customer Trends</h3>
            {customerTrends.length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No data yet</p> : (
              <div>
                <p className="text-2xl font-bold text-green-600 mb-1">{customerTrends.reduce((s, d) => s + (d.count || 0), 0)}</p>
                <p className="text-xs text-gray-500 mb-3">Total customers (last 30 days)</p>
                <AreaChart data={customerTrends.map(d => ({ value: d.count || 0, label: d._id?.slice(5) || '' }))} height={120} color="#22c55e" gradientId="ownerCustomerTrend" />
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <Link key={link.to} to={link.to} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                  <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center`}><link.icon className="w-5 h-5 text-white" /></div>
                  <p className="text-sm font-medium">{link.label}</p>
                  <p className="text-[10px] text-gray-500">{link.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold">Recent Reservations</h3>
            <Link to="/owner/reservations" className="text-sm text-purple-500 hover:underline flex items-center gap-1">View All <HiArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left p-4 font-medium text-gray-500">Customer</th>
                <th className="text-left p-4 font-medium text-gray-500">Restaurant</th>
                <th className="text-left p-4 font-medium text-gray-500">Date/Time</th>
                <th className="text-left p-4 font-medium text-gray-500">Guests</th>
                <th className="text-left p-4 font-medium text-gray-500">Status</th>
                <th className="text-left p-4 font-medium text-gray-500">Actions</th>
              </tr></thead>
              <tbody>
                {(stats?.recentReservations || []).length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No reservations yet</td></tr> :
                (stats?.recentReservations || []).map((res) => (
                  <tr key={res._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="p-4"><p className="font-medium">{res.user?.name || 'N/A'}</p><p className="text-xs text-gray-500">{res.user?.email}</p></td>
                    <td className="p-4">{res.restaurant?.name}</td>
                    <td className="p-4"><p>{new Date(res.reservationDate).toLocaleDateString()}</p><p className="text-xs text-gray-500">{res.timeSlot}</p></td>
                    <td className="p-4">{res.guestCount}</td>
                    <td className="p-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${res.status === 'confirmed' ? 'bg-green-100 text-green-700' : res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : res.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{res.status}</span></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {res.status === 'pending' && <><button onClick={() => handleApproveReject(res._id, 'confirmed')} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"><HiCheck className="w-3.5 h-3.5" /> Approve</button><button onClick={() => handleApproveReject(res._id, 'cancelled')} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"><HiX className="w-3.5 h-3.5" /> Reject</button></>}
                        {res.status === 'confirmed' && <button onClick={() => handleApproveReject(res._id, 'completed')} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"><HiCheck className="w-3.5 h-3.5" /> Complete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {(stats?.recentNotifications || []).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {stats.recentNotifications.map((notif) => (
                <div key={notif._id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100"><HiBell className="w-4 h-4 text-gray-500" /></div>
                  <div className="flex-1"><p className="text-sm font-medium">{notif.title}</p><p className="text-xs text-gray-500">{notif.message}</p><p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;