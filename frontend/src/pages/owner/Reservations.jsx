

import { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiCalendar, HiClock, HiUserGroup } from 'react-icons/hi';

const OwnerReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchReservations(); }, [statusFilter]);

  const fetchReservations = async () => {
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await ownerAPI.getReservations(params);
      setReservations(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await ownerAPI.updateReservationStatus(id, { status });
      Swal.fire({ icon: 'success', title: `Reservation ${status}` });
      fetchReservations();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Update failed' }); }
  };

  const statusColors = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', completed: 'bg-blue-100 text-blue-700' };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">My Reservations</h1>
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${statusFilter === status ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600'}`}>
              {status || 'All'}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {loading ? <p className="text-center py-12 text-gray-500">Loading...</p> :
           reservations.length === 0 ? <p className="text-center py-12 text-gray-500">No reservations found</p> :
           reservations.map((res) => (
            <div key={res._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center"><HiCalendar className="w-6 h-6 text-primary-500" /></div>
                  <div>
                    <p className="font-semibold">{res.user?.name} ({res.user?.email})</p>
                    <p className="text-sm text-gray-500">{res.restaurant?.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{new Date(res.reservationDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><HiClock className="w-4 h-4" />{res.timeSlot}</span>
                      <span className="flex items-center gap-1"><HiUserGroup className="w-4 h-4" />{res.guestCount}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[res.status]}`}>{res.status}</span>
                  {res.status === 'pending' && <div className="flex gap-2">
                    <button onClick={() => handleStatusUpdate(res._id, 'confirmed')} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded">Confirm</button>
                    <button onClick={() => handleStatusUpdate(res._id, 'cancelled')} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded">Cancel</button>
                  </div>}
                  {res.status === 'confirmed' && <button onClick={() => handleStatusUpdate(res._id, 'completed')} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded">Complete</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerReservations;