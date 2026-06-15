

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { HiPencilAlt, HiDocument, HiSave } from 'react-icons/hi';
import Swal from 'sweetalert2';

const AdminCMS = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    try {
      const { data } = await adminAPI.getCMSPages();
      setPages(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setSaving(true);
    try {
      await adminAPI.updateCMSPage(editingPage._id, { content: JSON.parse(content) });
      Swal.fire({ icon: 'success', title: 'Page Updated' });
      setEditingPage(null);
      fetchPages();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Invalid JSON or failed to save' }); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold">CMS Management</h2><p className="text-sm text-gray-500">Manage website pages, banners, and content</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold mb-4">Pages</h3>
          {loading ? <p className="text-gray-400 text-sm">Loading...</p> :
          <div className="space-y-2">
            {pages.map(page => (
              <button key={page._id} onClick={() => { setEditingPage(page); setContent(JSON.stringify(page.content, null, 2)); }} className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${editingPage?._id === page._id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}>
                <HiDocument className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{page.title}</p>
                  <p className="text-xs text-gray-400">{page.slug}</p>
                </div>
              </button>
            ))}
          </div>}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          {editingPage ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Editing: {editingPage.title}</h3>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50">
                  <HiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-3">Slug: {editingPage.slug}</p>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={20} className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-gray-50 dark:bg-gray-900 dark:border-gray-700" />
              <p className="text-xs text-gray-400 mt-2">Edit the JSON content above. Changes will be saved when you click Save.</p>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <HiDocument className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a page from the list to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminCMS;