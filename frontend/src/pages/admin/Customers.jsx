

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiSearch, HiCheck, HiX, HiEye, HiMail } from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchCustomers(); }, [page, search]);

  const fetchCustomers = async () => {
    try {
      const { data } = await adminAPI.getCustomers({ page, limit: 20, search });
      setCustomers(data.data || []);
      setPagination(data.pagination || {});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSuspend = async (id) => {
    try {
      await adminAPI.updateUser(id, { isActive: false });
      Swal.fire({ icon: 'info', title: 'Customer Suspended' });
      fetchCustomers();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
  };

  const handleReactivate = async (id) => {
    try {
      await adminAPI.updateUser(id, { isActive: true });
      Swal.fire({ icon: 'success', title: 'Customer Reactivated' });
      fetchCustomers();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Delete Customer?', text: 'This action cannot be undone', showCancelButton: true, confirmButtonColor: '#d33' });
    if (result.isConfirmed) {
      try { await adminAPI.deleteUser(id); Swal.fire({ icon: 'success', title: 'Deleted' }); fetchCustomers(); }
      catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Customers</h2><p className="text-sm text-gray-500">Manage all customer accounts</p></div>
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 dark:border-gray-700"><th className="text-left p-4 font-medium text-gray-500">Customer</th><th className="text-left p-4 font-medium text-gray-500">Contact</th><th className="text-left p-4 font-medium text-gray-500">Reservations</th><th className="text-left p-4 font-medium text-gray-500">Reviews</th><th className="text-left p-4 font-medium text-gray-500">Status</th><th className="text-left p-4 font-medium text-gray-500">Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
            customers.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No customers found</td></tr> :
            customers.map(c => (
              <tr key={c._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"><span className="text-sm font-bold text-blue-600">{c.name?.[0] || 'C'}</span></div><div><p className="font-medium">{c.name}</p><p className="text-xs text-gray-500">Joined {new Date(c.createdAt).toLocaleDateString()}</p></div></div></td>
                <td className="p-4"><p className="text-sm">{c.email}</p><p className="text-xs text-gray-400">{c.phone || 'No phone'}</p></td>
                <td className="p-4"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{c.reservationCount || 0}</span></td>
                <td className="p-4"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">{c.reviewCount || 0}</span></td>
                <td className="p-4">{c.isActive !== false ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Active</span> : <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">Suspended</span>}</td>
                <td className="p-4"><div className="flex gap-2">
                  {c.isActive !== false ? <button onClick={() => handleSuspend(c._id)} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"><HiX className="w-3.5 h-3.5 inline" /> Suspend</button> : <button onClick={() => handleReactivate(c._id)} className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"><HiCheck className="w-3.5 h-3.5 inline" /> Reactivate</button>}
                  <button onClick={() => handleDelete(c._id)} className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Delete</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.pages > 1 && <div className="flex justify-center gap-2 mt-4">{Array.from({ length: pagination.pages }, (_, i) => <button key={i + 1} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{i + 1}</button>)}</div>}
    </div>
  );
};
export default AdminCustomers;