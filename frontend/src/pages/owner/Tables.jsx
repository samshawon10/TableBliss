

import { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/api';
import { HiTable, HiPencil, HiTrash, HiPlus, HiUserGroup, HiTag, HiHome, HiSun, HiOfficeBuilding, HiStar, HiSparkles } from 'react-icons/hi';
import Swal from 'sweetalert2';

const SECTION_CONFIG = {
  indoor: { label: 'Indoor', icon: HiHome, color: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500' },
  outdoor: { label: 'Outdoor', icon: HiSun, color: 'bg-green-50 text-green-600 border-green-200', dot: 'bg-green-500' },
  patio: { label: 'Patio', icon: HiStar, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
  bar: { label: 'Bar', icon: HiSparkles, color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500' },
  private: { label: 'Private', icon: HiOfficeBuilding, color: 'bg-purple-50 text-purple-600 border-purple-200', dot: 'bg-purple-500' },
};

const OwnerTables = () => {
  const [tables, setTables] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [filterSection, setFilterSection] = useState('');
  const [filterRestaurant, setFilterRestaurant] = useState('');
  const [formData, setFormData] = useState({
    restaurant: '',
    tableNumber: '',
    capacity: 4,
    section: 'indoor',
    description: '',
    minimumGuests: 1,
    maximumGuests: 10,
    isAvailable: true,
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tableRes, restRes] = await Promise.all([
        ownerAPI.getTables(),
        ownerAPI.getRestaurants()
      ]);
      setTables(tableRes.data.data);
      setRestaurants(restRes.data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        capacity: parseInt(formData.capacity),
        minimumGuests: parseInt(formData.minimumGuests),
        maximumGuests: parseInt(formData.maximumGuests),
      };
      if (editingTable) {
        await ownerAPI.updateTable(editingTable._id, data);
        Swal.fire({ icon: 'success', title: 'Table updated!' });
      } else {
        await ownerAPI.createTable(data);
        Swal.fire({ icon: 'success', title: 'Table created!' });
      }
      setShowModal(false); setEditingTable(null); resetForm(); fetchData();
    } catch (error) {
      Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Delete table?', text: 'This will affect existing reservations for this table.', showCancelButton: true, confirmButtonText: 'Yes, delete it' });
    if (result.isConfirmed) {
      try { await ownerAPI.deleteTable(id); Swal.fire({ icon: 'success', title: 'Deleted' }); fetchData(); }
      catch (error) { Swal.fire({ icon: 'error', title: 'Delete failed' }); }
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      restaurant: table.restaurant?._id || '',
      tableNumber: table.tableNumber || '',
      capacity: table.capacity || 4,
      section: table.section || 'indoor',
      description: table.description || '',
      minimumGuests: table.minimumGuests || 1,
      maximumGuests: table.maximumGuests || 10,
      isAvailable: table.isAvailable !== false,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ restaurant: '', tableNumber: '', capacity: 4, section: 'indoor', description: '', minimumGuests: 1, maximumGuests: 10, isAvailable: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Filter tables
  const filteredTables = tables.filter(t => {
    if (filterSection && t.section !== filterSection) return false;
    if (filterRestaurant && t.restaurant?._id !== filterRestaurant && t.restaurant !== filterRestaurant) return false;
    return true;
  });

  // Group by restaurant
  const groupedByRestaurant = {};
  filteredTables.forEach(t => {
    const restId = t.restaurant?._id || 'unknown';
    if (!groupedByRestaurant[restId]) groupedByRestaurant[restId] = { name: t.restaurant?.name || 'Unknown', tables: [] };
    groupedByRestaurant[restId].tables.push(t);
  });

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Tables</h1>
          <button onClick={() => { resetForm(); setEditingTable(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600">
            <HiPlus className="w-5 h-5" /> Add Table
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select value={filterRestaurant} onChange={(e) => setFilterRestaurant(e.target.value)} className="input-field w-auto text-sm">
            <option value="">All Restaurants</option>
            {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
          {Object.entries(SECTION_CONFIG).map(([key, config]) => (
            <button key={key} onClick={() => setFilterSection(filterSection === key ? '' : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                filterSection === key ? config.color + ' ring-2' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}>
              <config.icon className="w-4 h-4" />
              {config.label}
            </button>
          ))}
          {filterSection && (
            <button onClick={() => setFilterSection('')} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
          )}
        </div>

        {loading ? <p className="py-12 text-center text-gray-500">Loading...</p> :
         tables.length === 0 ? (
           <div className="text-center py-12">
             <HiTable className="w-16 h-16 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500">No tables yet. Add your first table to get started.</p>
           </div>
         ) : Object.keys(groupedByRestaurant).length === 0 ? (
           <p className="py-12 text-center text-gray-500">No tables match your filters</p>
         ) : (
           Object.entries(groupedByRestaurant).map(([restId, group]) => (
             <div key={restId} className="mb-8">
               <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                 <HiTable className="w-5 h-5 text-primary-500" />
                 {group.name}
                 <span className="text-sm font-normal text-gray-400">({group.tables.length} tables)</span>
               </h2>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                 {group.tables.map((table) => {
                   const section = SECTION_CONFIG[table.section] || SECTION_CONFIG.indoor;
                   return (
                     <div key={table._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                       {/* Table header with section color */}
                       <div className={`h-2 rounded-t-xl ${section.color.split(' ')[0]}`} />
                       
                       <div className="p-5">
                         <div className="flex items-start justify-between mb-3">
                           <div className="flex items-center gap-3">
                             <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center border`}>
                               <HiTable className="w-6 h-6" />
                             </div>
                             <div>
                               <h3 className="font-bold text-lg">Table {table.tableNumber}</h3>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                 <section.icon className="w-3.5 h-3.5" />
                                 <span className={`text-xs font-medium capitalize ${section.color.split(' ')[1] || 'text-gray-500'}`}>{section.label}</span>
                               </div>
                             </div>
                           </div>
                           <div className={`w-2.5 h-2.5 rounded-full ${table.isAvailable ? 'bg-green-500' : 'bg-red-400'}`} title={table.isAvailable ? 'Available' : 'Unavailable'} />
                         </div>

                         <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                           <span className="flex items-center gap-1.5">
                             <HiUserGroup className="w-4 h-4" />
                             <span className="font-medium text-gray-700 dark:text-gray-300">{table.capacity} seats</span>
                           </span>
                           <span className="flex items-center gap-1.5">
                             <HiTag className="w-4 h-4" />
                             <span>{table.minimumGuests}-{table.maximumGuests} guests</span>
                           </span>
                         </div>

                         {table.description && (
                           <p className="text-xs text-gray-400 mb-3 italic">{table.description}</p>
                         )}

                         <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                           <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {table.isActive ? 'Active' : 'Inactive'}
                           </span>
                           <div className="ml-auto flex gap-1.5">
                             <button onClick={() => handleEdit(table)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><HiPencil className="w-3.5 h-3.5" /></button>
                             <button onClick={() => handleDelete(table._id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><HiTrash className="w-3.5 h-3.5" /></button>
                           </div>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           ))
         )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
            <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <HiTable className="w-5 h-5 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold">{editingTable ? 'Edit Table' : 'Add New Table'}</h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Restaurant *</label>
                  <select name="restaurant" value={formData.restaurant} onChange={handleChange} required className="input-field">
                    <option value="">Select Restaurant</option>
                    {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Table Number *</label>
                    <input name="tableNumber" value={formData.tableNumber} onChange={handleChange} placeholder="e.g., T1, A2" required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Capacity (seats) *</label>
                    <input name="capacity" value={formData.capacity} onChange={handleChange} type="number" min="1" max="50" required className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Section / Location</label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(SECTION_CONFIG).map(([key, config]) => (
                      <button key={key} type="button" onClick={() => setFormData(prev => ({ ...prev, section: key }))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                          formData.section === key
                            ? config.color + ' ring-2'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}>
                        <config.icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{config.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Guests</label>
                    <input name="minimumGuests" value={formData.minimumGuests} onChange={handleChange} type="number" min="1" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Guests</label>
                    <input name="maximumGuests" value={formData.maximumGuests} onChange={handleChange} type="number" min="1" className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="input-field" placeholder="Window table, near entrance, etc." />
                </div>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                  <div>
                    <span className="text-sm font-medium">Available for booking</span>
                    <p className="text-xs text-gray-500">Uncheck to temporarily disable this table</p>
                  </div>
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">Cancel</button>
                  <button type="submit" className="btn-primary px-6">{editingTable ? 'Update' : 'Create'} Table</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerTables;