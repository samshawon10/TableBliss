

import { useState, useEffect } from 'react';
import { adminAPI, reservationAPI } from '../../services/api';
import Swal from 'sweetalert2';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchReservations(); }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminAPI.getReservations(params);
      setReservations(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await reservationAPI.updateStatus(id, { status });
      Swal.fire({ icon: 'success', title: `Reservation ${status}` });
      fetchReservations();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Update failed' }); }
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
        <h1 className="text-2xl font-bold mb-8">Manage Reservations</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${statusFilter === status ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600'}`}>
              {status || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Customer</th>
                  <th className="text-left p-4 text-sm font-medium">Restaurant</th>
                  <th className="text-left p-4 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-sm font-medium">Time</th>
                  <th className="text-left p-4 text-sm font-medium">Guests</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {reservations.map((res) => (
                  <tr key={res._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4 font-medium">{res.user?.name}</td>
                    <td className="p-4 text-sm">{res.restaurant?.name}</td>
                    <td className="p-4 text-sm">{new Date(res.reservationDate).toLocaleDateString()}</td>
                    <td className="p-4 text-sm">{res.timeSlot}</td>
                    <td className="p-4 text-sm">{res.guestCount}</td>
                    <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[res.status]}`}>{res.status}</span></td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {res.status === 'pending' && (
                          <button onClick={() => handleStatusUpdate(res._id, 'confirmed')} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded">Confirm</button>
                        )}
                        {['pending', 'confirmed'].includes(res.status) && (
                          <button onClick={() => handleStatusUpdate(res._id, 'cancelled')} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded">Cancel</button>
                        )}
                        {res.status === 'confirmed' && (
                          <button onClick={() => handleStatusUpdate(res._id, 'completed')} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded">Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;