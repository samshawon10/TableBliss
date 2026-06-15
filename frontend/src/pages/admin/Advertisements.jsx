

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiTrash, HiPencilAlt, HiPlus } from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminAdvertisements = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAds(); }, []);

  const fetchAds = async () => {
    try {
      const { data } = await adminAPI.getAdvertisements();
      setAds(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Delete Advertisement?', showCancelButton: true, confirmButtonColor: '#d33' });
    if (result.isConfirmed) {
      try { await adminAPI.deleteAdvertisement(id); Swal.fire({ icon: 'success', title: 'Deleted' }); fetchAds(); }
      catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await adminAPI.updateAdvertisement(id, { isActive: !isActive });
      Swal.fire({ icon: 'success', title: isActive ? 'Paused' : 'Activated' });
      fetchAds();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Advertisements</h2><p className="text-sm text-gray-500">Manage campaigns, promotions, and listings</p></div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="text-left p-4 font-medium text-gray-500">Restaurant</th>
            <th className="text-left p-4 font-medium text-gray-500">Status</th>
            <th className="text-left p-4 font-medium text-gray-500">Impressions</th>
            <th className="text-left p-4 font-medium text-gray-500">Clicks</th>
            <th className="text-left p-4 font-medium text-gray-500">CTR</th>
            <th className="text-left p-4 font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
            ads.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No advertisements</td></tr> :
            ads.map(ad => (
              <tr key={ad._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="p-4 font-medium">{ad.restaurant}</td>
                <td className="p-4">{ad.isActive ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Active</span> : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">Paused</span>}</td>
                <td className="p-4">{(ad.impressions || 0).toLocaleString()}</td>
                <td className="p-4">{(ad.clicks || 0).toLocaleString()}</td>
                <td className="p-4">{ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%</td>
                <td className="p-4"><div className="flex gap-2">
                  <button onClick={() => handleToggle(ad._id, ad.isActive)} className={`px-2 py-1 text-xs font-medium rounded-lg ${ad.isActive ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200' : 'text-green-700 bg-green-100 hover:bg-green-200'}`}>{ad.isActive ? 'Pause' : 'Activate'}</button>
                  <button onClick={() => handleDelete(ad._id)} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"><HiTrash className="w-3.5 h-3.5 inline" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminAdvertisements;