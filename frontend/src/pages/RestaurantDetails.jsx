

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurantAPI, menuAPI, reviewAPI, reservationAPI, authAPI, tableAPI } from '../services/api';
import { DetailSkeleton, MenuItemSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { HiStar, HiLocationMarker, HiClock, HiPhone, HiMail, HiHeart, HiShare, HiCalendar, HiUserGroup, HiChevronLeft, HiCheck, HiX, HiShieldCheck } from 'react-icons/hi';
import { FaQuoteLeft } from 'react-icons/fa';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [isFavorited, setIsFavorited] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    timeSlot: '',
    guestCount: 2,
    specialRequests: '',
    occasion: 'none',
    seatingPreference: 'any',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  const [fetchingTables, setFetchingTables] = useState(false);
  const [fetchingMenus, setFetchingMenus] = useState(false);

  // Review form state
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  useEffect(() => {
    if (user && user.favorites) {
      setIsFavorited(user.favorites.includes(id));
    }
  }, [user, id]);

  const fetchRestaurantData = async () => {
    setLoading(true);
    try {
      const [restRes, menuRes, reviewRes] = await Promise.all([
        restaurantAPI.getById(id),
        menuAPI.getByRestaurant(id),
        reviewAPI.getByRestaurant(id),
      ]);
      setRestaurant(restRes.data.data);
      setMenus(menuRes.data.data);
      setReviews(reviewRes.data.data);
      // Collect all menu items from all menus
      const allMenuItems = [];
      menuRes.data.data.forEach(menu => {
        menu.items.forEach(item => {
          allMenuItems.push({ ...item, menuName: menu.name, menuId: menu._id });
        });
      });
      setMenuItems(allMenuItems);
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (date) => {
    setBookingData({ ...bookingData, date });
    if (date) {
      try {
        const { data } = await reservationAPI.getTimeSlots(id, { date });
        setTimeSlots(data.data);
      } catch (error) {
        setTimeSlots([]);
      }
    }
  };

  const handleCheckAvailability = async () => {
    if (!bookingData.date || !bookingData.timeSlot) return;
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Sign in or Sign up required',
        text: 'You need to sign in or create an account to book a table.',
        showCancelButton: true,
        confirmButtonText: 'Sign In',
        cancelButtonText: 'Sign Up',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#22c55e',
      }).then((result) => {
        if (result.isConfirmed) navigate('/auth/login');
        else if (result.dismiss === Swal.DismissReason.cancel) navigate('/auth/register');
      });
      return;
    }
    setCheckingAvailability(true);
    try {
      const { data } = await reservationAPI.checkAvailability({
        restaurantId: id,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        guestCount: bookingData.guestCount,
      });
      setAvailability(data.data);
      if (data.data.isAvailable) {
        // Fetch available tables
        setFetchingTables(true);
        try {
          const tableRes = await tableAPI.getByRestaurant(id);
          const availableTables = (tableRes.data.data || []).filter(t => t.isActive && t.isAvailable && t.capacity >= bookingData.guestCount && t.minimumGuests <= bookingData.guestCount);
          setTables(availableTables);
        } catch (e) { console.error(e); }
        setFetchingTables(false);
        setBookingStep(2);
      } else {
        Swal.fire({ icon: 'error', title: 'Not available', text: 'No tables available for this date and time. Please try different options.' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Availability check failed' });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const toggleMenuItemSelected = (item) => {
    const exists = selectedMenuItems.find(i => i._id === item._id);
    if (exists) {
      setSelectedMenuItems(prev => prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedMenuItems(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const updateMenuQuantity = (_id, qty) => {
    if (qty <= 0) {
      setSelectedMenuItems(prev => prev.filter(i => i._id !== _id));
    } else {
      setSelectedMenuItems(prev => prev.map(i => i._id === _id ? { ...i, quantity: qty } : i));
    }
  };

  const menuTotal = selectedMenuItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Sign in or Sign up required',
        text: 'You need to sign in or create an account to book a table.',
        showCancelButton: true,
        confirmButtonText: 'Sign In',
        cancelButtonText: 'Sign Up',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#22c55e',
      }).then((result) => {
        if (result.isConfirmed) navigate('/auth/login');
        else if (result.dismiss === Swal.DismissReason.cancel) navigate('/auth/register');
      });
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        restaurant: restaurant?._id || id,
        reservationDate: bookingData.date,
        timeSlot: bookingData.timeSlot,
        guestCount: bookingData.guestCount,
        specialRequests: bookingData.specialRequests,
        occasion: bookingData.occasion,
        seatingPreference: bookingData.seatingPreference,
        table: selectedTable?._id || undefined,
        contactInfo: {
          name: bookingData.contactName,
          phone: bookingData.contactPhone,
          email: bookingData.contactEmail,
        },
        selectedItems: selectedMenuItems.map(i => ({ menuItem: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        totalAmount: menuTotal,
      };
      const { data } = await reservationAPI.create(payload);
      setBookingConfirmed(true);
      Swal.fire({ icon: 'success', title: 'Reservation confirmed!', text: 'Check your email for details.' });
      setTimeout(() => {
        setBookingConfirmed(false);
        setBookingStep(1);
        setBookingData({ date: '', timeSlot: '', guestCount: 2, specialRequests: '', occasion: 'none', seatingPreference: 'any', contactName: '', contactPhone: '', contactEmail: '' });
        setTimeSlots([]);
        setAvailability(null);
        setSelectedTable(null);
        setSelectedMenuItems([]);
      }, 3000);
    } catch (error) {
      Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Failed to create reservation' });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleResetBooking = () => {
    setBookingStep(1);
    setAvailability(null);
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      Swal.fire({ icon: 'info', title: 'Please sign in to save favorites', confirmButtonText: 'Sign In' }).then((result) => {
        if (result.isConfirmed) navigate('/auth/login');
      });
      return;
    }
    try {
      const { data } = await authAPI.toggleFavorite(id);
      setIsFavorited(!isFavorited);
      // Update local user favorites
      if (user) {
        const updatedFavorites = isFavorited
          ? (user.favorites || []).filter((f) => f !== id)
          : [...(user.favorites || []), id];
        updateUser({ ...user, favorites: updatedFavorites });
      }
      Swal.fire({ icon: 'success', title: isFavorited ? 'Removed from favorites' : 'Added to favorites', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Failed to update favorites' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: restaurant?.name, text: `Check out ${restaurant?.name} on TableBliss!`, url });
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        Swal.fire({ icon: 'success', title: 'Link copied to clipboard!', timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Failed to copy link' });
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      Swal.fire({ icon: 'info', title: 'Please sign in to leave a review', confirmButtonText: 'Sign In' }).then((result) => {
        if (result.isConfirmed) navigate('/auth/login');
      });
      return;
    }
    if (!reviewForm.comment.trim()) {
      Swal.fire({ icon: 'error', title: 'Please write a review comment' });
      return;
    }
    setReviewLoading(true);
    try {
      const { data } = await reviewAPI.create(id, reviewForm);
      setReviews((prev) => [data.data, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      Swal.fire({ icon: 'success', title: 'Review submitted!', timer: 1500, showConfirmButton: false });
      setActiveTab('reviews');
    } catch (error) {
      Swal.fire({ icon: 'error', title: error.response?.data?.message || 'Failed to submit review' });
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <HiStar key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  const renderClickableStars = (currentRating, onChange) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="focus:outline-none">
          <HiStar className={`w-8 h-8 transition-colors ${star <= currentRating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'}`} />
        </button>
      ))}
    </div>
  );

  if (loading) return <div className="pt-20"><DetailSkeleton /></div>;
  if (!restaurant) return <div className="pt-20 text-center py-20">Restaurant not found</div>;

  const groupedMenuItems = {};
  menus.forEach((menu) => {
    menu.items.forEach((item) => {
      if (!groupedMenuItems[item.category]) groupedMenuItems[item.category] = [];
      groupedMenuItems[item.category].push(item);
    });
  });

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative h-72 md:h-96">
        <img src={restaurant.images?.cover || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors">
          <HiChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-gray-100">{restaurant.name}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    {renderStars(restaurant.rating)}
                    <span className="text-sm text-gray-500">({restaurant.totalReviews} reviews)</span>
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{restaurant.priceRange}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isFavorited ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    <HiHeart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                    <HiShare className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">{restaurant.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <HiLocationMarker className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{restaurant.address?.street}, {restaurant.address?.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <HiPhone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{restaurant.contact?.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <HiMail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{restaurant.contact?.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {restaurant.cuisine?.map((c) => (
                  <span key={c} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm rounded-full">{c}</span>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              {bookingConfirmed ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiCheck className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">Booking Confirmed!</h3>
                  <p className="text-sm text-gray-500">Your reservation has been made. Check your email for details.</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 mb-6">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center gap-1.5 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors flex-shrink-0 ${
                          bookingStep >= step ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>{step}</div>
                        <div className={`h-0.5 flex-1 transition-colors ${step < 4 ? (bookingStep > step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700') : 'hidden'}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {bookingStep === 1 ? 'Book a Table' : bookingStep === 2 ? 'Select Table' : bookingStep === 3 ? 'Menu & Extras' : 'Confirm'}
                    </h3>
                    {bookingStep > 1 && (
                      <button type="button" onClick={() => setBookingStep(prev => Math.max(1, prev - 1))} className="text-sm text-primary-500 hover:text-primary-600">← Back</button>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {bookingStep === 1 && (
                      <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Date</label>
                          <input type="date" value={bookingData.date} onChange={(e) => { handleDateChange(e.target.value); setAvailability(null); }} className="input-field" required min={new Date().toISOString().split('T')[0]} max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Time</label>
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.length === 0 ? (
                              <select value={bookingData.timeSlot} onChange={(e) => { setBookingData({ ...bookingData, timeSlot: e.target.value }); setAvailability(null); }} className="input-field col-span-3" required>
                                <option value="">{bookingData.date ? 'No slots available' : 'Select a date first'}</option>
                                {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                              </select>
                            ) : (
                              <div className="col-span-3 grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                                {timeSlots.map((slot) => (
                                  <button key={slot} type="button" onClick={() => { setBookingData({ ...bookingData, timeSlot: slot }); setAvailability(null); }}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                                      bookingData.timeSlot === slot
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 text-gray-700 dark:text-gray-300'
                                    }`}>{slot}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Number of Guests</label>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setBookingData({ ...bookingData, guestCount: Math.max(1, bookingData.guestCount - 1) })}
                              className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg font-medium">-</button>
                            <span className="w-12 text-center text-lg font-semibold">{bookingData.guestCount}</span>
                            <button type="button" onClick={() => setBookingData({ ...bookingData, guestCount: Math.min(20, bookingData.guestCount + 1) })}
                              className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg font-medium">+</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Seating Preference</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'any', label: 'No Preference', icon: '🪑' },
                              { value: 'indoor', label: 'Indoor', icon: '🏠' },
                              { value: 'outdoor', label: 'Outdoor', icon: '🌳' },
                            ].map((opt) => (
                              <button key={opt.value} type="button" onClick={() => setBookingData({ ...bookingData, seatingPreference: opt.value })}
                                className={`py-3 px-2 rounded-lg text-center transition-all border ${
                                  bookingData.seatingPreference === opt.value
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                                }`}>
                                <div className="text-lg mb-1">{opt.icon}</div>
                                <div className={`text-xs font-medium ${bookingData.seatingPreference === opt.value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>{opt.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <button type="button" onClick={handleCheckAvailability} disabled={!bookingData.date || !bookingData.timeSlot || checkingAvailability}
                          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                          {checkingAvailability ? (
                            <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Checking...</span>
                          ) : 'Check Availability'}
                        </button>
                      </motion.form>
                    )}

                    {bookingStep === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 space-y-2">
                          <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-500">Time</span><span className="font-medium">{bookingData.timeSlot}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-500">Guests</span><span className="font-medium">{bookingData.guestCount} people</span></div>
                        </div>
                        <p className="text-sm font-medium">Select a Table</p>
                        {fetchingTables ? (
                          <div className="py-6 text-center"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                        ) : tables.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No tables available for this party size</p>
                        ) : (
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {tables.map(table => (
                              <button key={table._id} type="button" onClick={() => setSelectedTable(table)}
                                className={`w-full p-3 rounded-lg border text-left transition-all ${
                                  selectedTable?._id === table._id
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                                }`}>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">Table {table.tableNumber}</span>
                                  <span className="text-xs text-gray-500">{table.capacity} seats</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 capitalize">{table.section}</span>
                                  {table.description && <span className="text-xs text-gray-400 truncate">{table.description}</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 space-y-2">
                          <label className="block text-sm font-medium">Occasion (optional)</label>
                          <select value={bookingData.occasion} onChange={(e) => setBookingData({ ...bookingData, occasion: e.target.value })} className="input-field text-sm">
                            <option value="none">None</option>
                            <option value="birthday">🎂 Birthday</option>
                            <option value="anniversary">💕 Anniversary</option>
                            <option value="date">🌹 Date Night</option>
                            <option value="business">💼 Business</option>
                          </select>
                          <label className="block text-sm font-medium">Special Requests</label>
                          <textarea value={bookingData.specialRequests} onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })} className="input-field text-sm" rows="2" placeholder="Allergies, preferences..." />
                        </div>
                        <button type="button" onClick={() => { if (selectedTable) setBookingStep(3); }} disabled={!selectedTable} className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                          Continue to Menu
                        </button>
                      </motion.div>
                    )}

                    {bookingStep === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <p className="text-sm font-medium">Select Menu Items (optional)</p>
                        {menuItems.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">No menu items available</p>
                        ) : (
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {menuItems.map(item => {
                              const selected = selectedMenuItems.find(i => i._id === item._id);
                              return (
                                <div key={item._id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                  {item.image ? <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" /> : <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-primary-500 font-medium">৳{item.price}</p>
                                  </div>
                                  {selected ? (
                                    <div className="flex items-center gap-2">
                                      <button type="button" onClick={() => updateMenuQuantity(item._id, selected.quantity - 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm">-</button>
                                      <span className="w-6 text-center text-sm font-medium">{selected.quantity}</span>
                                      <button type="button" onClick={() => updateMenuQuantity(item._id, selected.quantity + 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm">+</button>
                                    </div>
                                  ) : (
                                    <button type="button" onClick={() => toggleMenuItemSelected(item)} className="px-3 py-1 text-xs font-medium bg-primary-500 text-white rounded-lg">Add</button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {selectedMenuItems.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between text-sm font-medium"><span>Menu Total</span><span className="text-primary-500">৳{menuTotal}</span></div>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setBookingStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                          <button type="button" onClick={() => setBookingStep(4)} className="btn-primary flex-1 py-3">Continue</button>
                        </div>
                      </motion.div>
                    )}

                    {bookingStep === 4 && (
                      <motion.form key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleBooking} className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{bookingData.timeSlot}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-medium">{bookingData.guestCount}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Table</span><span className="font-medium">Table {selectedTable?.tableNumber} ({selectedTable?.section})</span></div>
                          {selectedMenuItems.length > 0 && <div className="flex justify-between"><span className="text-gray-500">Menu</span><span className="font-medium">৳{menuTotal}</span></div>}
                        </div>
                        <label className="block text-sm font-medium">Name *</label>
                        <input type="text" value={bookingData.contactName || user?.name || ''} onChange={(e) => setBookingData({ ...bookingData, contactName: e.target.value })} className="input-field" placeholder="Your name" required />
                        <label className="block text-sm font-medium">Phone *</label>
                        <input type="tel" value={bookingData.contactPhone || user?.phone || ''} onChange={(e) => setBookingData({ ...bookingData, contactPhone: e.target.value })} className="input-field" placeholder="+880..." required />
                        <label className="block text-sm font-medium">Email *</label>
                        <input type="email" value={bookingData.contactEmail || user?.email || ''} onChange={(e) => setBookingData({ ...bookingData, contactEmail: e.target.value })} className="input-field" placeholder="you@example.com" required />
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                          <HiShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>Your information is secure. We'll only use it for this reservation.</span>
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setBookingStep(3)} className="btn-secondary flex-1 py-3">Back</button>
                          <button type="submit" disabled={bookingLoading} className="btn-primary flex-[2] py-3 disabled:opacity-50">
                            {bookingLoading ? (
                              <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirming...</span>
                            ) : 'Confirm Booking'}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
            {[
              { key: 'menu', label: 'Menu' },
              { key: 'reviews', label: `Reviews (${reviews.length})` },
              { key: 'write-review', label: 'Write a Review' },
              { key: 'info', label: 'Information' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
                  activeTab === tab.key ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
              </button>
            ))}
          </div>

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div className="space-y-8">
              {Object.entries(groupedMenuItems).length === 0 ? (
                <p className="text-center text-gray-500 py-12">No menu items available</p>
              ) : (
                Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xl font-display font-semibold capitalize mb-4">{category.replace('-', ' ')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <div key={item._id} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                          {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold">{item.name}</h4>
                              <span className="font-semibold text-primary-500">৳{item.price}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            <div className="flex gap-2 mt-2">
                              {item.isVegetarian && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Vegetarian</span>}
                              {item.isGlutenFree && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">GF</span>}
                              {item.isSpicy && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Spicy</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary-600">{review.user?.name?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{review.user?.name}</p>
                        <div className="flex items-center gap-2">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    {review.title && <h4 className="font-semibold mb-1">{review.title}</h4>}
                    <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Write Review Tab */}
          {activeTab === 'write-review' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-6">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    {renderClickableStars(reviewForm.rating, (val) => setReviewForm({ ...reviewForm, rating: val }))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Title (optional)</label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      className="input-field"
                      placeholder="Summarize your experience"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="input-field"
                      rows="4"
                      placeholder="Share your dining experience..."
                      required
                      maxLength={1000}
                    />
                  </div>
                  <button type="submit" disabled={reviewLoading} className="btn-primary px-8">
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Operating Hours</h3>
                <div className="space-y-2">
                  {Object.entries(restaurant.operatingHours || {}).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-gray-500">{hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold mb-4">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.features?.map((f) => (
                    <span key={f} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full capitalize">{f.replace('-', ' ')}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;