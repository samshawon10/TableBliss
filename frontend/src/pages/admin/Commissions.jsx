

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiTrendingUp, HiCog, HiCash } from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminCommissions = () => {
  const [settings, setSettings] = useState({ globalRate: 10, type: 'percentage' });
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, analyticsRes] = await Promise.all([
        adminAPI.getCommissionSettings(),
        adminAPI.getCommissionAnalytics(),
      ]);
      setSettings(settingsRes.data.data || {});
      setAnalytics(analyticsRes.data.data || {});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateCommissionSettings(settings);
      Swal.fire({ icon: 'success', title: 'Commission Settings Updated' });
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold">Commission Management</h2><p className="text-sm text-gray-500">Manage global and restaurant-specific commission rates</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><HiCash className="w-5 h-5 text-green-600" /></div><div><p className="text-xs text-gray-500">Total Revenue</p><p className="text-xl font-bold">৳{(analytics.totalRevenue || 0).toLocaleString()}</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><HiTrendingUp className="w-5 h-5 text-purple-600" /></div><div><p className="text-xs text-gray-500">Platform Commission</p><p className="text-xl font-bold">৳{(analytics.platformCommission || 0).toLocaleString()}</p></div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><HiCog className="w-5 h-5 text-blue-600" /></div><div><p className="text-xs text-gray-500">Commission Rate</p><p className="text-xl font-bold">{settings.globalRate || 0}%</p></div></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4">Global Commission Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Commission Type</label>
            <select value={settings.type || 'percentage'} onChange={e => setSettings({ ...settings, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rate {settings.type === 'percentage' ? '(%)' : '(৳)'}</label>
            <input type="number" value={settings.globalRate || ''} onChange={e => setSettings({ ...settings, globalRate: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" min="0" max={settings.type === 'percentage' ? 50 : 10000} />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50">{saving ? 'Saving...' : 'Save Settings'}</button>
      </div>
    </div>
  );
};
export default AdminCommissions;