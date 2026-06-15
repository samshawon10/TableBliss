

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { HiStar, HiLocationMarker, HiUser, HiCheck, HiExclamation, HiSearch } from 'react-icons/hi';

const STATUS_TABS = [
  { value: 'all', label: 'All', color: 'bg-gray-500' },
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'inactive', label: 'Pending / Deactivated', color: 'bg-yellow-500' },
];

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const { data } = await adminAPI.getAllRestaurants(params);
      setRestaurants(data.data || []);
      const [allRes, activeRes, inactiveRes] = await Promise.all([
        adminAPI.getAllRestaurants({ limit: 1 }),
        adminAPI.getAllRestaurants({ status: 'active', limit: 1 }),
        adminAPI.getAllRestaurants({ status: 'inactive', limit: 1 }),
      ]);
      setStats({
        total: allRes.data.pagination?.total || 0,
        active: activeRes.data.pagination?.total || 0,
        inactive: inactiveRes.data.pagination?.total || 0,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Failed to load restaurants' });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, [filter]);
  useEffect(() => { fetchRestaurants(); }, []);

  const handleToggleActive = async (id, currentStatus, name) => {
    const newStatus = !currentStatus;
    const result = await Swal.fire({
      title: newStatus ? 'Approve restaurant?' : 'Deactivate restaurant?',
      text: newStatus ? `Make "${name}" visible to customers.` : `Hide "${name}" from customers?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: newStatus ? 'Approve' : 'Deactivate',
    });
    if (result.isConfirmed) {
      try {
        await adminAPI.updateRestaurantStatus(id, { isActive: newStatus });
        Swal.fire({ icon: 'success', title: newStatus ? 'Restaurant approved!' : 'Restaurant deactivated!', timer: 2000, showConfirmButton: false });
        fetchRestaurants();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Failed to update status' });
      }
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete "${name}"?`,
      text: 'This will permanently remove the restaurant and all its data.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Delete',
    });
    if (result.isConfirmed) {
      try {
        await adminAPI.deleteRestaurant(id);
        Swal.fire({ icon: 'success', title: 'Deleted' });
        fetchRestaurants();
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Delete failed' });
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const filteredRestaurants = restaurants.filter((r) => {
    if (filter === 'active') return r.isActive;
    if (filter === 'inactive') return !r.isActive;
    return true;
  });

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Manage Restaurants</h1>
            <p className="text-sm text-gray-500">Approve, deactivate, and manage all restaurants</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
            <p className="text-xs text-gray-500">Pending / Inactive</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {STATUS_TABS.map((tab) => (
              <button key={tab.value} onClick={() => setFilter(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.value
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}>
                <span className={`w-2 h-2 rounded-full ${tab.color}`} />
                {tab.label}
                <span className="text-xs opacity-70">
                  {tab.value === 'all' ? stats.total : tab.value === 'active' ? stats.active : stats.inactive}
                </span>
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex-1 ml-auto">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants..." className="input-field pl-9 w-full" />
            </div>
          </form>
        </div>

        {/* Restaurant List */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No restaurants found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((r) => (
              <div key={r._id} className={`overflow-hidden bg-white dark:bg-gray-800 rounded-xl border shadow-sm transition-all hover:shadow-md ${
                !r.isActive ? 'border-yellow-200 dark:border-yellow-900/30 ring-1 ring-yellow-100 dark:ring-yellow-900/20' : 'border-gray-100 dark:border-gray-700'
              }`}>
                <div className="relative h-36 bg-gray-200 dark:bg-gray-700">
                  <img src={r.images?.cover || r.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'} alt={r.name} className="object-cover w-full h-full" />
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm ${
                      r.isActive ? 'bg-green-500/90 text-white' : 'bg-yellow-500/90 text-white'
                    }`}>
                      {r.isActive ? <HiCheck className="w-3 h-3" /> : <HiExclamation className="w-3 h-3" />}
                      {r.isActive ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base">{r.name}</h3>
                    <span className="flex items-center gap-0.5 text-sm text-yellow-500">
                      <HiStar className="w-4 h-4 fill-current" />
                      {typeof r.rating === 'number' ? r.rating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <p className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <HiLocationMarker className="w-3.5 h-3.5 flex-shrink-0" />
                    {r.address?.city || r.location?.city || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 mb-1">
                    Cuisine: {r.cuisine?.join(', ') || 'N/A'} · {r.priceRange || '$$'}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <HiUser className="w-3 h-3" /> Owner: {r.owner?.name || r.owner?.email || 'N/A'}
                  </p>
                  {!r.isActive && (
                    <div className="flex items-center gap-2 p-2 mb-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                      <HiExclamation className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      <span className="text-xs text-yellow-700">This restaurant is not visible to customers. Approve to make it public.</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleActive(r._id, r.isActive, r.name)}
                      className={`flex-1 flex items-center justify-center gap-1 text-xs py-2 px-3 rounded-lg font-medium transition-colors ${
                        r.isActive
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}>
                      {r.isActive ? 'Deactivate' : 'Approve'}
                    </button>
                    <button onClick={() => handleDelete(r._id, r.name)}
                      className="flex items-center justify-center text-xs py-2 px-3 rounded-lg font-medium text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurants;