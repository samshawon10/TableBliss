

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiCash, HiTrendingUp, HiTrendingDown, HiCalendar, HiSearch } from 'react-icons/hi';

const AdminFinance = () => {
  const [period, setPeriod] = useState('monthly');
  const [revenue, setRevenue] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchRevenue(); fetchTransactions(); }, [period, page]);

  const fetchRevenue = async () => {
    try {
      const { data } = await adminAPI.getRevenue({ period });
      setRevenue(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await adminAPI.getTransactions({ page, limit: 20 });
      setTransactions(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalBookings = revenue.reduce((sum, r) => sum + (r.count || 0), 0);
  const avgPerBooking = totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(0) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Revenue Dashboard</h2><p className="text-sm text-gray-500">Platform revenue and financial overview</p></div>
        <div className="flex gap-2">
          {['daily', 'monthly'].map(p => <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${period === p ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>{p === 'daily' ? 'Daily' : 'Monthly'}</button>)}
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><HiCash className="w-5 h-5 text-green-600" /></div><div><p className="text-xs text-gray-500">Total Revenue</p><p className="text-xl font-bold text-green-600">৳{totalRevenue.toLocaleString()}</p></div></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"><HiTrendingUp className="w-5 h-5 text-purple-600" /></div><div><p className="text-xs text-gray-500">Total Bookings</p><p className="text-xl font-bold text-purple-600">{totalBookings.toLocaleString()}</p></div></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><HiTrendingDown className="w-5 h-5 text-blue-600" /></div><div><p className="text-xs text-gray-500">Avg per Booking</p><p className="text-xl font-bold text-blue-600">৳{avgPerBooking}</p></div></div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {['overview', 'transactions'].map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${tab === t ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>{t === 'overview' ? 'Revenue Chart' : 'Transactions'}</button>)}
          </div>

          {tab === 'overview' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 mb-6">
              <h3 className="font-semibold mb-4">Revenue Overview ({period})</h3>
              {revenue.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No revenue data available</p> :
                <div className="space-y-2">
                  {revenue.map((r, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-20 text-gray-500">{r._id}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${Math.min((r.amount / Math.max(...revenue.map(x => x.amount))) * 100, 100)}%` }}>
                          <span className="text-xs text-white font-medium">৳{r.amount?.toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right">{r.count} bookings</span>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {tab === 'transactions' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left p-4 font-medium text-gray-500">Restaurant</th>
                  <th className="text-left p-4 font-medium text-gray-500">Amount</th>
                  <th className="text-left p-4 font-medium text-gray-500">Date</th>
                </tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="p-4">{t.user?.name || 'Guest'}</td>
                      <td className="p-4">{t.restaurant?.name || 'N/A'}</td>
                      <td className="p-4 font-medium text-green-600">৳{(t.totalAmount || 0).toLocaleString()}</td>
                      <td className="p-4 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default AdminFinance;
