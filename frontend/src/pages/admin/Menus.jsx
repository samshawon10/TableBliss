

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiTrash, HiDocumentText, HiPencil } from 'react-icons/hi';

const AdminMenus = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMenus(); }, []);

  const fetchMenus = async () => {
    try {
      const { data } = await adminAPI.getMenus();
      setMenus(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete menu?',
      text: 'This will remove all menu items within it.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
    });
    if (result.isConfirmed) {
      try {
        await adminAPI.deleteMenu(id);
        Swal.fire({ icon: 'success', title: 'Deleted' });
        fetchMenus();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Delete failed' });
      }
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold">Manage Menus</h1>
        <p className="mb-6 text-sm text-gray-500">Menu management interface — manage all restaurant menus.</p>

        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading...</p>
        ) : menus.length === 0 ? (
          <p className="py-12 text-center text-gray-500">No menus found</p>
        ) : (
          <div className="space-y-4">
            {menus.map((menu) => (
              <div key={menu._id} className="p-6 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiDocumentText className="w-6 h-6 text-primary-500" />
                    <div>
                      <h3 className="font-semibold">{menu.name}</h3>
                      <p className="text-sm text-gray-500">{menu.restaurant?.name || 'Unknown restaurant'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(menu._id)} className="flex items-center gap-1 px-3 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                      <HiTrash className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
                {menu.items?.length > 0 && (
                  <div className="grid gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 md:grid-cols-2">
                    {menu.items.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                          <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                        </div>
                        <span className="text-sm font-bold text-primary-500">${item.price}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(!menu.items || menu.items.length === 0) && (
                  <p className="pt-2 mt-2 text-sm text-gray-400 border-t border-gray-100 dark:border-gray-700">No items in this menu</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMenus;