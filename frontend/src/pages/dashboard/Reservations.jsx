

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reservationAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiCalendar, HiLocationMarker, HiClock, HiUserGroup, HiX, HiEye } from 'react-icons/hi';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await reservationAPI.getAll(params);
      setReservations(data.data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'Cancel reservation?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it',
    });

    if (result.isConfirmed) {
      try {
        await reservationAPI.cancel(id);
        Swal.fire({ icon: 'success', title: 'Cancelled!' });
        fetchReservations();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Failed to cancel' });
      }
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    'no-show': 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Reservations</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your table bookings</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center py-12 text-gray-500">Loading...</p>
          ) : reservations.length === 0 ? (
            <div className="text-center py-12">
              <HiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reservations found</p>
              <Link to="/restaurants" className="btn-primary mt-4 inline-flex">Browse Restaurants</Link>
            </div>
          ) : (
            reservations.map((res, i) => (
              <motion.div
                key={res._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <HiCalendar className="w-8 h-8 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{res.restaurant?.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><HiCalendar className="w-4 h-4" />{new Date(res.reservationDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><HiClock className="w-4 h-4" />{res.timeSlot}</span>
                        <span className="flex items-center gap-1"><HiUserGroup className="w-4 h-4" />{res.guestCount} guests</span>
                      </div>
                      {res.table && (
                        <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Table {res.table.tableNumber || res.table}</span>
                          {res.table.section && <span className="capitalize text-xs">{res.table.section}</span>}
                        </div>
                      )}
                      {res.selectedItems && res.selectedItems.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-gray-500">Menu Items:</p>
                          {res.selectedItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-gray-500">
                              <span>{item.name} × {item.quantity}</span>
                              <span className="font-medium text-primary-500">৳{item.price * item.quantity}</span>
                            </div>
                          ))}
                          {res.totalAmount > 0 && (
                            <div className="flex items-center justify-between text-xs font-medium pt-1 border-t border-gray-100 dark:border-gray-700">
                              <span>Total</span>
                              <span className="text-primary-500">৳{res.totalAmount}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[res.status]}`}>{res.status}</span>
                    {['pending', 'confirmed'].includes(res.status) && (
                      <button onClick={() => handleCancel(res._id)} className="btn-danger text-sm py-1.5 px-3">Cancel</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;