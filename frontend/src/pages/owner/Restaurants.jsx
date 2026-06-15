

import { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/api';
import { HiOfficeBuilding, HiPencil, HiTrash, HiPlus, HiClock, HiStar } from 'react-icons/hi';
import Swal from 'sweetalert2';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const FEATURES = [
  'reservations', 'walk-ins', 'outdoor-seating', 'private-dining', 'wheelchair-accessible',
  'parking', 'wifi', 'live-music', 'bar', 'vegan-options', 'gluten-free', 'kids-menu', 'takeout', 'delivery'
];

const defaultHours = () => DAYS.reduce((acc, day) => ({ ...acc, [day]: { open: '09:00', close: '22:00', isOpen: true } }), {});

const OwnerRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    cuisine: '',
    priceRange: '$$',
    'address.street': '',
    'address.city': '',
    'address.state': '',
    'address.zipCode': '',
    'contact.phone': '',
    'contact.email': '',
    'contact.website': '',
    'capacity.total': 50,
    'capacity.indoor': 30,
    'capacity.outdoor': 20,
  });
  const [operatingHours, setOperatingHours] = useState(defaultHours());
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async () => {
    try {
      const { data } = await ownerAPI.getRestaurants();
      setRestaurants(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const restaurantData = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        cuisine: formData.cuisine.split(',').map(c => c.trim()),
        priceRange: formData.priceRange,
        address: {
          street: formData['address.street'],
          city: formData['address.city'],
          state: formData['address.state'],
          zipCode: formData['address.zipCode'],
        },
        location: { type: 'Point', coordinates: [0, 0] },
        contact: {
          phone: formData['contact.phone'],
          email: formData['contact.email'],
          website: formData['contact.website'],
        },
        capacity: {
          total: parseInt(formData['capacity.total']),
          indoor: parseInt(formData['capacity.indoor'] || 0),
          outdoor: parseInt(formData['capacity.outdoor'] || 0),
        },
        operatingHours,
        features: selectedFeatures,
      };

      if (editingRestaurant) {
        await ownerAPI.updateRestaurant(editingRestaurant._id, restaurantData);
        Swal.fire({ icon: 'success', title: 'Restaurant updated!' });
      } else {
        await ownerAPI.createRestaurant(restaurantData);
        Swal.fire({ icon: 'success', title: 'Restaurant created!' });
      }
      setShowModal(false);
      setEditingRestaurant(null);
      resetForm();
      fetchRestaurants();
    } catch (error) {
      Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: 'warning', title: 'Delete restaurant?',
      text: 'All related data will also be removed.',
      showCancelButton: true, confirmButtonText: 'Yes, delete it',
    });
    if (result.isConfirmed) {
      try { await ownerAPI.deleteRestaurant(id); Swal.fire({ icon: 'success', title: 'Deleted' }); fetchRestaurants(); }
      catch (error) { Swal.fire({ icon: 'error', title: 'Delete failed' }); }
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name || '',
      description: restaurant.description || '',
      shortDescription: restaurant.shortDescription || '',
      cuisine: restaurant.cuisine?.join(', ') || '',
      priceRange: restaurant.priceRange || '$$',
      'address.street': restaurant.address?.street || '',
      'address.city': restaurant.address?.city || '',
      'address.state': restaurant.address?.state || '',
      'address.zipCode': restaurant.address?.zipCode || '',
      'contact.phone': restaurant.contact?.phone || '',
      'contact.email': restaurant.contact?.email || '',
      'contact.website': restaurant.contact?.website || '',
      'capacity.total': restaurant.capacity?.total || 50,
      'capacity.indoor': restaurant.capacity?.indoor || 0,
      'capacity.outdoor': restaurant.capacity?.outdoor || 0,
    });
    setOperatingHours(restaurant.operatingHours || defaultHours());
    setSelectedFeatures(restaurant.features || []);
    setActiveTab('basic');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', shortDescription: '', cuisine: '', priceRange: '$$',
      'address.street': '', 'address.city': '', 'address.state': '', 'address.zipCode': '',
      'contact.phone': '', 'contact.email': '', 'contact.website': '',
      'capacity.total': 50, 'capacity.indoor': 30, 'capacity.outdoor': 20,
    });
    setOperatingHours(defaultHours());
    setSelectedFeatures([]);
    setActiveTab('basic');
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]);
  };

  const updateHours = (day, field, value) => {
    setOperatingHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Restaurants</h1>
          <button onClick={() => { resetForm(); setEditingRestaurant(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600">
            <HiPlus className="w-5 h-5" /> Add Restaurant
          </button>
        </div>

        {loading ? <p className="py-12 text-center text-gray-500">Loading...</p> :
         restaurants.length === 0 ? <p className="py-12 text-center text-gray-500">No restaurants yet</p> :
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((rest) => (
            <div key={rest._id} className="overflow-hidden bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <img src={rest.images?.cover || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'} alt={rest.name} className="object-cover w-full h-48" />
              <div className="p-5">
                <h3 className="text-lg font-bold">{rest.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{rest.cuisine?.join(', ')} · {rest.priceRange}</p>
                <p className="text-sm text-gray-500">{rest.address?.street}, {rest.address?.city}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rest.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {rest.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-sm text-gray-500">⭐ {typeof rest.rating === 'number' ? rest.rating.toFixed(1) : '0.0'}</span>
                  <span className="text-xs text-gray-400">{rest.features?.length || 0} features</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(rest)} className="flex items-center gap-1 px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
                    <HiPencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(rest._id)} className="flex items-center gap-1 px-3 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                    <HiTrash className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold">{editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}</h3>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {['basic', 'hours', 'features'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab === 'basic' ? 'Basic Info' : tab === 'hours' ? 'Hours' : 'Features'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {activeTab === 'basic' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Restaurant Name *</label>
                        <input name="name" value={formData.name} onChange={handleChange} required className="input-field" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Short Description</label>
                        <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} maxLength={200} className="input-field" placeholder="Brief tagline" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Description *</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cuisine *</label>
                        <input name="cuisine" value={formData.cuisine} onChange={handleChange} placeholder="Italian, Mexican, ..." className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Price Range</label>
                        <select name="priceRange" value={formData.priceRange} onChange={handleChange} className="input-field">
                          <option value="$">$ - Budget</option>
                          <option value="$$">$$ - Moderate</option>
                          <option value="$$$">$$$ - Premium</option>
                          <option value="$$$$">$$$$ - Luxury</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <h4 className="font-medium mb-3">Address</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Street *</label>
                          <input name="address.street" value={formData['address.street']} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">City *</label>
                          <input name="address.city" value={formData['address.city']} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">State *</label>
                          <input name="address.state" value={formData['address.state']} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Zip Code *</label>
                          <input name="address.zipCode" value={formData['address.zipCode']} onChange={handleChange} required className="input-field" />
                        </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Capacity (total) *</label>
                        <input name="capacity.total" value={formData['capacity.total']} onChange={handleChange} type="number" min="1" className="input-field" />
                      </div>
                    </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <h4 className="font-medium mb-3">Contact</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone *</label>
                          <input name="contact.phone" value={formData['contact.phone']} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email *</label>
                          <input name="contact.email" value={formData['contact.email']} onChange={handleChange} type="email" required className="input-field" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Website (optional)</label>
                          <input name="contact.website" value={formData['contact.website']} onChange={handleChange} className="input-field" placeholder="https://" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'hours' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Set the operating hours for each day of the week.</p>
                    {DAYS.map((day) => (
                      <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="w-28">
                          <label className="flex items-center gap-2 text-sm font-medium capitalize">
                            <input type="checkbox" checked={operatingHours[day].isOpen} onChange={(e) => updateHours(day, 'isOpen', e.target.checked)} className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                            {day}
                          </label>
                        </div>
                        {operatingHours[day].isOpen ? (
                            <div className="flex items-center gap-2">
                              <input type="time" value={operatingHours[day].open} onChange={(e) => updateHours(day, 'open', e.target.value)} className="input-field w-32 text-sm" />
                              <span className="text-gray-400">to</span>
                              <input type="time" value={operatingHours[day].close} onChange={(e) => updateHours(day, 'close', e.target.value)} className="input-field w-32 text-sm" />
                            </div>
                          ) : <span className="text-sm text-red-400">Closed</span>}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Select the features and amenities your restaurant offers.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {FEATURES.map((feature) => (
                        <button key={feature} type="button" onClick={() => toggleFeature(feature)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all border text-left ${
                            selectedFeatures.includes(feature)
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 text-gray-600 dark:text-gray-400'
                          }`}>
                          <span className="capitalize">{feature.replace(/-/g, ' ')}</span>
                          {selectedFeatures.includes(feature) && <span className="ml-2 text-primary-500">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6">Cancel</button>
                  <button type="submit" className="btn-primary px-6">{editingRestaurant ? 'Update' : 'Create'} Restaurant</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerRestaurants;
