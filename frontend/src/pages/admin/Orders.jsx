

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiSearch, HiCheck, HiX, HiEye, HiCurrencyDollar } from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchOrders(); }, [page, status, search]);

  const fetchOrders = async () => {
    try {
      const { data } = await adminAPI.getOrders({ page, limit: 20, status, search });
      setOrders(data.data || []);
      setPagination(data.pagination || {});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(id, { status: newStatus });
      Swal.fire({ icon: 'success', title: 'Order Updated', text: `Status changed to ${newStatus}` });
      fetchOrders();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
  };

  const handleRefund = async (id) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Process Refund?', text: 'This will refund the order amount', showCancelButton: true, confirmButtonColor: '#d33' });
    if (result.isConfirmed) {
      try {
        await adminAPI.processRefund(id);
        Swal.fire({ icon: 'success', title: 'Refund Processed' });
        fetchOrders();
      } catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
    }
  };

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '⏳' },
    confirmed: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '✓' },
    completed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '✅' },
    cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '✕' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Orders</h2><p className="text-sm text-gray-500">Manage all orders and payments</p></div>
        <div className="flex gap-2">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="text-left p-4 font-medium text-gray-500">Order ID</th>
            <th className="text-left p-4 font-medium text-gray-500">Customer</th>
            <th className="text-left p-4 font-medium text-gray-500">Restaurant</th>
            <th className="text-left p-4 font-medium text-gray-500">Amount</th>
            <th className="text-left p-4 font-medium text-gray-500">Date</th>
            <th className="text-left p-4 font-medium text-gray-500">Status</th>
            <th className="text-left p-4 font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr> :
            orders.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">No orders found</td></tr> :
            orders.map(o => (
              <tr key={o._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="p-4 font-mono text-xs text-gray-400">{o._id?.slice(-8)}</td>
                <td className="p-4"><p className="font-medium">{o.user?.name || 'Guest'}</p><p className="text-xs text-gray-400">{o.user?.email}</p></td>
                <td className="p-4">{o.restaurant?.name || 'N/A'}</td>
                <td className="p-4 font-bold text-green-600">৳{(o.totalAmount || 0).toLocaleString()}</td>
                <td className="p-4 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[o.status]?.color || 'bg-gray-100 text-gray-700'}`}>{statusConfig[o.status]?.icon || ''} {o.status}</span></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {o.status === 'pending' && <button onClick={() => handleStatusUpdate(o._id, 'confirmed')} className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"><HiCheck className="w-3.5 h-3.5 inline" /> Confirm</button>}
                    {o.status === 'confirmed' && <button onClick={() => handleStatusUpdate(o._id, 'completed')} className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"><HiCheck className="w-3.5 h-3.5 inline" /> Complete</button>}
                    {o.status === 'confirmed' && <button onClick={() => handleRefund(o._id)} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"><HiCurrencyDollar className="w-3.5 h-3.5 inline" /> Refund</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.pages > 1 && <div className="flex justify-center gap-2 mt-4">{Array.from({ length: pagination.pages }, (_, i) => <button key={i + 1} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{i + 1}</button>)}</div>}
    </div>
  );
};
export default AdminOrders;