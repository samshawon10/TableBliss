

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiCog, HiGlobe, HiCreditCard, HiMail, HiSearch, HiBell, HiSave } from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('platform');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await adminAPI.getSettings();
      setSettings(data.data || {});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      Swal.fire({ icon: 'success', title: 'Settings Updated' });
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed to save' }); }
    finally { setSaving(false); }
  };

  const updateField = (section, field, value) => {
    setSettings({ ...settings, [section]: { ...settings[section], [field]: value } });
  };

  const tabs = [
    { key: 'platform', label: 'Platform', icon: HiGlobe },
    { key: 'payments', label: 'Payments', icon: HiCreditCard },
    { key: 'email', label: 'Email', icon: HiMail },
    { key: 'seo', label: 'SEO', icon: HiSearch },
    { key: 'notifications', label: 'Notifications', icon: HiBell },
  ];

  if (loading) return <div className="text-center py-12 text-gray-400">Loading settings...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">System Settings</h2><p className="text-sm text-gray-500">Configure platform settings, payments, and more</p></div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50">
          <HiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${tab === t.key ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>{<t.icon className="w-4 h-4" />}{t.label}</button>)}
      </div>

      {/* Platform Settings */}
      {tab === 'platform' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-lg">Platform Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Platform Name</label><input value={settings.platform?.name || ''} onChange={e => updateField('platform', 'name', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" /></div>
            <div><label className="block text-sm font-medium mb-1">Tagline</label><input value={settings.platform?.tagline || ''} onChange={e => updateField('platform', 'tagline', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" /></div>
            <div><label className="block text-sm font-medium mb-1">Contact Email</label><input value={settings.platform?.email || ''} onChange={e => updateField('platform', 'email', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input value={settings.platform?.phone || ''} onChange={e => updateField('platform', 'phone', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" /></div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {tab === 'payments' && (
        <div className="space-y-4">
          {['sslcommerz', 'stripe', 'paypal'].map(gateway => (
            <div key={gateway} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg capitalize">{gateway}</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.payments?.[gateway]?.enabled || false} onChange={e => updateField('payments', gateway, { ...settings.payments?.[gateway], enabled: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
              {gateway === 'sslcommerz' && <div><label className="block text-sm mb-1">Merchant ID</label><input value={settings.payments?.sslcommerz?.merchantId || ''} onChange={e => updateField('payments', 'sslcommerz', { ...settings.payments?.sslcommerz, merchantId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="Enter merchant ID" /></div>}
              {gateway === 'stripe' && <div><label className="block text-sm mb-1">Publishable Key</label><input value={settings.payments?.stripe?.publishableKey || ''} onChange={e => updateField('payments', 'stripe', { ...settings.payments?.stripe, publishableKey: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="pk_test_..." /></div>}
              {gateway === 'paypal' && <div><label className="block text-sm mb-1">Client ID</label><input value={settings.payments?.paypal?.clientId || ''} onChange={e => updateField('payments', 'paypal', { ...settings.payments?.paypal, clientId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="Enter client ID" /></div>}
            </div>
          ))}
        </div>
      )}

      {/* Email Settings */}
      {tab === 'email' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-lg">Email Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">SMTP Host</label><input value={settings.email?.smtpHost || ''} onChange={e => updateField('email', 'smtpHost', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" /></div>
            <div><label className="block text-sm font-medium mb-1">SMTP Port</label><input value={settings.email?.smtpPort || ''} onChange={e => updateField('email', 'smtpPort', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">From Email</label><input value={settings.email?.fromEmail || ''} onChange={e => updateField('email', 'fromEmail', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" /></div>
          </div>
        </div>
      )}

      {/* SEO Settings */}
      {tab === 'seo' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-lg">SEO Settings</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Site Title</label><input value={settings.seo?.title || ''} onChange={e => updateField('seo', 'title', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" /></div>
            <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={settings.seo?.description || ''} onChange={e => updateField('seo', 'description', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" /></div>
            <div><label className="block text-sm font-medium mb-1">Keywords</label><input value={settings.seo?.keywords || ''} onChange={e => updateField('seo', 'keywords', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="comma separated keywords" /></div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {tab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-lg">Notification Preferences</h3>
          {['emailEnabled', 'smsEnabled', 'pushEnabled'].map(key => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <span className="text-sm font-medium capitalize">{key.replace('Enabled', '')} Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.notifications?.[key] || false} onChange={e => updateField('notifications', key, e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminSettings;