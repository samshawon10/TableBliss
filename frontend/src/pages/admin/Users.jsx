

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiSearch, HiTrash } from 'react-icons/hi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.updateUser(id, { role });
      Swal.fire({ icon: 'success', title: 'Role updated' });
      fetchUsers();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Update failed' }); }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await adminAPI.updateUser(id, { isActive: !isActive });
      fetchUsers();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Update failed' }); }
  };

  const handleDeleteUser = async (id, userName) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: `Delete ${userName}?`,
      text: 'This action cannot be undone.',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete',
    });
    if (result.isConfirmed) {
      try {
        await adminAPI.deleteUser(id);
        Swal.fire({ icon: 'success', title: 'User deleted' });
        fetchUsers();
      } catch (error) { Swal.fire({ icon: 'error', title: 'Delete failed' }); }
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <div className="relative w-64">
            <HiSearch className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 input-field" onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} />
          </div>
        </div>

        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-4 text-sm font-medium text-left">User</th>
                  <th className="p-4 text-sm font-medium text-left">Email</th>
                  <th className="p-4 text-sm font-medium text-left">Role</th>
                  <th className="p-4 text-sm font-medium text-left">Status</th>
                  <th className="p-4 text-sm font-medium text-left">Joined</th>
                  <th className="p-4 text-sm font-medium text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
                          <span className="text-sm font-medium text-primary-600">{user.name?.[0]}</span>
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{user.email}</td>
                    <td className="p-4">
                      <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} className="px-2 py-1 text-sm border border-gray-200 rounded dark:border-gray-600 dark:bg-gray-700">
                        <option value="customer">Customer</option>
                        <option value="restaurant_owner">Restaurant Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleActive(user._id, user.isActive)} className={`text-xs px-3 py-1 rounded ${user.isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDeleteUser(user._id, user.name)} className="flex items-center gap-1 px-3 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                          <HiTrash className="w-3 h-3" /> Delete
                        </button>
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

export default AdminUsers;