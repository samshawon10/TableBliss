import { useState, useEffect, useRef } from 'react';
import { ownerAPI } from '../../services/api';
import { HiOfficeBuilding, HiPencil, HiTrash, HiPlus, HiClock, HiStar, HiPhotograph, HiX } from 'react-icons/hi';
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
  
  // Photo upload states
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  
  const coverInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async () => {
    try {
      const { data } = await ownerAPI.getRestaurants();
      setRestaurants(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if we have files to upload — use FormData
    const hasFiles = coverFile || logoFile || galleryFiles.length > 0;
    
    if (hasFiles) {
      const formDataObj = new FormData();
      
      // Add text fields
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('shortDescription', formData.shortDescription);
      formDataObj.append('cuisine', JSON.stringify(formData.cuisine.split(',').map(c => c.trim())));
      formDataObj.append('priceRange', formData.priceRange);
      formDataObj.append('address', JSON.stringify({
        street: formData['address.street'],
        city: formData['address.city'],
        state: formData['address.state'],
        zipCode: formData['address.zipCode'],
      }));
      formDataObj.append('contact', JSON.stringify({
        phone: formData['contact.phone'],
        email: formData['contact.email'],
        website: formData['contact.website'],
      }));
      formDataObj.append('capacity', JSON.stringify({
        total: parseInt(formData['capacity.total']),
        indoor: parseInt(formData['capacity.indoor'] || 0),
        outdoor: parseInt(formData['capacity.outdoor'] || 0),
      }));
      formDataObj.append('operatingHours', JSON.stringify(operatingHours));
      formDataObj.append('features', JSON.stringify(selectedFeatures));
      formDataObj.append('location', JSON.stringify({ type: 'Point', coordinates: [0, 0] }));
      
      // Add files
      if (coverFile) formDataObj.append('cover', coverFile);
      if (logoFile) formDataObj.append('logo', logoFile);
      galleryFiles.forEach(file => formDataObj.append('gallery', file));

      try {
        if (editingRestaurant) {
          await ownerAPI.updateRestaurant(editingRestaurant._id, formDataObj);
          Swal.fire({ icon: 'success', title: 'Restaurant updated!' });
        } else {
          await ownerAPI.createRestaurant(formDataObj);
          Swal.fire({ icon: 'success', title: 'Restaurant created!' });
        }
        setShowModal(false);
        setEditingRestaurant(null);
        resetForm();
        fetchRestaurants();
      } catch (error) {
        Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Operation failed' });
      }
    } else {
      // No files — send regular JSON
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

      try {
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
    
    // Reset photo states
    setCoverFile(null);
    setCoverPreview(null);
    setLogoFile(null);
    setLogoPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    
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
    setCoverFile(null);
    setCoverPreview(null);
    setLogoFile(null);
    setLogoPreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setActiveTab('basic');
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]);
  };

  const updateHours = (day, field, value) => {
    setOperatingHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Restaurants</h1>
          <button onClick={() => { resetForm(); setEditingRestaurant(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-primary-500 hover:bg-primary-600">
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
                {['basic', 'hours', 'features', 'photos'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab === 'basic' ? 'Basic Info' : tab === 'hours' ? 'Hours' : tab === 'features' ? 'Features' : 'Photos'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {activeTab === 'basic' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block mb-1 text-sm font-medium">Restaurant Name *</label>
                        <input name="name" value={formData.name} onChange={handleChange} required className="input-field" />
                      </div>
                      <div className="col-span-2">
                        <label className="block mb-1 text-sm font-medium">Short Description</label>
                        <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} maxLength={200} className="input-field" placeholder="Brief tagline" />
                      </div>
                      <div className="col-span-2">
                        <label className="block mb-1 text-sm font-medium">Description *</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="input-field" />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Cuisine *</label>
                        <input name="cuisine" value={formData.cuisine} onChange={handleChange} placeholder="Italian, Mexican, ..." className="input-field" />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Price Range</label>
                        <select name="priceRange" value={formData.priceRange} onChange={handleChange} className="input-field">
                          <option value="$">$ - Budget</option>
                          <option value="$$">$$ - Moderate</option>
                          <option value="$$$">$$$ - Premium</option>
                          <option value="$$$$">$$$$ - Luxury</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <h4 className="mb-3 font-medium">Address</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block mb-1 text-sm font-medium">Street *</label>
                          <input name="address.street" value={formData['address.street']} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium">City *</label>
                          <input name="address.city" value={formData['address.city']} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium">State *</label>
                          <input name="address.state" value={formData['address.state']} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium">Zip Code *</label>
                          <input name="address.zipCode" value={formData['address.zipCode']} onChange={handleChange} required className="input-field" />
                        </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Capacity (total) *</label>
                        <input name="capacity.total" value={formData['capacity.total']} onChange={handleChange} type="number" min="1" className="input-field" />
                      </div>
                    </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <h4 className="mb-3 font-medium">Contact</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium">Phone *</label>
                          <input name="contact.phone" value={formData['contact.phone']} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium">Email *</label>
                          <input name="contact.email" value={formData['contact.email']} onChange={handleChange} type="email" required className="input-field" />
                        </div>
                        <div className="col-span-2">
                          <label className="block mb-1 text-sm font-medium">Website (optional)</label>
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
                      <div key={day} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                        <div className="w-28">
                          <label className="flex items-center gap-2 text-sm font-medium capitalize">
                            <input type="checkbox" checked={operatingHours[day].isOpen} onChange={(e) => updateHours(day, 'isOpen', e.target.checked)} className="border-gray-300 rounded text-primary-500 focus:ring-primary-500" />
                            {day}
                          </label>
                        </div>
                        {operatingHours[day].isOpen ? (
                            <div className="flex items-center gap-2">
                              <input type="time" value={operatingHours[day].open} onChange={(e) => updateHours(day, 'open', e.target.value)} className="w-32 text-sm input-field" />
                              <span className="text-gray-400">to</span>
                              <input type="time" value={operatingHours[day].close} onChange={(e) => updateHours(day, 'close', e.target.value)} className="w-32 text-sm input-field" />
                            </div>
                          ) : <span className="text-sm text-red-400">Closed</span>}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Select the features and amenities your restaurant offers.</p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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

                {activeTab === 'photos' && (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-500">Upload photos for your restaurant. Supported formats: JPG, PNG, WebP (max 5MB each).</p>
                    
                    {/* Cover Photo */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">Cover Photo</label>
                      <div
                        onClick={() => coverInputRef.current?.click()}
                        className="relative flex items-center justify-center w-full h-48 overflow-hidden border-2 border-gray-300 border-dashed rounded-lg cursor-pointer dark:border-gray-600 hover:border-primary-400 bg-gray-50 dark:bg-gray-900/50"
                      >
                        {coverPreview ? (
                          <>
                            <img src={coverPreview} alt="Cover preview" className="object-cover w-full h-full" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null); }}
                              className="absolute p-1 text-white bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                            >
                              <HiX className="w-4 h-4" />
                            </button>
                          </>
                        ) : editingRestaurant?.images?.cover ? (
                          <>
                            <img src={editingRestaurant.images.cover} alt="Current cover" className="object-cover w-full h-full" />
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/40 hover:opacity-100">
                              <span className="text-sm text-white">Click to change cover photo</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <HiPhotograph className="w-10 h-10 mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Click to upload cover photo</p>
                          </div>
                        )}
                        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                      </div>
                    </div>

                    {/* Logo */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">Logo</label>
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="relative flex items-center justify-center w-32 h-32 mx-auto overflow-hidden border-2 border-gray-300 border-dashed rounded-full cursor-pointer dark:border-gray-600 hover:border-primary-400 bg-gray-50 dark:bg-gray-900/50"
                      >
                        {logoPreview ? (
                          <>
                            <img src={logoPreview} alt="Logo preview" className="object-cover w-full h-full" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null); }}
                              className="absolute p-1 text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600"
                            >
                              <HiX className="w-3 h-3" />
                            </button>
                          </>
                        ) : editingRestaurant?.images?.logo ? (
                          <>
                            <img src={editingRestaurant.images.logo} alt="Current logo" className="object-cover w-full h-full" />
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity rounded-full opacity-0 bg-black/40 hover:opacity-100">
                              <span className="text-xs text-white">Change</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <HiPhotograph className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="mt-1 text-xs text-gray-500">Logo</p>
                          </div>
                        )}
                        <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      </div>
                    </div>

                    {/* Gallery */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">Gallery Images</label>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {galleryPreviews.map((preview, index) => (
                          <div key={index} className="relative h-24 overflow-hidden rounded-lg">
                            <img src={preview} alt={`Gallery ${index + 1}`} className="object-cover w-full h-full" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute p-0.5 text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600"
                            >
                              <HiX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <div
                          onClick={() => galleryInputRef.current?.click()}
                          className="flex items-center justify-center h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer dark:border-gray-600 hover:border-primary-400 bg-gray-50 dark:bg-gray-900/50"
                        >
                          <div className="text-center">
                            <HiPlus className="w-6 h-6 mx-auto text-gray-400" />
                            <p className="text-xs text-gray-500">Add image</p>
                          </div>
                        </div>
                      </div>
                      {editingRestaurant?.images?.gallery?.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs text-gray-500">Existing gallery images ({editingRestaurant.images.gallery.length}):</p>
                          <div className="grid grid-cols-3 gap-3">
                            {editingRestaurant.images.gallery.map((url, i) => (
                              <div key={i} className="relative h-24 overflow-hidden rounded-lg">
                                <img src={url} alt={`Gallery ${i + 1}`} className="object-cover w-full h-full" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 btn-secondary">Cancel</button>
                  <button type="submit" className="px-6 btn-primary">{editingRestaurant ? 'Update' : 'Create'} Restaurant</button>
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