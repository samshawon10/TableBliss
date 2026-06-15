

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AreaChart from '../../components/common/AreaChart';
import {
  HiUsers, HiOfficeBuilding, HiCalendar, HiExclamation, HiInformationCircle,
  HiCurrencyDollar, HiStar, HiRefresh, HiBell, HiArrowRight, HiCheck, HiX,
  HiChartBar, HiTrendingUp, HiUserGroup, HiCollection, HiPhotograph, HiChat,
  HiClock, HiShieldCheck
} from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getStats();
      setStats(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleApproveRestaurant = async (id) => {
    try {
      await adminAPI.updateRestaurantStatus(id, { isActive: true });
      Swal.fire({ icon: 'success', title: 'Restaurant approved!' });
      fetchStats();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Failed to approve' }); }
  };

  const handleRejectRestaurant = async (id) => {
    try {
      await adminAPI.updateRestaurantStatus(id, { isActive: false });
      Swal.fire({ icon: 'info', title: 'Restaurant rejected' });
      fetchStats();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Failed to reject' }); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = stats || {};
  const monthlyReservations = s.monthlyReservations || [];
  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const userRegistrations = s.userRegistrations || [];
  const cuisineData = s.cuisineStats || [];
  const pendingRestaurants = s.pendingRestaurants || [];

  const statCards = [
    { label: 'Total Users', value: s.totalUsers || 0, subtitle: `${s.activeUsers || 0} active`, icon: HiUsers, bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Restaurants', value: s.totalRestaurants || 0, subtitle: `${s.activeRestaurants || 0} approved`, icon: HiOfficeBuilding, bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Total Bookings', value: s.totalReservations || 0, subtitle: `${s.todayBookings || 0} today`, icon: HiCalendar, bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Revenue', value: `৳${(s.totalRevenue || 0).toLocaleString()}`, icon: HiCurrencyDollar, bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { label: 'Reviews', value: s.totalReviews || 0, icon: HiStar, bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Unread Contacts', value: s.unreadContacts || 0, icon: HiChat, bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  const bookingStatusData = [
    { label: 'Confirmed', value: s.confirmedReservations || 0, color: '#22c55e' },
    { label: 'Pending', value: s.pendingReservations || 0, color: '#f97316' },
    { label: 'Completed', value: s.completedReservations || 0, color: '#3b82f6' },
    { label: 'Cancelled', value: s.cancelledReservations || 0, color: '#ef4444' },
  ];

  const quickLinks = [
    { to: '/admin/users', label: 'User Management', desc: 'View, search, suspend & manage', icon: HiUsers },
    { to: '/admin/restaurants', label: 'Restaurants', desc: 'Review, approve, feature & disable', icon: HiOfficeBuilding },
    { to: '/admin/reservations', label: 'Reservations', desc: 'Monitor all bookings', icon: HiCalendar },
    { to: '/admin/menus', label: 'Menus', desc: 'View all menus', icon: HiCollection },
    { to: '/admin/gallery', label: 'Gallery', desc: 'Manage restaurant images', icon: HiPhotograph },
  ];

  const getMonthLabel = (id) => {
    const idx = parseInt(id?.split('-')[1]);
    return idx >= 1 && idx <= 12 ? monthlyLabels[idx - 1] : (id || '');
  };

  const buildPieGradient = (data, total, colorKey = 'color') => {
    const totalVal = data.reduce((sum, d) => sum + (d.value || d.count || 0), 0);
    if (totalVal === 0) return 'conic-gradient(#e5e7eb 0% 100%)';
    let cumPct = 0;
    const segments = data.map((d) => {
      const val = d.value || d.count || 0;
      const pct = (val / totalVal) * 100;
      const color = d[colorKey];
      const seg = `${color} ${cumPct}% ${cumPct + pct}%`;
      cumPct += pct;
      return seg;
    });
    return `conic-gradient(${segments.join(', ')})`;
  };

  const revenueData = monthlyReservations.length > 0 && monthlyReservations.some(m => m.revenue > 0)
    ? monthlyReservations.map(m => ({ label: getMonthLabel(m._id), value: m.revenue || 0, color: `hsl(${(parseInt(m._id?.split('-')[1]) || 1) * 30}, 70%, 55%)` }))
    : monthlyReservations.map((m, i) => ({ label: getMonthLabel(m._id), value: m.count || 0, color: `hsl(${i * 40}, 65%, 60%)` }));

  const cuisineColors = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#84cc16'];
  const cuisinePieData = cuisineData.map((c, i) => ({ label: c._id, value: c.count, color: cuisineColors[i % cuisineColors.length] }));
  const regColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

  const totalBookings = bookingStatusData.reduce((sum, d) => sum + d.value, 0);
  const bookingDonutGradient = buildPieGradient(bookingStatusData, totalBookings);
  const cuisineTotal = cuisinePieData.reduce((s, d) => s + d.value, 0);

  // Build area chart data arrays
  const reservationChartData = monthlyReservations.map(m => ({ value: m.count || 0, label: getMonthLabel(m._id) }));
  const userChartData = userRegistrations.map(u => ({ value: u.count || 0, label: getMonthLabel(u._id) }));

  const totalReservations = monthlyReservations.reduce((s, m) => s + (m.count || 0), 0);
  const totalResRevenue = monthlyReservations.reduce((s, m) => s + (m.revenue || 0), 0);
  const totalNewUsers = userRegistrations.reduce((s, u) => s + (u.count || 0), 0);
  const userGrowth = userRegistrations.length > 1 ? (userRegistrations[userRegistrations.length - 1].count || 0) - (userRegistrations[0].count || 0) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-sm text-gray-500">Platform overview and management</p></div>
        <button onClick={fetchStats} className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50"><HiRefresh className="w-4 h-4" /> Refresh</button>
      </div>

      {pendingRestaurants.length > 0 && (
        <div className="flex items-center justify-between p-4 mb-4 border border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"><HiInformationCircle className="w-5 h-5 text-orange-500" /></div>
            <div><p className="font-medium text-orange-800">{pendingRestaurants.length} awaiting approval</p><Link to="/admin/restaurants" className="text-sm text-orange-600 hover:underline">Review now →</Link></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700`}>
            <card.icon className="w-5 h-5 text-gray-500 mb-2" />
            <p className="text-xl font-bold">{card.value}</p>
            <p className="text-xs text-gray-500">{card.label}</p>
            {card.subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{card.subtitle}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Booking Status</h3>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-full" style={{ background: bookingDonutGradient }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-full"><span className="text-lg font-bold">{totalBookings}</span></div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {bookingStatusData.map((d) => (
              <div key={d.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />{d.label} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Reservation Trends</h3>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-2xl font-bold text-purple-600">{totalReservations}</p>
              <p className="text-xs text-gray-500">Total reservations (6 months)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Revenue</p>
              <p className="text-sm font-bold text-green-600">৳{totalResRevenue.toLocaleString()}</p>
            </div>
          </div>
          <AreaChart data={reservationChartData} height={140} color="#8b5cf6" gradientId="resGradient" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">User Registrations</h3>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalNewUsers}</p>
              <p className="text-xs text-gray-500">Total new users (6 months)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">6-month growth</p>
              <p className="text-sm font-bold text-blue-600">+{userGrowth}</p>
            </div>
          </div>
          <AreaChart data={userChartData} height={140} color="#3b82f6" gradientId="userGradient2" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Restaurants by Cuisine</h3>
          {cuisinePieData.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No data yet</p> : (
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-36 h-36 rounded-full" style={{ background: buildPieGradient(cuisinePieData, cuisineTotal) }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex-col">
                    <span className="text-base font-bold">{cuisineTotal}</span>
                    <span className="text-[8px] text-gray-400">total</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                {cuisinePieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded flex-shrink-0" style={{ background: d.color }} />
                    <span className="flex-1 truncate">{d.label}</span>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                <link.icon className="w-6 h-6 text-gray-500" />
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-[10px] text-gray-500">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {pendingRestaurants.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold">Pending Restaurants</h3>
            <Link to="/admin/restaurants" className="text-sm text-purple-500 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {pendingRestaurants.map((rest) => (
              <div key={rest._id} className="flex items-center justify-between p-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-3">
                  <img src={rest.images?.cover || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} alt={rest.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium">{rest.name}</p>
                    <p className="text-xs text-gray-500">{rest.cuisine?.join(', ')} · {rest.owner?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleApproveRestaurant(rest._id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"><HiCheck className="w-3.5 h-3.5" /> Approve</button>
                  <button onClick={() => handleRejectRestaurant(rest._id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"><HiX className="w-3.5 h-3.5" /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(s.recentReviews || []).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold">Recent Reviews</h3>
            <Link to="/admin/disputes" className="text-sm text-purple-500 hover:underline">Manage reviews</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {s.recentReviews.slice(0, 5).map((review) => (
              <div key={review._id} className="flex items-start gap-3 p-4 px-6">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0"><HiStar className="w-4 h-4 text-yellow-500" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{review.user?.name}</span>
                    <span className="text-xs text-gray-400">on {review.restaurant?.name}</span>
                    <span className="text-xs text-gray-400">· {Array(review.rating).fill('⭐').join('')}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{review.comment?.slice(0, 120)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(s.recentNotifications || []).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <h3 className="font-semibold mb-4">System Notifications</h3>
          <div className="space-y-3">
            {s.recentNotifications.map((notif) => (
              <div key={notif._id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100"><HiBell className="w-4 h-4 text-gray-500" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;