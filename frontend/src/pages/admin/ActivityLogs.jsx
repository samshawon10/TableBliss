

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiClock, HiUser, HiGlobeAlt, HiRefresh } from 'react-icons/hi';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchLogs(); }, [page]);

  const fetchLogs = async () => {
    try {
      const { data } = await adminAPI.getActivityLogs({ page, limit: 50 });
      setLogs(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const actionIcons = {
    'User registered': '👤',
    'Reservation confirmed': '✅',
    'Reservation pending': '⏳',
    'Reservation completed': '🎉',
    'Reservation cancelled': '❌',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Activity Logs</h2><p className="text-sm text-gray-500">Audit logs, security monitoring, and user activities</p></div>
        <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200"><HiRefresh className="w-4 h-4" /> Refresh</button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> :
        logs.length === 0 ? <div className="text-center py-12 text-gray-400">No activity logs found</div> :
        <div className="space-y-0">
          {logs.map((log, i) => (
            <div key={log._id || i} className="flex items-start gap-4 p-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-lg flex-shrink-0">
                {actionIcons[log.action] || '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{log.user || 'System'}</span>
                  <span className="text-gray-400 text-sm">·</span>
                  <span className="text-sm text-purple-600">{log.action}</span>
                </div>
                {log.target && <p className="text-xs text-gray-400 mt-1">Target: {log.target}</p>}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</span>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
};
export default AdminActivityLogs;