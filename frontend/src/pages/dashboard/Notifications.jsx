

import { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { HiBell, HiCheck, HiTrash } from 'react-icons/hi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.data);
    } catch (error) {} finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {}
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {}
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400">Stay updated with your reservations</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllAsRead} className="text-sm text-primary-500 hover:text-primary-600">Mark all as read</button>
          )}
        </div>

        <div className="space-y-3">
          {loading ? <p className="text-center py-12 text-gray-500">Loading...</p> :
           notifications.length === 0 ? (
            <div className="text-center py-12">
              <HiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : notifications.map((n) => (
            <div key={n._id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border ${n.isRead ? 'border-gray-100 dark:border-gray-700' : 'border-primary-200 dark:border-primary-800'} flex items-start gap-4`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
                <HiBell className={`w-5 h-5 ${n.isRead ? 'text-gray-400' : 'text-primary-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.isRead ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-gray-900 dark:text-white'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && <button onClick={() => markAsRead(n._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><HiCheck className="w-4 h-4 text-green-500" /></button>}
                <button onClick={() => deleteNotification(n._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><HiTrash className="w-4 h-4 text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;