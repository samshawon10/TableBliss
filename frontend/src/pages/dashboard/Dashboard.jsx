

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reservationAPI, reviewAPI } from '../../services/api';
import { HiCalendar, HiHeart, HiBell, HiUser, HiStar, HiArrowRight, HiClock, HiCheckCircle, HiXCircle, HiTrendingUp, HiRefresh, HiLocationMarker } from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ upcoming: 0, past: 0, cancelled: 0, total: 0 });
  const [recentReservations, setRecentReservations] = useState([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const { data } = await reservationAPI.getAll({ limit: 10 });
      const reservations = data.data || [];
      setRecentReservations(reservations);
      const upcoming = reservations.filter(r => ['pending', 'confirmed'].includes(r.status)).length;
      const past = reservations.filter(r => ['completed', 'no-show'].includes(r.status)).length;
      const cancelled = reservations.filter(r => r.status === 'cancelled').length;
      setStats({ upcoming, past, cancelled, total: reservations.length });

      // Monthly trends for chart
      const monthlyData = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = months[d.getMonth()];
        monthlyData[key] = 0;
      }
      reservations.forEach(r => {
        const d = new Date(r.createdAt);
        const key = months[d.getMonth()];
        if (monthlyData[key] !== undefined) monthlyData[key]++;
      });
      setMonthlyReservations(Object.entries(monthlyData).map(([month, count]) => ({ month, count })));
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const [monthlyReservations, setMonthlyReservations] = useState([]);
  const maxMonthly = Math.max(...monthlyReservations.map(m => m.count), 1);

  const sidebarLinks = [
    { to: '/dashboard', label: 'Overview', icon: HiStar, exact: true },
    { to: '/dashboard/reservations', label: 'My Reservations', icon: HiCalendar },
    { to: '/dashboard/favorites', label: 'Favorites', icon: HiHeart },
    { to: '/dashboard/notifications', label: 'Notifications', icon: HiBell },
    { to: '/dashboard/profile', label: 'Profile', icon: HiUser },
    { to: '/dashboard/settings', label: 'Settings', icon: HiUser },
  ];

  const statCards = [
    { label: 'Upcoming', value: stats.upcoming, icon: HiClock, color: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600', textColor: 'text-blue-600' },
    { label: 'Completed', value: stats.past, icon: HiCheckCircle, color: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600', textColor: 'text-green-600' },
    { label: 'Cancelled', value: stats.cancelled, icon: HiXCircle, color: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-600', textColor: 'text-red-600' },
    { label: 'Favorites', value: user?.favorites?.length || 0, icon: HiHeart, color: 'bg-pink-50 dark:bg-pink-900/20', iconColor: 'text-pink-600', textColor: 'text-pink-600' },
    { label: 'Total Bookings', value: stats.total, icon: HiTrendingUp, color: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600', textColor: 'text-purple-600' },
  ];

  const statusConfig = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    'no-show': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
  };

  if (loading) return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h1>
            <p className="text-gray-500 text-sm">Here's your dining overview</p>
          </div>
          <button onClick={fetchAll} className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50">
            <HiRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className={`${card.color} rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700`}>
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Reservations Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Your Reservations (6 months)</h3>
            <div className="flex items-end justify-around h-36">
              {monthlyReservations.length === 0 ? (
                <p className="text-sm text-gray-400 self-center">No data yet</p>
              ) : monthlyReservations.map((m, i) => {
                const height = (m.count / maxMonthly) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium">{m.count}</span>
                    <div className="w-8 rounded-t bg-gradient-to-t from-purple-500 to-purple-400" style={{ height: `${Math.max(height, 4)}%` }} />
                    <span className="text-[10px] text-gray-400">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reservation Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Status Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Upcoming', count: stats.upcoming, color: 'bg-blue-500' },
                { label: 'Completed', count: stats.past, color: 'bg-green-500' },
                { label: 'Cancelled', count: stats.cancelled, color: 'bg-red-500' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.label}</span>
                    <span className="text-gray-500">{s.count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${stats.total > 0 ? (s.count / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/restaurants" className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
                <HiCalendar className="w-5 h-5 text-purple-500" />
                <div><p className="text-sm font-medium">Book a Table</p><p className="text-xs text-gray-500">Find restaurants</p></div>
              </Link>
              <Link to="/dashboard/reservations" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                <HiClock className="w-5 h-5 text-blue-500" />
                <div><p className="text-sm font-medium">My Bookings</p><p className="text-xs text-gray-500">View all reservations</p></div>
              </Link>
              <Link to="/dashboard/favorites" className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition">
                <HiHeart className="w-5 h-5 text-pink-500" />
                <div><p className="text-sm font-medium">Favorites</p><p className="text-xs text-gray-500">{user?.favorites?.length || 0} restaurants saved</p></div>
              </Link>
              <Link to="/dashboard/notifications" className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition">
                <HiBell className="w-5 h-5 text-green-500" />
                <div><p className="text-sm font-medium">Notifications</p><p className="text-xs text-gray-500">Stay updated</p></div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold">Recent Reservations</h3>
            <Link to="/dashboard/reservations" className="text-sm text-purple-500 hover:underline flex items-center gap-1">
              View All <HiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-500">Restaurant</th>
                  <th className="text-left p-4 font-medium text-gray-500">Date & Time</th>
                  <th className="text-left p-4 font-medium text-gray-500">Guests</th>
                  <th className="text-left p-4 font-medium text-gray-500">Amount</th>
                  <th className="text-left p-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No reservations yet</td></tr>
                ) : recentReservations.map((res) => (
                  <tr key={res._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <HiLocationMarker className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">{res.restaurant?.name}</p>
                          <p className="text-xs text-gray-500">Table {res.table?.tableNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p>{new Date(res.reservationDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{res.timeSlot}</p>
                    </td>
                    <td className="p-4">{res.guestCount} guests</td>
                    <td className="p-4 font-medium">{res.totalAmount ? `৳${res.totalAmount}` : 'Free'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[res.status]?.bg || 'bg-gray-100'} ${statusConfig[res.status]?.text || 'text-gray-700'}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar-style Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Dashboard Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sidebarLinks.filter(l => l.to !== '/dashboard').map((link) => (
              <Link key={link.to} to={link.to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
                <link.icon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;