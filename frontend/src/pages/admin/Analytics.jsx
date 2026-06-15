

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiTrendingUp, HiChartBar, HiUsers, HiOfficeBuilding } from 'react-icons/hi';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, statsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getStats(),
      ]);
      setAnalytics(analyticsRes.data.data || {});
      setStats(statsRes.data.data || {});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const renderChart = (data, label, color = 'purple') => {
    if (!data || data.length === 0) return <p className="text-gray-400 text-sm text-center py-4">No data available</p>;
    const max = Math.max(...data.map(d => d.count));
    return (
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs font-medium w-16 text-gray-500">{d._id}</span>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
              <div className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full`} style={{ width: `${(d.count / max) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{d.count}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading analytics...</div>;

  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold">Analytics & Reports</h2><p className="text-sm text-gray-500">Platform analytics, user growth, and detailed reports</p></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><HiUsers className="w-5 h-5 text-blue-600" /></div><div><p className="text-xs text-gray-500">Total Users</p><p className="text-xl font-bold">{stats.totalUsers || 0}</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><HiOfficeBuilding className="w-5 h-5 text-purple-600" /></div><div><p className="text-xs text-gray-500">Restaurants</p><p className="text-xl font-bold">{stats.totalRestaurants || 0}</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><HiTrendingUp className="w-5 h-5 text-green-600" /></div><div><p className="text-xs text-gray-500">Reservations</p><p className="text-xl font-bold">{stats.totalReservations || 0}</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><HiChartBar className="w-5 h-5 text-yellow-600" /></div><div><p className="text-xs text-gray-500">Conversion</p><p className="text-xl font-bold">{(analytics.conversionRate || 0).toFixed(1)}%</p></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">User Growth (6 months)</h3>
          {renderChart(analytics.userGrowth, 'Users')}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Restaurant Growth (6 months)</h3>
          {renderChart(analytics.restaurantGrowth, 'Restaurants')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Reservation Trends (6 months)</h3>
          {renderChart(analytics.reservationGrowth, 'Reservations')}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Popular Restaurants</h3>
          {analytics.popularRestaurants?.length > 0 ? (
            <div className="space-y-3">
              {analytics.popularRestaurants.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-purple-500">#{i + 1}</span>
                  <span className="text-sm flex-1">{r.restaurant?.name || 'Unknown'}</span>
                  <span className="text-xs text-gray-400">{r.bookings} bookings</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-4">No data available</p>}
        </div>
      </div>
    </div>
  );
};
export default AdminAnalytics;