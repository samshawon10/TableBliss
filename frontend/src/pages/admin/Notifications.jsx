

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiBell, HiMail, HiChat, HiUsers } from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminNotifications = () => {
  const [form, setForm] = useState({ type: 'announcement', title: '', message: '', recipients: 'all' });
  const [sending, setSending] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => { fetchRecent(); }, []);

  const fetchRecent = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setRecentNotifications(data.data?.recentNotifications || []);
    } catch (e) { console.error(e); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return Swal.fire({ icon: 'warning', title: 'Fill all fields' });
    setSending(true);
    try {
      await adminAPI.sendNotification(form);
      Swal.fire({ icon: 'success', title: 'Notification Sent', text: `Sent to ${form.recipients}` });
      setForm({ type: 'announcement', title: '', message: '', recipients: 'all' });
      fetchRecent();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Sending Failed' }); }
    finally { setSending(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Notification Center</h2>
        <p className="text-sm text-gray-500">Send and manage platform-wide notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold mb-4 flex items-center gap-2"><HiBell className="w-5 h-5 text-purple-500" /> Send New Notification</h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700">
                <option value="announcement">Announcement</option>
                <option value="promotion">Promotion</option>
                <option value="alert">Alert</option>
                <option value="update">System Update</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recipients</label>
              <select value={form.recipients} onChange={e => setForm({ ...form, recipients: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700">
                <option value="all">All Users</option>
                <option value="owners">Restaurant Owners</option>
                <option value="customers">Customers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="Notification title" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 dark:border-gray-700" placeholder="Write your message..." />
            </div>
            <button type="submit" disabled={sending} className="w-full py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold mb-4 flex items-center gap-2"><HiMail className="w-5 h-5 text-blue-500" /> Recent Notifications</h3>
          <div className="space-y-3">
            {recentNotifications.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No recent notifications</p> :
            recentNotifications.map((n, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="font-medium text-sm">{n.title || 'Notification'}</p>
                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Send Templates */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'System Maintenance', message: 'Scheduled maintenance on [date]. Service may be temporarily unavailable.', type: 'announcement' },
            { title: 'New Feature', message: 'We have launched new features! Check them out now.', type: 'update' },
            { title: 'Promotional Offer', message: 'Get 20% off on your next reservation with code TABLEBLISS20.', type: 'promotion' },
          ].map((t, i) => (
            <button key={i} onClick={() => setForm({ ...form, ...t })} className="p-3 text-left bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition">
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-gray-500 mt-1">{t.message.slice(0, 60)}...</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdminNotifications;