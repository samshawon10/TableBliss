

import { useState, useEffect, useRef } from 'react';
import { ownerAPI } from '../../services/api';
import { HiDocumentText, HiPencil, HiTrash, HiPlus, HiPhotograph, HiX, HiClock, HiEye, HiEyeOff, HiSearch } from 'react-icons/hi';
import Swal from 'sweetalert2';

const CATEGORIES = [
  'appetizers', 'main-course', 'desserts', 'beverages', 'sides', 'specials', 'breakfast', 'lunch', 'dinner', 'wine', 'cocktails'
];

const MENU_CATEGORIES = ['all', 'breakfast', 'lunch', 'dinner', 'drinks', 'desserts', 'specials'];

const OwnerMenus = () => {
  const [menus, setMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [currentMenuId, setCurrentMenuId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const menuImageRef = useRef(null);

  const [menuForm, setMenuForm] = useState({ restaurant: '', name: 'Main Menu', description: '', category: 'all', startingPrice: '', serves: 1 });
  const [menuImageFile, setMenuImageFile] = useState(null);
  const [menuImagePreview, setMenuImagePreview] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '', description: '', price: '', category: 'main-course',
    isVegetarian: false, isVegan: false, isGlutenFree: false, isSpicy: false,
    isPopular: false, isAvailable: true, preparationTime: 15,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [menuRes, restRes] = await Promise.all([ownerAPI.getMenus(), ownerAPI.getRestaurants()]);
      setMenus(menuRes.data.data);
      setRestaurants(restRes.data.data);
      if (restRes.data.data.length === 1) {
        setMenuForm(prev => ({ ...prev, restaurant: restRes.data.data[0]._id }));
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const resetMenuForm = () => {
    const defaultRestaurant = restaurants.length === 1 ? restaurants[0]._id : '';
    setMenuForm({ restaurant: defaultRestaurant, name: 'Main Menu', description: '', category: 'all', startingPrice: '', serves: 1 });
    setMenuImageFile(null);
    setMenuImagePreview(null);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('restaurant', menuForm.restaurant);
      formData.append('name', menuForm.name);
      formData.append('description', menuForm.description);
      formData.append('category', menuForm.category);
      if (menuForm.startingPrice) formData.append('startingPrice', menuForm.startingPrice.toString());
      formData.append('serves', menuForm.serves.toString());
      if (menuImageFile) formData.append('image', menuImageFile);

      if (editingMenu) {
        await ownerAPI.updateMenu(editingMenu._id, formData);
        Swal.fire({ icon: 'success', title: 'Menu updated!' });
      } else {
        await ownerAPI.createMenu(formData);
        Swal.fire({ icon: 'success', title: 'Menu created!' });
      }
      setShowModal(false); setEditingMenu(null); resetMenuForm(); fetchData();
    } catch (error) {
      Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleMenuDelete = async (id) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Delete menu?', text: 'This will also delete all items in this menu', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it' });
    if (result.isConfirmed) {
      try { await ownerAPI.deleteMenu(id); Swal.fire({ icon: 'success', title: 'Deleted' }); fetchData(); }
      catch (error) { Swal.fire({ icon: 'error', title: 'Delete failed' }); }
    }
  };

  const handleMenuEdit = (menu) => {
    setEditingMenu(menu);
    setMenuForm({
      restaurant: menu.restaurant?._id || '',
      name: menu.name || '',
      description: menu.description || '',
      category: menu.category || 'all',
      startingPrice: menu.startingPrice || '',
      serves: menu.serves || 1,
    });
    setMenuImagePreview(menu.image || null);
    setMenuImageFile(null);
    setShowModal(true);
  };

  const handleMenuChange = (e) => setMenuForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleMenuImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { Swal.fire({ icon: 'error', title: 'Please select an image' }); return; }
    if (file.size > 5 * 1024 * 1024) { Swal.fire({ icon: 'error', title: 'Image must be less than 5MB' }); return; }
    setMenuImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMenuImagePreview(ev.target?.result);
    reader.readAsDataURL(file);
  };

  const clearMenuImage = () => { setMenuImagePreview(null); setMenuImageFile(null); if (menuImageRef.current) menuImageRef.current.value = ''; };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', itemForm.name);
      formData.append('description', itemForm.description);
      formData.append('price', itemForm.price.toString());
      formData.append('category', itemForm.category);
      formData.append('preparationTime', itemForm.preparationTime.toString());
      formData.append('isVegetarian', itemForm.isVegetarian.toString());
      formData.append('isVegan', itemForm.isVegan.toString());
      formData.append('isGlutenFree', itemForm.isGlutenFree.toString());
      formData.append('isSpicy', itemForm.isSpicy.toString());
      formData.append('isPopular', itemForm.isPopular.toString());
      formData.append('isAvailable', itemForm.isAvailable.toString());
      if (imageFile) formData.append('image', imageFile);

      if (editingItem) {
        await ownerAPI.updateMenuItem(currentMenuId, editingItem._id, formData);
        Swal.fire({ icon: 'success', title: 'Item updated!' });
      } else {
        await ownerAPI.addMenuItem(currentMenuId, formData);
        Swal.fire({ icon: 'success', title: 'Item added!' });
      }
      setShowItemModal(false); setEditingItem(null); setCurrentMenuId(null); resetItemForm(); fetchData();
    } catch (error) {
      Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Operation failed' });
    }
  };

  const handleItemDelete = async (menuId, itemId) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Delete item?', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, delete it' });
    if (result.isConfirmed) {
      try { await ownerAPI.deleteMenuItem(menuId, itemId); Swal.fire({ icon: 'success', title: 'Deleted' }); fetchData(); }
      catch (error) { Swal.fire({ icon: 'error', title: 'Delete failed' }); }
    }
  };

  const handleItemEdit = (menuId, item) => {
    setCurrentMenuId(menuId);
    setEditingItem(item);
    setItemForm({
      name: item.name || '', description: item.description || '', price: item.price || '',
      category: item.category || 'main-course', isVegetarian: item.isVegetarian || false,
      isVegan: item.isVegan || false, isGlutenFree: item.isGlutenFree || false,
      isSpicy: item.isSpicy || false, isPopular: item.isPopular || false,
      isAvailable: item.isAvailable !== false, preparationTime: item.preparationTime || 15,
    });
    setImagePreview(item.image || null);
    setImageFile(null);
    setShowItemModal(true);
  };

  const openAddItem = (menuId) => {
    setCurrentMenuId(menuId); setEditingItem(null); resetItemForm(); setShowItemModal(true);
  };

  const resetItemForm = () => {
    setItemForm({
      name: '', description: '', price: '', category: 'main-course',
      isVegetarian: false, isVegan: false, isGlutenFree: false, isSpicy: false,
      isPopular: false, isAvailable: true, preparationTime: 15,
    });
    setImagePreview(null); setImageFile(null);
  };

  const handleItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setItemForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { Swal.fire({ icon: 'error', title: 'Please select an image' }); return; }
    if (file.size > 5 * 1024 * 1024) { Swal.fire({ icon: 'error', title: 'Image must be less than 5MB' }); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => { setImagePreview(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const toggleAvailability = async (menuId, item) => {
    try {
      const formData = new FormData();
      formData.append('isAvailable', (!item.isAvailable).toString());
      await ownerAPI.updateMenuItem(menuId, item._id, formData);
      fetchData();
    } catch (error) { Swal.fire({ icon: 'error', title: 'Failed to update availability' }); }
  };

  const getDietaryTags = (item) => {
    const tags = [];
    if (item.isVegetarian) tags.push({ label: '🌱 Veg', class: 'bg-green-100 text-green-700' });
    if (item.isVegan) tags.push({ label: '🥬 Vegan', class: 'bg-lime-100 text-lime-700' });
    if (item.isGlutenFree) tags.push({ label: '🌾 GF', class: 'bg-yellow-100 text-yellow-700' });
    if (item.isSpicy) tags.push({ label: '🌶️ Spicy', class: 'bg-red-100 text-red-700' });
    return tags;
  };

  const filterMenuItems = (items) => {
    return items.filter(item => {
      const matchCategory = !filterCategory || item.category === filterCategory;
      const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  };

  const totalItems = menus.reduce((sum, m) => sum + (m.items?.length || 0), 0);
  const totalValue = menus.reduce((sum, m) => sum + (m.items?.reduce((s, i) => s + (i.price || 0), 0) || 0), 0);

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Menus</h1>
            <p className="text-sm text-gray-500 mt-1">{totalItems} items across {menus.length} menus · Total value: ৳{totalValue}</p>
          </div>
          <button onClick={() => { resetMenuForm(); setEditingMenu(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
            <HiPlus className="w-5 h-5" /> Add Menu
          </button>
        </div>

        {/* Filters */}
        {menus.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..." className="input-field pl-9 text-sm" />
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field text-sm w-full sm:w-48">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : menus.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <HiDocumentText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No menus yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first menu to start adding items</p>
            <button onClick={() => { resetMenuForm(); setShowModal(true); }}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">Create Menu</button>
          </div>
        ) : (
          <div className="space-y-6">
            {menus.map((menu) => {
              const filteredItems = filterMenuItems(menu.items || []);
              return (
                <div key={menu._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {/* Menu Header */}
                  <div className="flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700">
                    {menu.image ? (
                      <img src={menu.image} alt={menu.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <HiDocumentText className="w-6 h-6 text-primary-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{menu.name}</h3>
                        {menu.category && menu.category !== 'all' && (
                          <span className="text-[10px] px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full font-medium capitalize">{menu.category}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <span>{menu.restaurant?.name}</span>
                        <span>·</span>
                        <span>{filteredItems.length} items</span>
                        {menu.startingPrice && <><span>·</span><span className="font-medium text-primary-500">From ৳{menu.startingPrice}</span></>}
                        {menu.serves > 1 && <><span>·</span><span>Serves {menu.serves}</span></>}
                        {menu.description && <><span>·</span><span className="truncate max-w-[200px]">{menu.description}</span></>}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openAddItem(menu._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                        <HiPlus className="w-3.5 h-3.5" /> Add Item
                      </button>
                      <button onClick={() => handleMenuEdit(menu)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                        <HiPencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleMenuDelete(menu._id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                        <HiTrash className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-5">
                    {filteredItems.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {filteredItems.map((item) => (
                          <div key={item._id} className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                            item.isAvailable === false
                              ? 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 opacity-60'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600 hover:shadow-sm'
                          }`}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <HiPhotograph className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold truncate">{item.name}</p>
                                {item.isPopular && <span className="text-xs">🔥</span>}
                                {item.isAvailable === false && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">Unavailable</span>}
                              </div>
                              <p className="text-xs text-gray-500 capitalize mt-0.5">{item.category?.replace('-', ' ')}</p>
                              {item.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>}
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {getDietaryTags(item).map((tag, i) => (
                                  <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${tag.class}`}>{tag.label}</span>
                                ))}
                                {item.preparationTime && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 flex items-center gap-0.5">
                                    <HiClock className="w-2.5 h-2.5" /> {item.preparationTime}m
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className="text-sm font-bold text-primary-500">৳{item.price}</span>
                              <div className="flex items-center gap-1">
                                <button onClick={() => toggleAvailability(menu._id, item)}
                                  className={`p-1.5 rounded-lg transition-colors ${item.isAvailable === false ? 'text-red-500 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
                                  title={item.isAvailable === false ? 'Mark as available' : 'Mark as unavailable'}>
                                  {item.isAvailable === false ? <HiEyeOff className="w-3.5 h-3.5" /> : <HiEye className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={() => handleItemEdit(menu._id, item)} className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                  <HiPencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleItemDelete(menu._id, item._id)} className="p-1.5 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                  <HiTrash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-4">
                        {searchQuery || filterCategory ? 'No items match your filters' : 'No items yet. Click "Add Item" to get started.'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Menu Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); clearMenuImage(); }}>
            <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-5 text-xl font-semibold">{editingMenu ? 'Edit Menu' : 'Create Menu'}</h3>
              <form onSubmit={handleMenuSubmit} className="space-y-4">
                {restaurants.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Restaurant *</label>
                    <select name="restaurant" value={menuForm.restaurant} onChange={handleMenuChange} required className="input-field">
                      <option value="">Select Restaurant</option>
                      {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                  </div>
                )}
                {restaurants.length === 1 && (
                  <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">📍 {restaurants[0].name}</div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Menu Name *</label>
                  <input name="name" value={menuForm.name} onChange={handleMenuChange} placeholder="e.g., Main Menu, Dinner Menu, Drinks Menu" required className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Menu Category</label>
                  <select name="category" value={menuForm.category} onChange={handleMenuChange} className="input-field">
                    {MENU_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea name="description" value={menuForm.description} onChange={handleMenuChange} placeholder="Brief description of this menu..." rows={2} className="input-field" />
                </div>

                {/* Menu Image */}
                <div>
                  <label className="block text-sm font-medium mb-1">Menu Cover Image</label>
                  <input ref={menuImageRef} type="file" accept="image/*" onChange={handleMenuImageChange} className="hidden" />
                  <button type="button" onClick={() => menuImageRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full justify-center">
                    <HiPhotograph className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">{menuImagePreview ? 'Change Image' : 'Click to upload cover image'}</span>
                  </button>
                  {menuImagePreview && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={menuImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                      <button type="button" onClick={clearMenuImage} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <HiX className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Price & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Starting Price (BDT)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">৳</span>
                      <input name="startingPrice" value={menuForm.startingPrice} onChange={handleMenuChange} type="number" step="0.01" min="0" placeholder="0.00" className="input-field pl-8" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Serves (Quantity)</label>
                    <input name="serves" value={menuForm.serves} onChange={handleMenuChange} type="number" min="1" max="100" className="input-field" />
                    <p className="text-[10px] text-gray-400 mt-0.5">How many people this menu serves</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => { setShowModal(false); clearMenuImage(); }} className="btn-secondary px-5">Cancel</button>
                  <button type="submit" className="btn-primary px-5">{editingMenu ? 'Update Menu' : 'Create Menu'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setShowItemModal(false); clearImage(); }}>
            <div className="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-5 text-xl font-semibold">{editingItem ? 'Edit Item' : 'Add Menu Item'}</h3>
              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Name *</label>
                  <input name="name" value={itemForm.name} onChange={handleItemChange} placeholder="e.g., Chicken Biryani" required className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select name="category" value={itemForm.category} onChange={handleItemChange} required className="input-field">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (BDT) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">৳</span>
                      <input name="price" value={itemForm.price} onChange={handleItemChange} type="number" step="0.01" min="0" placeholder="0.00" required className="input-field pl-8" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea name="description" value={itemForm.description} onChange={handleItemChange} required rows={2} className="input-field" placeholder="Describe the dish, ingredients, flavor..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Item Image</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full justify-center">
                    <HiPhotograph className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">{imagePreview ? 'Change Image' : 'Click to upload image'}</span>
                  </button>
                  {imagePreview && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                      <button type="button" onClick={clearImage} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><HiX className="w-5 h-5" /></button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
                    <input name="preparationTime" value={itemForm.preparationTime} onChange={handleItemChange} type="number" min="1" max="120" className="input-field" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 w-full">
                      <input type="checkbox" name="isAvailable" checked={itemForm.isAvailable} onChange={handleItemChange} className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                      <span className="text-sm font-medium">Available</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dietary Labels</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'isVegetarian', label: '🌱 Vegetarian' },
                      { name: 'isVegan', label: '🥬 Vegan' },
                      { name: 'isGlutenFree', label: '🌾 Gluten Free' },
                      { name: 'isSpicy', label: '🌶️ Spicy' },
                      { name: 'isPopular', label: '🔥 Popular' },
                    ].map(opt => (
                      <label key={opt.name} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        itemForm[opt.name] ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}>
                        <input type="checkbox" name={opt.name} checked={itemForm[opt.name]} onChange={handleItemChange} className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => { setShowItemModal(false); clearImage(); }} className="btn-secondary px-5">Cancel</button>
                  <button type="submit" className="btn-primary px-5">{editingItem ? 'Update Item' : 'Add Item'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMenus;