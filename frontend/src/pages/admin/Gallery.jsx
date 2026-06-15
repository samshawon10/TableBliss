

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiTrash, HiPencil, HiPhotograph, HiSearch } from 'react-icons/hi';

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ caption: '', category: 'other' });

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    try {
      const { data } = await adminAPI.getGallery();
      setImages(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete image?',
      text: 'This cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
    });
    if (result.isConfirmed) {
      try {
        await adminAPI.deleteGalleryImage(id);
        Swal.fire({ icon: 'success', title: 'Deleted' });
        fetchGallery();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Delete failed' });
      }
    }
  };

  const handleEdit = (image) => {
    setEditModal(image._id);
    setEditForm({ caption: image.caption || '', category: image.category || 'other' });
  };

  const handleSaveEdit = async () => {
    try {
      await adminAPI.updateGalleryImage(editModal, editForm);
      Swal.fire({ icon: 'success', title: 'Updated' });
      setEditModal(null);
      fetchGallery();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Update failed' });
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Manage Gallery</h1>
        </div>

        <p className="mb-6 text-sm text-gray-500">View, edit, and delete all gallery images across restaurants.</p>

        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading...</p>
        ) : images.length === 0 ? (
          <div className="py-12 text-center">
            <HiPhotograph className="w-16 h-16 mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">No gallery images found</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <div key={img._id} className="overflow-hidden bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700 group">
                <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img src={img.image} alt={img.caption || 'Gallery'} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 transition-opacity opacity-0 bg-black/40 group-hover:opacity-100">
                    <button onClick={() => handleEdit(img)} className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600">
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(img._id)} className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{img.caption || 'No caption'}</p>
                  <p className="text-xs text-gray-500 capitalize">{img.category}</p>
                  <p className="text-xs text-gray-400 truncate">{img.restaurant?.name || 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditModal(null)}>
            <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-lg font-semibold">Edit Image Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Caption</label>
                  <input value={editForm.caption} onChange={(e) => setEditForm(p => ({ ...p, caption: e.target.value }))} placeholder="Image caption" className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select value={editForm.category} onChange={(e) => setEditForm(p => ({ ...p, category: e.target.value }))} className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="interior">Interior</option>
                    <option value="exterior">Exterior</option>
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                    <option value="events">Events</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm bg-gray-100 rounded-lg dark:bg-gray-700">Cancel</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 text-sm text-white bg-purple-500 rounded-lg hover:bg-purple-600">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;