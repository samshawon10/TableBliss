

import { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiStar, HiReply } from 'react-icons/hi';

const OwnerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await ownerAPI.getReviews();
      setReviews(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await ownerAPI.respondToReview(replyModal, { message: replyText });
      Swal.fire({ icon: 'success', title: 'Reply sent' });
      setReplyModal(null); setReplyText('');
      fetchReviews();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Failed to reply' }); }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">My Reviews</h1>
        {loading ? <p className="text-center py-12 text-gray-500">Loading...</p> :
         reviews.length === 0 ? <p className="text-center py-12 text-gray-500">No reviews yet</p> :
         <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600">{review.user?.name?.charAt(0)}</div>
                    <div><p className="font-medium text-sm">{review.user?.name}</p><p className="text-xs text-gray-500">{review.restaurant?.name}</p></div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map((s) => <HiStar key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                </div>
                {!review.response && (
                  <button onClick={() => setReplyModal(review._id)} className="flex items-center gap-1 text-xs px-3 py-1 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200"><HiReply />Reply</button>
                )}
              </div>
              {review.response && (
                <div className="mt-4 ml-8 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Owner reply:</p>
                  <p className="text-sm">{review.response.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>}

        {replyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setReplyModal(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold mb-3">Reply to Review</h3>
              <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full border rounded-lg p-3 text-sm dark:bg-gray-700 dark:border-gray-600" rows={4} placeholder="Write your reply..." />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setReplyModal(null)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700">Cancel</button>
                <button onClick={handleReply} className="px-4 py-2 text-sm rounded-lg bg-primary-500 text-white">Send Reply</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerReviews;