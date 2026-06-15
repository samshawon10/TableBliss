

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiUsers, HiSearch, HiShieldCheck, HiExclamation, HiCheck, HiX, HiMail, HiPhone, HiRefresh } from 'react-icons/hi';
import Swal from 'sweetalert2';


const AdminOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchOwners(); }, []);

  const fetchOwners = async () => {
    try {
      const { data } = await adminAPI.getOwners({ search, limit: 50 });
      setOwners(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleVerify = async (id) => {
    try {
      await adminAPI.updateOwner(id, { isVerified: true });
      Swal.fire({ icon: 'success', title: 'Owner Verified' });
      fetchOwners();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed to verify' }); }
  };

  const handleActivate = async (id) => {
    try {
      await adminAPI.updateOwner(id, { isActive: true });
      Swal.fire({ icon: 'success', title: 'Owner Activated' });
      fetchOwners();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed to activate' }); }
  };

  const handleSuspend = async (id) => {
    const result = await Swal.fire({ title: 'Suspend Owner?', text: 'This will deactivate the owner account', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Suspend' });
    if (!result.isConfirmed) return;
    try {
      await adminAPI.updateOwner(id, { isActive: false });
      Swal.fire({ icon: 'info', title: 'Owner Suspended' });
      fetchOwners();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed to suspend' }); }
  };

  return (
    
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Restaurant Owners</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage all restaurant owner accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setTimeout(fetchOwners, 500); }} placeholder="Search owners..." className="input-field pl-9 text-sm w-64" />
            </div>
            <button onClick={fetchOwners} className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50"><HiRefresh className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left p-4 font-medium text-gray-500">Owner</th>
                <th className="text-left p-4 font-medium text-gray-500">Contact</th>
                <th className="text-left p-4 font-medium text-gray-500">Restaurants</th>
                <th className="text-left p-4 font-medium text-gray-500">Status</th>
                <th className="text-left p-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : owners.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No owners found</td></tr>
              ) : owners.map(owner => (
                <tr key={owner._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white">{owner.name?.[0] || 'O'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{owner.name}</p>
                        <p className="text-xs text-gray-500">{owner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <HiMail className="w-3.5 h-3.5 shrink-0" /> {owner.email}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <HiPhone className="w-3.5 h-3.5 shrink-0" /> {owner.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{owner.restaurantCount || owner.restaurants?.length || 0}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {owner.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                          <HiCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                          <HiExclamation className="w-3 h-3" /> Unverified
                        </span>
                      )}
                      {!owner.isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                          <HiX className="w-3 h-3" /> Suspended
                        </span>
                      )}
                      {owner.isActive && owner.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {!owner.isVerified && (
                        <button onClick={() => handleVerify(owner._id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/40 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/60 transition-colors">
                          <HiCheck className="w-3.5 h-3.5" /> Verify
                        </button>
                      )}
                      {owner.isActive ? (
                        <button onClick={() => handleSuspend(owner._id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-100 dark:bg-red-900/40 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors">
                          <HiX className="w-3.5 h-3.5" /> Suspend
                        </button>
                      ) : (
                        <button onClick={() => handleActivate(owner._id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/40 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors">
                          <HiCheck className="w-3.5 h-3.5" /> Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      );
};

export default AdminOwners;