

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiSearch, HiCheck, HiX, HiMail, HiClock } from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchTickets(); }, [page, statusFilter]);

  const fetchTickets = async () => {
    try {
      const { data } = await adminAPI.getSupportTickets({ page, limit: 20, status: statusFilter });
      setTickets(data.data || []);
      setPagination(data.pagination || {});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleResolve = async (id) => {
    try {
      await adminAPI.updateTicketStatus(id, { status: 'resolved' });
      Swal.fire({ icon: 'success', title: 'Ticket Resolved' });
      fetchTickets();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await adminAPI.replyTicket(selectedTicket._id, { message: replyText });
      Swal.fire({ icon: 'success', title: 'Reply Sent' });
      setShowModal(false);
      setReplyText('');
      handleResolve(selectedTicket._id);
    } catch (e) { Swal.fire({ icon: 'error', title: 'Failed' }); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold">Support Tickets</h2><p className="text-sm text-gray-500">Manage customer support requests</p></div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <option value="">All Tickets</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="text-left p-4 font-medium text-gray-500">Subject</th>
            <th className="text-left p-4 font-medium text-gray-500">From</th>
            <th className="text-left p-4 font-medium text-gray-500">Message</th>
            <th className="text-left p-4 font-medium text-gray-500">Date</th>
            <th className="text-left p-4 font-medium text-gray-500">Status</th>
            <th className="text-left p-4 font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr> :
            tickets.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No tickets found</td></tr> :
            tickets.map(t => (
              <tr key={t._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="p-4 font-medium">{t.subject || 'No Subject'}</td>
                <td className="p-4"><p>{t.name || 'Unknown'}</p><p className="text-xs text-gray-400">{t.email}</p></td>
                <td className="p-4 max-w-xs truncate text-gray-500">{t.message}</td>
                <td className="p-4 text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="p-4">{t.isResolved ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Resolved</span> : <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Open</span>}</td>
                <td className="p-4"><div className="flex gap-2">
                  <button onClick={() => { setSelectedTicket(t); setShowModal(true); }} className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"><HiMail className="w-3.5 h-3.5 inline" /> Reply</button>
                  {!t.isResolved && <button onClick={() => handleResolve(t._id)} className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"><HiCheck className="w-3.5 h-3.5 inline" /> Resolve</button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.pages > 1 && <div className="flex justify-center gap-2 mt-4">{Array.from({ length: pagination.pages }, (_, i) => <button key={i + 1} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{i + 1}</button>)}</div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold mb-4">Reply to {selectedTicket?.name}</h3>
            <p className="text-sm text-gray-500 mb-2">Subject: {selectedTicket?.subject || 'No Subject'}</p>
            <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">{selectedTicket?.message}</p>
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900" placeholder="Type your reply..." />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleReply} className="px-4 py-2 text-sm text-white bg-purple-500 rounded-lg hover:bg-purple-600">Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminSupport;