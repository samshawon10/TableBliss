

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiSearch, HiStar, HiTrash, HiFilter } from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchReviews(); }, [page]);

  const fetchReviews = async () => {
    try {
      const { data } = await adminAPI.getReviews({ page, limit: 20 });
      setReviews(data.data || []);
      setPagination(data.pagination || {});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Delete Review?', text: 'This action cannot be undone', showCancelButton: true, confirmButtonColor: '#d33' });
    if (result.isConfirmed) {
      try { await adminAPI.deleteReview(id); Swal.fire({ icon: 'success', title: 'Review Deleted' }); fetchReviews(); }
      catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Reviews & Ratings</h2><p className="text-sm text-gray-500">Moderate customer reviews across all restaurants</p></div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="text-left p-4 font-medium text-gray-500">Customer</th>
            <th className="text-left p-4 font-medium text-gray-500">Restaurant</th>
            <th className="text-left p-4 font-medium text-gray-500">Rating</th>
            <th className="text-left p-4 font-medium text-gray-500">Review</th>
            <th className="text-left p-4 font-medium text-gray-500">Date</th>
            <th className="text-left p-4 font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
            reviews.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No reviews found</td></tr> :
            reviews.map(r => (
              <tr key={r._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="p-4"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-xs font-bold text-blue-600">{r.user?.name?.[0] || 'U'}</span></div><span className="font-medium">{r.user?.name || 'Anonymous'}</span></div></td>
                <td className="p-4">{r.restaurant?.name || 'N/A'}</td>
                <td className="p-4"><div className="flex gap-0.5">{renderStars(r.rating)}</div></td>
                <td className="p-4 max-w-xs truncate">{r.comment || r.review || 'No comment'}</td>
                <td className="p-4 text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="p-4"><button onClick={() => handleDelete(r._id)} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"><HiTrash className="w-3.5 h-3.5 inline" /> Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.pages > 1 && <div className="flex justify-center gap-2 mt-4">{Array.from({ length: pagination.pages }, (_, i) => <button key={i + 1} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{i + 1}</button>)}</div>}
    </div>
  );
};
export default AdminReviews;